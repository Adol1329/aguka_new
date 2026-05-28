import { prisma } from "../prisma.js";

let cache: Record<string, string[]> | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000;

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*"],
  admin: [
    "manage_users",
    "manage_settings",
    "view_audit_logs",
    "manage_all_data",
    "broadcast_notifications",
    "view_reports",
  ],
  officer: ["manage_assigned_farmers", "send_advisories", "view_reports"],
  cooperative: [
    "manage_cooperative_members",
    "manage_resources",
    "schedule_events",
    "view_reports",
  ],
  farmer: [
    "view_own_farm",
    "log_activities",
    "view_advisories",
    "view_weather",
    "view_market_prices",
  ],
};

export async function getRolePermissions(role: string): Promise<string[]> {
  const now = Date.now();

  if (!cache || now > cacheExpiry) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "role_permissions" },
    });

    if (setting?.value) {
      cache = JSON.parse(setting.value) as Record<string, string[]>;
    } else {
      cache = DEFAULT_ROLE_PERMISSIONS;
    }

    cacheExpiry = now + CACHE_TTL;
  }

  return cache?.[role] ?? [];
}

export function invalidatePermissionCache() {
  cache = null;
  cacheExpiry = 0;
}
