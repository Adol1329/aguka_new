import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth, ROLE_HOME } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Shield, Home, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/access-denied")({
  component: AccessDeniedPage,
});

function AccessDeniedPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const homePath = user ? ROLE_HOME[user.role] : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <Shield className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">{t("access_denied.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("access_denied.description")}
        </p>
        {user && (
          <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            {t("access_denied.logged_in_as")} <span className="font-medium text-foreground">{user.name}</span> (
            {t(`role.${user.role}`)})
          </div>
        )}
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => {
              // Try to go back, if it fails or loops, go home
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: homePath as any });
              }
            }}
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("access_denied.go_back")}
          </button>
          <Link
            to={homePath as any}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" /> {t("access_denied.go_dashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
