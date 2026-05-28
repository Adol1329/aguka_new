import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Sprout,
  Cloud,
  Droplets,
  BarChart3,
  Users,
  Shield,
  Smartphone,
  Bell,
  ArrowRight,
  Leaf,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { NotificationDropdown } from "@/components/notification-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  component: Landing,
});

function GuestNotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all duration-200">
          <Bell className="h-5 w-5 text-emerald-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-6 text-center bg-white/95 backdrop-blur-md border border-zinc-100 shadow-2xl rounded-2xl flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
          <Lock className="h-5 w-5 text-emerald-600 animate-pulse" />
        </div>
        <h3 className="font-extrabold text-sm text-zinc-900 mb-1.5">
          Imenyesha Nyaryo / Real Advisories
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed mb-4">
          Yinjira muri konti yawe kugira ngo urebe imenyesha ry'ubutaka, ikirere n'inama z'ubuhinzi ritunganyijwe ku bwawe.
        </p>
        <div className="w-full space-y-2">
          <Button asChild size="sm" className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 h-auto shadow-sm">
            <Link to="/auth" search={{ mode: "signin" }}>
              Yinjira / Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl py-2 h-auto">
            <Link to="/auth" search={{ mode: "signup" }}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Fungura Konti / Start Free
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Landing() {
  const { t } = useI18n();
  const { user } = useAuth();
  const displayName = user?.name?.split(" ")[0] || "Farmer";

  const modules = [
    {
      icon: Sprout,
      title: "Soil Monitoring",
      desc: "Real-time moisture, temperature and N-P-K nutrient readings.",
      color: "text-success",
    },
    {
      icon: Cloud,
      title: "Weather",
      desc: "Hyperlocal forecasts, rainfall tracking, frost alerts.",
      color: "text-info",
    },
    {
      icon: Droplets,
      title: "Irrigation",
      desc: "Smart scheduling tied to soil and weather data.",
      color: "text-info",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "Yield prediction and input optimization.",
      color: "text-primary",
    },
    {
      icon: Bell,
      title: "Advisories",
      desc: "Instant in-app alerts in your preferred language.",
      color: "text-warning",
    },
    {
      icon: Users,
      title: "Community",
      desc: "Cooperative coordination and peer learning.",
      color: "text-primary",
    },
  ];

  const roles = [
    // { key: "super_admin", icon: Shield, accent: "from-primary to-primary-glow" },
    // { key: "admin", icon: BarChart3, accent: "from-info to-primary" },
    // { key: "cooperative", icon: Users, accent: "from-primary-glow to-success" },
    // { key: "officer", icon: Sprout, accent: "from-success to-primary-glow" },
    // { key: "farmer", icon: Leaf, accent: "from-primary to-success" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
              <img src="/aguka-logo.png" alt="Aguka" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-xl font-bold">{t("app.name")}</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#modules"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.modules")}
            </a>
            <a
              href="#roles"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.features")}
            </a>
            <a
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.about")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user ? <NotificationDropdown /> : <GuestNotificationDropdown />}
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ mode: "signin" }}>
                {t("nav.signin")}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-gradient-hero hover:opacity-90 shadow-card-soft"
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                {t("nav.getstarted")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-[0.04]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-info/10 blur-3xl" />

        <div className="container relative mx-auto grid gap-12 px-4 py-20 lg:grid-cols-2 lg:py-32">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Imbaraga Farmers Organization
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-gradient">
                {t("hero.title").split(" ").slice(-2).join(" ")}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("hero.subtitle")}</p>
            <div className="mt-4 inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
              {t("welcome.user", { name: displayName })}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-hero hover:opacity-90 shadow-elevated"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("hero.cta.primary")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#modules">{t("hero.cta.secondary")}</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm">
              {["Smartphone & USSD", "3 languages", "Offline-ready"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: stylized dashboard preview */}
          <div className="relative">
            <div className="relative rounded-2xl border border-border/50 bg-card p-6 shadow-elevated">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Field A · Huye</div>
                  <div className="font-display text-lg font-semibold">Maize · 1.2 ha</div>
                </div>
                <div className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  Healthy
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Moisture",
                    value: "46%",
                    icon: Droplets,
                    color: "text-info",
                    bg: "bg-info/10",
                  },
                  {
                    label: "Temp",
                    value: "23°C",
                    icon: Cloud,
                    color: "text-warning",
                    bg: "bg-warning/10",
                  },
                  {
                    label: "pH",
                    value: "6.4",
                    icon: Sprout,
                    color: "text-success",
                    bg: "bg-success/10",
                  },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/50 p-3">
                    <div
                      className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}
                    >
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-display text-xl font-bold">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-gradient-data p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-medium">7-day forecast</div>
                  <div className="text-xs text-muted-foreground">Rain expected Wed</div>
                </div>
                <div className="flex items-end justify-between gap-1">
                  {[40, 55, 75, 90, 60, 35, 25].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      {i === 2 && (
                        <div className="text-[10px]">🌧️</div>
                      )}
                      <div
                        className={`w-full rounded-t ${i === 2 ? "bg-info/80" : "bg-info/60"}`}
                        style={{ height: `${h * 0.6}px` }}
                      />
                      <div className="text-[10px] text-muted-foreground">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-3">
                <Bell className="mt-0.5 h-4 w-4 text-warning" />
                <div className="text-xs">
                  <div className="font-semibold">Heavy rain in 2 days</div>
                  <div className="text-muted-foreground">
                    Hold off on fertilizer application until Friday.
                  </div>
                  <div className="mt-1 text-muted-foreground">{t("notifications.unread", { count: 3 })}</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border/50 bg-card p-3 shadow-card-soft md:block">
              <div className="flex items-center gap-2 text-xs">
                <Smartphone className="h-4 w-4 text-primary" />
                Also via USSD
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Roles
      <section id="roles" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Built for everyone
            </div>
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Five roles, one ecosystem
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {roles.map((r) => (
              <Card
                key={r.key}
                className="group relative overflow-hidden p-6 transition-all hover:shadow-elevated"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${r.accent}`} />
                <r.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="font-display text-lg font-semibold">{t(`role.${r.key}`)}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section id="about" className="border-t border-border/50 py-20">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-0 bg-gradient-hero p-12 text-center shadow-elevated">
            <h2 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
              Grow more. Worry less.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join Imbaraga's network of smallholder farmers using Aguka Kit to make better farming
              decisions.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/auth" search={{ mode: "signup" }}>
                {t("hero.cta.primary")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img src="/aguka-logo.png" alt="Aguka" className="h-5 w-5 object-contain" />© 2026 Aguka · Imbaraga Farmers Organization
          </div>
          <div className="text-xs text-muted-foreground">{t("app.tagline")}</div>
        </div>
      </footer>
    </div>
  );
}
