import axios from "axios";
import { config } from "../config/index.js";
import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

export interface WeatherData {
  temperatureCelsius: number;
  humidityPercent: number;
  rainfallMm: number;
  windSpeedKmh: number;
  windDirection: string;
  condition: string;
  uvIndex?: number;
  readingAt: Date;
}

export interface ForecastDay {
  forecastDate: string;
  temperatureCelsius: number;
  tempMin?: number;
  tempMax?: number;
  condition: string;
  rainfallMm: number;
  humidityPercent: number;
  precipitationProbability: number;
}

export class WeatherService {
  async getCurrentWeather(farmerId: string): Promise<WeatherData> {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      return {
        temperatureCelsius: 24.5,
        humidityPercent: 65,
        rainfallMm: 0,
        windSpeedKmh: 12,
        windDirection: "NE",
        condition: "Sunny",
        readingAt: new Date(),
      };
    }

    const latestReading = await prisma.weatherReading.findFirst({
      where: { farmerId: profile.id },
      orderBy: { readingAt: "desc" },
    });

    if (latestReading) {
      const hoursSinceReading =
        (Date.now() - new Date(latestReading.readingAt).getTime()) /
        (1000 * 60 * 60);

      if (hoursSinceReading < 1) {
        return {
          temperatureCelsius: Number(latestReading.temperatureCelsius),
          humidityPercent: Number(latestReading.humidityPercent),
          rainfallMm: Number(latestReading.rainfallMm),
          windSpeedKmh: Number(latestReading.windSpeedKmh || 0),
          windDirection: latestReading.windDirection || "N",
          condition: this.getConditionFromWeather(latestReading),
          uvIndex: latestReading.uvIndex
            ? Number(latestReading.uvIndex)
            : undefined,
          readingAt: latestReading.readingAt,
        };
      }
    }

    if (
      config.openWeatherMapApiKey &&
      profile.gpsLatitude &&
      profile.gpsLongitude
    ) {
      try {
        return await this.fetchFromOpenWeather(
          Number(profile.gpsLatitude),
          Number(profile.gpsLongitude),
        );
      } catch (error) {
        logger.error("Failed to fetch from OpenWeatherMap:", error);
      }
    }

    return {
      temperatureCelsius: 24.5,
      humidityPercent: 65,
      rainfallMm: 0,
      windSpeedKmh: 12,
      windDirection: "NE",
      condition: "Sunny",
      readingAt: new Date(),
    };
  }

  async getForecast(farmerId: string): Promise<ForecastDay[]> {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      return this.generateSimulatedForecast();
    }

    if (
      config.openWeatherMapApiKey &&
      profile.gpsLatitude &&
      profile.gpsLongitude
    ) {
      try {
        return await this.fetchForecastFromOpenWeather(
          Number(profile.gpsLatitude),
          Number(profile.gpsLongitude),
        );
      } catch (error) {
        console.error("Failed to fetch forecast:", error);
      }
    }

    return this.generateSimulatedForecast();
  }

  async fetchFromOpenWeather(lat: number, lon: number): Promise<WeatherData> {
    const apiKey = config.openWeatherMapApiKey;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    const response = await axios.get(url);
    const data = response.data;

    return {
      temperatureCelsius: data.main.temp,
      humidityPercent: data.main.humidity,
      rainfallMm: data.rain ? data.rain["1h"] || data.rain["3h"] || 0 : 0,
      windSpeedKmh: data.wind.speed * 3.6,
      windDirection: this.getWindDirection(data.wind.deg),
      condition: data.weather[0].main,
      uvIndex: undefined,
      readingAt: new Date(),
    };
  }

  async fetchForecastFromOpenWeather(
    lat: number,
    lon: number,
  ): Promise<ForecastDay[]> {
    const apiKey = config.openWeatherMapApiKey;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    const response = await axios.get(url);
    const dailyData = this.groupForecastByDay(response.data.list);

    return dailyData.map((day: any) => ({
      forecastDate: day.date,
      temperatureCelsius: Math.round(day.tempAvg),
      tempMin: Math.round(day.tempMin),
      tempMax: Math.round(day.tempMax),
      condition: day.condition,
      rainfallMm: day.rainfall,
      humidityPercent: Math.round(day.humidityAvg),
      precipitationProbability: day.rainfall > 0 ? 80 : 20, // Approximate from OpenWeather
    }));
  }

  private groupForecastByDay(forecastList: any[]): any[] {
    const days: Map<string, any> = new Map();

    forecastList.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split("T")[0];

      if (!days.has(date)) {
        days.set(date, {
          date,
          tempSum: 0,
          tempMin: Infinity,
          tempMax: -Infinity,
          humiditySum: 0,
          rainfall: 0,
          count: 0,
          condition: item.weather[0].main,
        });
      }

      const day = days.get(date)!;
      day.tempSum += item.main.temp;
      day.tempMin = Math.min(day.tempMin, item.main.temp);
      day.tempMax = Math.max(day.tempMax, item.main.temp);
      day.humiditySum += item.main.humidity;
      day.count++;
    });

    return Array.from(days.values())
      .slice(0, 7)
      .map((day: any) => ({
        date: day.date,
        tempAvg: day.tempSum / day.count,
        tempMin: day.tempMin,
        tempMax: day.tempMax,
        humidityAvg: day.humiditySum / day.count,
        rainfall: day.rainfall,
        condition: day.condition,
      }));
  }

  private getWindDirection(degrees: number): string {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  private getConditionFromWeather(reading: any): string {
    const rainfall = parseFloat(reading.rainfallMm || "0");
    if (rainfall > 10) return "Rainy";
    if (rainfall > 0) return "Light Rain";

    const humidity = parseFloat(reading.humidityPercent);
    if (humidity > 80) return "Cloudy";

    const temp = parseFloat(reading.temperatureCelsius);
    if (temp > 30) return "Hot";
    if (temp < 15) return "Cold";

    return "Sunny";
  }

  private generateSimulatedForecast(): ForecastDay[] {
    const conditions = [
      "Sunny",
      "Partly Cloudy",
      "Cloudy",
      "Light Rain",
      "Rainy",
    ];

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);

      return {
        forecastDate: date.toISOString().split("T")[0],
        temperatureCelsius: Math.round(20 + Math.random() * 10),
        tempMin: Math.round(15 + Math.random() * 5),
        tempMax: Math.round(25 + Math.random() * 8),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        rainfallMm: Math.random() > 0.6 ? Math.round(Math.random() * 20) : 0,
        humidityPercent: Math.round(50 + Math.random() * 40),
        precipitationProbability: Math.round(Math.random() * 100),
      };
    });
  }

  async saveWeatherReading(
    farmerId: string,
    weather: Partial<WeatherData>,
  ): Promise<void> {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) return;

    await prisma.weatherReading.create({
      data: {
        farmerId: profile.id,
        temperatureCelsius: String(weather.temperatureCelsius),
        humidityPercent: String(weather.humidityPercent),
        rainfallMm: String(weather.rainfallMm || 0),
        windSpeedKmh: weather.windSpeedKmh
          ? String(weather.windSpeedKmh)
          : null,
        windDirection: weather.windDirection,
        uvIndex: weather.uvIndex ? String(weather.uvIndex) : null,
        readingAt: weather.readingAt || new Date(),
      },
    });
  }
}

export const weatherService = new WeatherService();
