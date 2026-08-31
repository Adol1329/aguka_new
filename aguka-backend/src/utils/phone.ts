export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let normalized = phone.trim().replace(/\D/g, "");
  if (normalized.startsWith("0") && normalized.length === 10) {
    normalized = "250" + normalized.substring(1);
  }
  return normalized;
}
