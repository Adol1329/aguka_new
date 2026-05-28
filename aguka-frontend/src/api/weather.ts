import { apiClient } from './client';

export interface WeatherReading {
  id: string;
  farmerId: string;
  temperatureCelsius?: number;
  humidityPercent?: number;
  rainfallMm?: number;
  windSpeedKmh?: number;
  windDirection?: string;
  pressureHpa?: number;
  uvIndex?: number;
  solarRadiationWm2?: number;
  forecast24hr?: Record<string, unknown>;
  forecast7day?: Record<string, unknown>;
  readingAt: string;
}

export interface WeatherForecast {
  date: string;
  temperatureCelsius: number;
  humidityPercent: number;
  precipitationProbability: number;
  rainfallMm: number;
  condition: string;
}

export const weatherApi = {
  getCurrent: () =>
    apiClient.get<WeatherReading>('/weather/current'),

  getForecast: () =>
    apiClient.get<WeatherForecast[]>('/weather/forecast'),
};
