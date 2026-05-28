/**
 * Utility functions for Rwandan phone numbers.
 */

/**
 * Normalizes a Rwandan phone number to the standard +250XXXXXXXXX format.
 * Accepts formats: 0781234567, +250781234567, 250781234567, 781234567
 * @param raw The raw phone string input
 * @returns The normalized phone string, or null if invalid.
 */
export function normalizeRwandaPhone(raw: string): string | null {
  if (!raw) return null;
  // Remove all non-numeric characters except leading +
  const cleaned = raw.replace(/(?!^\+)\D/g, '');
  
  // Match the core 9 digits (7 followed by 8 digits)
  const match = cleaned.match(/(\+?250|0)?(7[2389]\d{7})$/);
  
  if (match && match[2]) {
    return `+250${match[2]}`;
  }
  
  return null;
}

/**
 * Validates if a string is a valid Rwandan phone number.
 */
export function validateRwandaPhone(raw: string): boolean {
  return normalizeRwandaPhone(raw) !== null;
}
