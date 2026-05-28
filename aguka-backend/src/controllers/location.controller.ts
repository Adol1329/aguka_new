import { Request, Response, NextFunction } from "express";
import {
  RwandaLocation,
  Province,
  District,
  Sector,
  Cell,
  Village,
} from "@devrw/rwanda-location";

const rwandaLocation = new RwandaLocation();

// Standardized API response format - unified contract for all clients
export interface LocationResponse {
  code: number | string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class LocationController {
  // In-memory cache for location data (static data, rarely changes)
  private cache: Map<string, { data: LocationResponse[]; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private getCachedData(key: string): LocationResponse[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCacheData(key: string, data: LocationResponse[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Transform any location item to standardized {code, name} format
  // This ensures API response consistency across Flutter and React
  private transformToStandardFormat(items: any[]): LocationResponse[] {
    return items.map((item) => ({
      code: item.code,
      name: item.name,
    }));
  }

  // GET /api/v1/location/provinces
  getProvinces = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = "provinces";
      const cached = this.getCachedData(cacheKey);

      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      const provinces: Province[] = rwandaLocation.getProvinces();
      const standardizedData = this.transformToStandardFormat(provinces);

      this.setCacheData(cacheKey, standardizedData);

      res.json({ success: true, data: standardizedData });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/location/districts/:provinceCode
  getDistricts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provinceCodeStr = req.params.provinceCode;

      // Validate: must be a valid positive integer
      if (!provinceCodeStr || !/^\d+$/.test(provinceCodeStr)) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Province code must be a positive integer",
        });
        return;
      }

      const provinceCode = parseInt(provinceCodeStr);

      const cacheKey = `districts_${provinceCode}`;
      const cached = this.getCachedData(cacheKey);

      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      const districts: District[] = rwandaLocation.getDistricts(provinceCode);

      if (!districts || districts.length === 0) {
        res.status(404).json({
          success: false,
          error: "RESOURCE_NOT_FOUND",
          message: "No districts found for this province",
        });
        return;
      }

      const standardizedData = this.transformToStandardFormat(districts);
      this.setCacheData(cacheKey, standardizedData);

      res.json({ success: true, data: standardizedData });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/location/sectors/:districtCode
  getSectors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const districtCodeStr = req.params.districtCode;

      // Validate: must be a valid positive integer
      if (!districtCodeStr || !/^\d+$/.test(districtCodeStr)) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "District code must be a positive integer",
        });
        return;
      }

      const districtCode = parseInt(districtCodeStr);

      const cacheKey = `sectors_${districtCode}`;
      const cached = this.getCachedData(cacheKey);

      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      const sectors: Sector[] = rwandaLocation.getSectors(districtCode);

      if (!sectors || sectors.length === 0) {
        res.status(404).json({
          success: false,
          error: "RESOURCE_NOT_FOUND",
          message: "No sectors found for this district",
        });
        return;
      }

      const standardizedData = this.transformToStandardFormat(sectors);
      this.setCacheData(cacheKey, standardizedData);

      res.json({ success: true, data: standardizedData });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/location/cells/:sectorCode
  // Note: sectorCode is a string (e.g., "010101") per @devrw/rwanda-location library
  getCells = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sectorCode = req.params.sectorCode;

      if (
        !sectorCode ||
        sectorCode.trim() === "" ||
        !/^\d{6}$/.test(sectorCode)
      ) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: 'Sector code must be a 6-digit string (e.g., "010101")',
        });
        return;
      }

      const cacheKey = `cells_${sectorCode}`;
      const cached = this.getCachedData(cacheKey);

      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      const cells: Cell[] = rwandaLocation.getCells(sectorCode);

      if (!cells || cells.length === 0) {
        res.status(404).json({
          success: false,
          error: "RESOURCE_NOT_FOUND",
          message: "No cells found for this sector",
        });
        return;
      }

      const standardizedData = this.transformToStandardFormat(cells);
      this.setCacheData(cacheKey, standardizedData);

      res.json({ success: true, data: standardizedData });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/location/villages/:cellCode
  getVillages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cellCodeStr = req.params.cellCode;

      // Validate: must be a valid positive integer
      if (!cellCodeStr || !/^\d+$/.test(cellCodeStr)) {
        res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Cell code must be a positive integer",
        });
        return;
      }

      const cellCode = parseInt(cellCodeStr);

      const cacheKey = `villages_${cellCode}`;
      const cached = this.getCachedData(cacheKey);

      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      const villages: Village[] = rwandaLocation.getVillages(cellCode);

      if (!villages || villages.length === 0) {
        res.status(404).json({
          success: false,
          error: "RESOURCE_NOT_FOUND",
          message: "No villages found for this cell",
        });
        return;
      }

      const standardizedData = this.transformToStandardFormat(villages);
      this.setCacheData(cacheKey, standardizedData);

      res.json({ success: true, data: standardizedData });
    } catch (error) {
      next(error);
    }
  };

  // Clear cache (useful for testing or forced refresh)
  clearCache(): void {
    this.cache.clear();
  }
}
