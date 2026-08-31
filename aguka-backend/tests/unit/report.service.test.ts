import crypto from 'crypto';

jest.mock('../../src/prisma.js', () => ({
  prisma: {},
}));

jest.mock('../../src/utils/logger.js', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

jest.mock('puppeteer-core', () => ({
  launch: jest.fn(),
}));

import { ReportCsvEngine } from '../../src/services/report-csv-engine.js';
import { reportAnalytics, ReportAnalyticsEngine } from '../../src/services/report-analytics.js';

function getDistrictCode(district: string | null | undefined): string {
  return (district ?? 'RNG').substring(0, 3).toUpperCase();
}

function generateCertNumber(district: string | null | undefined): string {
  const districtCode = getDistrictCode(district);
  const num = crypto.randomInt(1000, 9999);
  return `AGK-${districtCode}-${num}`;
}

function getPerformanceSeason(date: Date): string {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 7) return 'Season B';
  if (month === 6 || month === 7 || month === 8) return 'Season C';
  if (month >= 9 || month <= 1) return 'Season A';
  return 'Off-season';
}

describe('ReportService - extracted engines', () => {
  let csvEngine: ReportCsvEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    csvEngine = new ReportCsvEngine();
  });

  describe('escapeCsvField', () => {
    it('should return empty string for null', () => {
      expect(csvEngine.escapeCsvField(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(csvEngine.escapeCsvField(undefined)).toBe('');
    });

    it('should return the string unchanged for normal text', () => {
      expect(csvEngine.escapeCsvField('hello')).toBe('hello');
      expect(csvEngine.escapeCsvField(42)).toBe('42');
      expect(csvEngine.escapeCsvField(true)).toBe('true');
    });

    it('should wrap field in quotes when it contains commas', () => {
      expect(csvEngine.escapeCsvField('Kigali, Rwanda')).toBe('"Kigali, Rwanda"');
    });

    it('should escape double quotes by doubling them', () => {
      expect(csvEngine.escapeCsvField('say "hello"')).toBe('"say ""hello"""');
    });

    it('should wrap field in quotes when it contains newlines', () => {
      expect(csvEngine.escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
    });

    it('should handle mixed cases with commas, quotes, and newlines', () => {
      const input = 'a, b\nc "d"';
      expect(csvEngine.escapeCsvField(input)).toBe('"a, b\nc ""d"""');
    });
  });

  describe('district substring logic', () => {
    it('should default to RNG when district is null', () => {
      expect(getDistrictCode(null)).toBe('RNG');
    });

    it('should default to RNG when district is undefined', () => {
      expect(getDistrictCode(undefined)).toBe('RNG');
    });

    it('should return first 3 characters uppercased for normal district', () => {
      expect(getDistrictCode('Kigali')).toBe('KIG');
    });

    it('should handle short district names', () => {
      expect(getDistrictCode('Bu')).toBe('BU');
    });
  });

  describe('certificate number format', () => {
    it('should format as AGK-DIST-XXXX with random numeric suffix', () => {
      jest.spyOn(crypto, 'randomInt').mockReturnValueOnce(1234 as any);
      const cert = generateCertNumber('Kigali');
      expect(cert).toBe('AGK-KIG-1234');
    });

    it('should use RNG for null district', () => {
      jest.spyOn(crypto, 'randomInt').mockReturnValueOnce(5678 as any);
      const cert = generateCertNumber(null);
      expect(cert).toBe('AGK-RNG-5678');
    });
  });

  describe('season logic', () => {
    it('should return Off-season for month 1 (Feb, getMonth=1)', () => {
      expect(getPerformanceSeason(new Date(2024, 1, 1))).toBe('Off-season');
    });

    it('should return Season B for month 2 (Mar, getMonth=2)', () => {
      expect(getPerformanceSeason(new Date(2024, 2, 1))).toBe('Season B');
    });

    it('should return Season C for month 7 (Aug, getMonth=7)', () => {
      expect(getPerformanceSeason(new Date(2024, 7, 1))).toBe('Season C');
    });

    it('should return Season A for month 9 (Oct, getMonth=9)', () => {
      expect(getPerformanceSeason(new Date(2024, 9, 1))).toBe('Season A');
    });

    it('should return Season A for month 0 (Jan, getMonth=0)', () => {
      expect(getPerformanceSeason(new Date(2024, 0, 1))).toBe('Season A');
    });
  });

  describe('reportAnalytics calculations', () => {
    it('calculateMoistureStability should return 0 for empty readings', () => {
      expect(reportAnalytics.calculateMoistureStability([])).toBe(0);
    });

    it('calculateAvgMoisture should return 0 for empty readings', () => {
      expect(reportAnalytics.calculateAvgMoisture([])).toBe(0);
    });

    it('generateRecommendations should return maintenance advice for good scores', () => {
      const recs = reportAnalytics.generateRecommendations(85, 75, 90);
      expect(recs).toContain('Maintain current practices.');
    });

    it('getSoilStatusString should return Optimal for high moisture', () => {
      expect(reportAnalytics.getSoilStatusString(50)).toBe('Optimal');
    });

    it('calculateWeeklyTrends should return empty array for no readings', () => {
      expect(reportAnalytics.calculateWeeklyTrends([])).toEqual([]);
    });
  });
});
