import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowLeft, ArrowRight, ShieldCheck, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";

export const Route = createFileRoute("/forgot-password/reset")({
  validateSearch: (s: Record<string, unknown>): { phone: string; otp: string } => ({
    phone: String(s.phone || ""),
    otp: String(s.otp || ""),
  }),
  component: ForgotPasswordResetPage,
});

function ForgotPasswordResetPage() {
  const { phone, otp } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "bg-slate-200", width: "w-0", textColor: "text-slate-400" };
    if (pwd.length < 6) return { label: t("auth.password_strength.weak"), color: "bg-red-500", width: "w-1/3", textColor: "text-red-500" };
    
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    
    if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { label: t("auth.password_strength.strong"), color: "bg-emerald-500", width: "w-full", textColor: "text-emerald-500" };
    }
    return { label: t("auth.password_strength.medium"), color: "bg-amber-500", width: "w-2/3", textColor: "text-amber-500" };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg(t("forgot_password.error.password_min"));
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg(t("forgot_password.error.passwords_mismatch"));
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await authApi.resetPasswordWithOtp(phone, otp, password);
      toast.success(t("forgot_password.success.password_reset"));
      navigate({ to: "/auth", search: { mode: "signin" } });
    } catch (err: any) {
      const msg = err.message || t("forgot_password.error.reset_failed");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* LEFT BRAND PANEL */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-12 text-white lg:flex overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
            <Leaf className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Aguka</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">{t("app.tagline")}</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-200 backdrop-blur-md ring-1 ring-white/10">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("forgot_password.reset.badge")}</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            {t("forgot_password.reset.left_title")}
          </h2>
          <p className="text-lg text-emerald-100/90 leading-relaxed">
            {t("forgot_password.reset.left_description")}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <Link
            to="/forgot-password"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("forgot_password.reset.abort_restart")}
          </Link>
          <span className="text-xs text-emerald-200/60">{t("forgot_password.powered_by")}</span>
        </div>
      </div>

      {/* RIGHT CONTENT PANEL */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 sm:px-12 xl:px-20 bg-slate-50/50">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <div>
              <span className="text-xl font-bold text-slate-900">Aguka</span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-600">{t("forgot_password.smart_farming")}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-2">
                <Key className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {t("forgot_password.reset.choose_new_password")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("forgot_password.reset.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-slate-700">{t("forgot_password.password.new")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-slate-200 bg-white pr-10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">{t("auth.password_strength.label")}</span>
                      <span className={strength.textColor}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold text-slate-700">{t("forgot_password.password.confirm")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-slate-200 bg-white pr-10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold animate-in fade-in duration-200">
                    {passwordsMatch ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 fill-emerald-50 text-emerald-600" /> {t("forgot_password.passwords_match")}
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {t("forgot_password.error.passwords_mismatch")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {errorMsg ? (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isLoading || password.length < 8 || !passwordsMatch}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? t("forgot_password.reset.setting_new_password") : t("forgot_password.reset_password")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6 text-center lg:hidden">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("forgot_password.reset.change_phone_email")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
