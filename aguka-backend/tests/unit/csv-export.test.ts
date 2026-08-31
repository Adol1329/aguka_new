import { ReportCsvEngine } from '../../src/services/report-csv-engine.js';

const csvEngine = new ReportCsvEngine();

describe('escapeCsvField (CSV export)', () => {
  it('should return empty string for null', () => {
    expect(csvEngine.escapeCsvField(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(csvEngine.escapeCsvField(undefined)).toBe('');
  });

  it('should leave normal text unchanged', () => {
    expect(csvEngine.escapeCsvField('hello')).toBe('hello');
  });

  it('should convert numbers to strings', () => {
    expect(csvEngine.escapeCsvField(42)).toBe('42');
  });

  it('should wrap field in quotes when it contains commas', () => {
    expect(csvEngine.escapeCsvField('Kigali, Rwanda')).toBe('"Kigali, Rwanda"');
  });

  it('should escape double quotes by doubling them and wrap in quotes', () => {
    expect(csvEngine.escapeCsvField('say "hello" world')).toBe('"say ""hello"" world"');
  });

  it('should wrap field in quotes when it contains newlines', () => {
    expect(csvEngine.escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
  });

  it('should wrap field in quotes when it contains carriage returns', () => {
    expect(csvEngine.escapeCsvField('line1\rline2')).toBe('"line1\rline2"');
  });

  it('should handle mixed commas, quotes, and newlines', () => {
    const input = 'a, b\nc "d" e';
    const expected = '"a, b\nc ""d"" e"';
    expect(csvEngine.escapeCsvField(input)).toBe(expected);
  });

  it('should handle boolean values', () => {
    expect(csvEngine.escapeCsvField(true)).toBe('true');
    expect(csvEngine.escapeCsvField(false)).toBe('false');
  });

  it('should handle zero and empty string', () => {
    expect(csvEngine.escapeCsvField(0)).toBe('0');
    expect(csvEngine.escapeCsvField('')).toBe('');
  });
});
