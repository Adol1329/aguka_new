import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { BASE_URL } from "@/api/client";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, type Role, canAccessRoute } from "@/lib/auth";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  ScrollText,
  HardDrive,
  Sprout,
  Cloud,
  Droplets,
  BarChart3,
  Bell,
  AlertTriangle,
  Building2,
  Calendar,
  Package,
  MessageSquare,
  ListChecks,
  UserCog,
  Leaf,
  LogOut,
  TrendingUp,
  BookOpen,
  Bug,
  BrainCircuit,
} from "lucide-react";
import { GlobalSearch } from "@/components/global-search";

interface NavItem {
  title: TranslationKey;
  url: string;
  icon: typeof LayoutDashboard;
}

const NAV: Record<Role, { label: TranslationKey; items: NavItem[] }[]> = {
  super_admin: [
    {
      label: "nav.overview",
      items: [{ title: "nav.overview", url: "/super-admin", icon: LayoutDashboard }],
    },
    {
      label: "nav.system",
      items: [
        { title: "nav.users", url: "/super-admin/users", icon: Users },
        { title: "nav.roles", url: "/super-admin/roles", icon: Shield },
        { title: "nav.settings", url: "/super-admin/settings", icon: Settings },
        { title: "nav.audit", url: "/super-admin/audit", icon: ScrollText },
        { title: "nav.backups", url: "/super-admin/backups", icon: HardDrive },
      ],
    },
  ],
  admin: [
    {
      label: "nav.overview",
      items: [{ title: "nav.overview", url: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "nav.operations",
      items: [
        { title: "nav.users", url: "/admin/users", icon: Users },
        { title: "nav.farms", url: "/admin/farms", icon: Sprout },
        { title: "nav.reports", url: "/reports", icon: BarChart3 },
        { title: "nav.settings", url: "/admin/settings", icon: Settings },
      ],
    },
  ],
  cooperative: [
    {
      label: "nav.overview",
      items: [{ title: "nav.overview", url: "/cooperative", icon: LayoutDashboard }],
    },
    {
      label: "nav.members",
      items: [
        { title: "nav.farmers", url: "/cooperative/farmers", icon: Users },
        { title: "nav.resources", url: "/cooperative/resources", icon: Package },
        { title: "nav.events", url: "/cooperative/events", icon: Calendar },
        { title: "nav.reports", url: "/reports", icon: BarChart3 },
      ],
    },
  ],
  officer: [
    {
      label: "nav.overview",
      items: [{ title: "nav.overview", url: "/officer", icon: LayoutDashboard }],
    },
    {
      label: "nav.field_work",
      items: [
        { title: "nav.farms", url: "/officer/farms", icon: Sprout },
        { title: "nav.advisories", url: "/officer/advisories", icon: Bell },
        { title: "nav.risks", url: "/officer/risks", icon: AlertTriangle },
        { title: "nav.pest_disease", url: "/officer/pest-disease", icon: Bug },
        { title: "nav.reports", url: "/reports", icon: BarChart3 },
      ],
    },
  ],
  farmer: [
    {
      label: "nav.overview",
      items: [{ title: "nav.overview", url: "/farmer", icon: LayoutDashboard }],
    },
    {
      label: "nav.my_farm",
      items: [
        { title: "nav.profile", url: "/farmer/profile", icon: UserCog },
        { title: "nav.crops", url: "/farmer/crops", icon: Sprout },
        { title: "nav.soil", url: "/farmer/soil", icon: BarChart3 },
        { title: "nav.weather", url: "/farmer/weather", icon: Cloud },
        { title: "nav.irrigation", url: "/farmer/irrigation", icon: Droplets },
        { title: "nav.ai_advisory" as any, url: "/farmer/ai", icon: BrainCircuit },
        { title: "nav.activities", url: "/farmer/activities", icon: ListChecks },
        { title: "nav.market", url: "/farmer/market", icon: TrendingUp },
        { title: "nav.reports", url: "/reports", icon: ScrollText },
        { title: "nav.community", url: "/farmer/community", icon: MessageSquare },
        { title: "nav.guidance", url: "/farmer/guidance", icon: BookOpen },
      ],
    },
  ],
};

const ROLE_BADGE: Record<Role, { icon: typeof Shield; label: TranslationKey }> = {
  super_admin: { icon: Shield, label: "role.super_admin" },
  admin: { icon: BarChart3, label: "role.admin" },
  cooperative: { icon: Building2, label: "role.cooperative" },
  officer: { icon: Sprout, label: "role.officer" },
  farmer: { icon: Leaf, label: "role.farmer" },
};

export function DashboardLayout({ role, children }: { role: Role; children?: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => currentPath === url;

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth", search: { mode: "signin" } });
      return;
    }
    if (user.role === "farmer" && !user.isOnboarded) {
      navigate({ to: "/onboarding" as any });
      return;
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    signOut();
    navigate({ to: "/" });
  };

  if (user.status === "pending_verification") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="mb-2 font-display text-2xl font-bold">{t("dashboard.pending.title")}</h1>
          <p className="mb-6 text-muted-foreground">
            {t("dashboard.pending.description")}
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t("dashboard.pending.refresh")}
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("dashboard.pending.signout")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sections = NAV[user.role];
  const Badge = ROLE_BADGE[user.role];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2 px-2 py-2 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                <img src="/aguka-logo.png" alt="Aguka" className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-display font-bold text-sidebar-foreground">Aguka</span>
                <span className="text-[10px] text-sidebar-foreground/60 flex items-center gap-1">
                  <Badge.icon className="h-3 w-3" /> {t(Badge.label)}
                </span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {sections.map((section) => (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel className="text-sidebar-foreground/50">
                  {t(section.label)}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{t(item.title)}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>{t("nav.logout")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-lg">
            <SidebarTrigger />
            <div className="ml-2">
              <GlobalSearch />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <Link 
                to="/profile" 
                className="flex items-center gap-2 rounded-full border border-border/50 bg-card pl-1 pr-3 py-1 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-7 w-7">
                  {user?.avatarUrl ? (
                    <img 
                      src={`${BASE_URL}${user.avatarUrl}`} 
                      alt={user.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-hero text-[10px] text-primary-foreground">
                      {user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden text-xs sm:block">
                  <div className="font-medium leading-tight">{user?.name}</div>
                  <div className="text-muted-foreground leading-tight">{t(Badge.label)}</div>
                </div>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}