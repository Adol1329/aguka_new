import { detectSeason, classifyRisk, generateReportId } from '../../src/reports-v2/utils.js';

describe('detectSeason', () => {
  it('should return Season A for months 8-11 (Sep-Dec)', () => {
    expect(detectSeason(new Date(2024, 8, 1))).toBe('Season A');
    expect(detectSeason(new Date(2024, 9, 1))).toBe('Season A');
    expect(detectSeason(new Date(2024, 10, 1))).toBe('Season A');
    expect(detectSeason(new Date(2024, 11, 1))).toBe('Season A');
  });

  it('should return Season B for months 2-6 (Mar-Jul)', () => {
    expect(detectSeason(new Date(2024, 2, 1))).toBe('Season B');
    expect(detectSeason(new Date(2024, 3, 1))).toBe('Season B');
    expect(detectSeason(new Date(2024, 4, 1))).toBe('Season B');
    expect(detectSeason(new Date(2024, 5, 1))).toBe('Season B');
    expect(detectSeason(new Date(2024, 6, 1))).toBe('Season B');
  });

  it('should return Season C for month 7 (Aug)', () => {
    expect(detectSeason(new Date(2024, 7, 1))).toBe('Season C');
  });

  it('should return Off-season for months 0-1 (Jan-Feb)', () => {
    expect(detectSeason(new Date(2024, 0, 1))).toBe('Off-season');
    expect(detectSeason(new Date(2024, 1, 1))).toBe('Off-season');
  });

  it('should default to current date when no argument given', () => {
    const result = detectSeason();
    expect(['Season A', 'Season B', 'Season C', 'Off-season']).toContain(result);
  });
});

describe('classifyRisk', () => {
  it('should return critical for scores < 30', () => {
    expect(classifyRisk(0)).toBe('critical');
    expect(classifyRisk(15)).toBe('critical');
    expect(classifyRisk(29)).toBe('critical');
  });

  it('should return high for scores 30-59', () => {
    expect(classifyRisk(30)).toBe('high');
    expect(classifyRisk(45)).toBe('high');
    expect(classifyRisk(59)).toBe('high');
  });

  it('should return moderate for scores 60-79', () => {
    expect(classifyRisk(60)).toBe('moderate');
    expect(classifyRisk(70)).toBe('moderate');
    expect(classifyRisk(79)).toBe('moderate');
  });

  it('should return low for scores >= 80', () => {
    expect(classifyRisk(80)).toBe('low');
    expect(classifyRisk(95)).toBe('low');
    expect(classifyRisk(100)).toBe('low');
  });
});

describe('generateReportId', () => {
  it('should generate AGK-TYPE-YEAR-HEX format', () => {
    const id = generateReportId('soil');
    expect(id).toMatch(/^AGK-SOIL-\d{4}-[0-9A-F]{6}$/);
  });

  it('should uppercase the type and strip invalid chars', () => {
    const id = generateReportId('soil@test#123');
    expect(id).toMatch(/^AGK-SOILTEST123-\d{4}-[0-9A-F]{6}$/);
  });

  it('should generate unique IDs for successive calls', () => {
    const id1 = generateReportId('irrigation');
    const id2 = generateReportId('irrigation');
    expect(id1).not.toBe(id2);
  });
});
