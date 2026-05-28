import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi } from "@/api/auth";
import { tabSession } from "@/utils/tabSession";

export type Role = "super_admin" | "admin" | "cooperative" | "officer" | "farmer";

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 5,
  admin: 4,
  cooperative: 3,
  officer: 2,
  farmer: 1,
};

export const ROUTE_ROLES: Record<string, Role[]> = {
  "/super-admin": ["super_admin"],
  "/super-admin/users": ["super_admin"],
  "/super-admin/roles": ["super_admin"],
  "/super-admin/settings": ["super_admin"],
  "/super-admin/audit": ["super_admin"],
  "/super-admin/backups": ["super_admin"],
  "/super-admin/health": ["super_admin"],
  "/admin": ["super_admin", "admin"],
  "/admin/users": ["super_admin", "admin"],
  "/admin/farms": ["super_admin", "admin"],
  "/admin/settings": ["super_admin", "admin"],
  "/admin/reports": ["super_admin", "admin"],
  "/cooperative": ["super_admin", "admin", "cooperative"],
  "/cooperative/farmers": ["super_admin", "admin", "cooperative"],
  "/cooperative/resources": ["super_admin", "admin", "cooperative"],
  "/cooperative/events": ["super_admin", "admin", "cooperative"],
  "/cooperative/reports": ["super_admin", "admin", "cooperative"],
  "/officer": ["super_admin", "admin", "officer"],
  "/officer/farms": ["super_admin", "admin", "officer"],
  "/officer/advisories": ["super_admin", "admin", "officer"],
  "/officer/risks": ["super_admin", "admin", "officer"],
  "/officer/reports": ["super_admin", "admin", "officer"],
  "/farmer": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/farmer/profile": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/farmer/soil": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/farmer/weather": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/farmer/irrigation": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/farmer/activities": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/farmer/community": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/farmer/notifications": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/profile": ["super_admin", "admin", "officer", "cooperative", "farmer"],
  "/reports": ["super_admin", "admin", "cooperative", "officer"],
  "/onboarding": ["farmer"],
};

export function canAccessRoute(role: Role, path: string): boolean {
  if (role === "super_admin") return true;
  const allowed = ROUTE_ROLES[path];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  token: string;
  refreshToken?: string;
  isOnboarded: boolean;
  location?: string;
  cooperativeId?: string;
  officerId?: string;
  status?: string;
  language?: string;
  avatarUrl?: string;
  requiresPasswordChange?: boolean;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  canAccess: (path: string) => boolean;
  isLoading: boolean;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = tabSession.get();
    if (parsed && typeof parsed.role === "string" && (parsed.role as Role) in ROLE_HIERARCHY) {
      return parsed as User;
    }
    return null;
  } catch {
    return null;
  }
}

const ROLE_MAP: Record<string, Role> = {
  farmer: "farmer",
  officer: "officer",
  cooperative: "cooperative",
  admin: "admin",
  super_admin: "super_admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadUser = () => {
      try {
        const parsed = tabSession.get();
        if (parsed && typeof parsed.role === "string" && (parsed.role as Role) in ROLE_HIERARCHY) {
          setUser(parsed as User);
          return parsed as User;
        }
        tabSession.clear();
      } catch {
        tabSession.clear();
      }
      setUser(null);
      return null;
    };

    const storedUser = loadUser();
    
    if (storedUser) {
      // Refresh profile from backend to get latest data
      authApi.getMe().then(res => {
        if (res.success && res.data) {
          const updatedUser = mapBackendUserToAuth(res.data as any, storedUser.token, storedUser.refreshToken);
          setUser(updatedUser);
          tabSession.set(updatedUser);
        }
      }).catch(() => {
        if (!tabSession.get()) {
          setUser(null);
        }
      });
    }

    const logoutChannel = new BroadcastChannel("aguka_logout");
    logoutChannel.onmessage = (event) => {
      if (event.data?.type === "LOGOUT" && event.data?.role === tabSession.getRole()) {
        tabSession.clear();
        setUser(null);
        window.location.href = "/auth?mode=signin";
      }
    };

    setIsLoading(false);

    return () => {
      logoutChannel.close();
    };
  }, []);

  const signIn = (u: User) => {
    if (!ROLE_HIERARCHY[u.role]) {
      throw new Error(`Invalid role: ${u.role}`);
    }
    setUser(u);
    tabSession.set(u);
  };

  const signOut = async () => {
    const role = tabSession.getRole();
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      tabSession.clear();
      if (typeof window !== "undefined") {
        const logoutChannel = new BroadcastChannel("aguka_logout");
        logoutChannel.postMessage({ type: "LOGOUT", role });
        logoutChannel.close();
      }
    }
  };

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (path: string) => {
    if (!user) return false;
    return canAccessRoute(user.role, path);
  };

  return (
    <Ctx.Provider value={{ user, token: user?.token || null, signIn, signOut, hasRole, canAccess, isLoading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

export const ROLE_HOME: Record<Role, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  cooperative: "/cooperative",
  officer: "/officer",
  farmer: "/farmer",
};

export function mapBackendUserToAuth(
  backendUser: Record<string, unknown>,
  token: string,
  refreshToken?: string,
): User {
  const rawRole = String(backendUser.role || "farmer").toLowerCase();
  const role = ROLE_MAP[rawRole] || "farmer";
  const fullName = 
    (backendUser.fullName as string) || 
    (backendUser.farmerProfile as any)?.fullName || 
    (backendUser.phone as string) || 
    "";

  return {
    id: String(backendUser.id),
    name: fullName,
    email: (backendUser.email as string) || undefined,
    phone: (backendUser.phone as string) || undefined,
    role,
    token,
    refreshToken,
    isOnboarded: Boolean(backendUser.isOnboarded),
    status: String(backendUser.status),
    language: (backendUser.language as string) || undefined,
    location: (backendUser.location as string) || undefined,
    cooperativeId: (backendUser.cooperativeId as string) || undefined,
    officerId: (backendUser.officerId as string) || undefined,
    avatarUrl: (backendUser.avatarUrl as string) || (backendUser.farmerProfile as any)?.profileImageUrl || undefined,
    requiresPasswordChange: Boolean(backendUser.requiresPasswordChange),
  };
}
