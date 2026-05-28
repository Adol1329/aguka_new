import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowLeft, ArrowRight, ShieldCheck, Mail, AlertCircle, Timer } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";

export const Route = createFileRoute("/forgot-password/verify")({
  validateSearch: (s: Record<string, unknown>): { phone: string; email: string } => ({
    phone: String(s.phone || ""),
    email: String(s.email || ""),
  }),
  component: ForgotPasswordVerifyPage,
});

function ForgotPasswordVerifyPage() {
  const { phone, email } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (val: string) => {
    setErrorMsg("");
    // Digits only, max 6 characters
    if (/^[0-9]*$/.test(val) && val.length <= 6) {
      setOtp(val);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      await authApi.checkForgotPassword(phone);
      setCountdown(60);
      toast.success(t("forgot_password.success.code_resent"));
    } catch (err: any) {
      toast.error(err.message || t("forgot_password.error.resend_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg(t("forgot_password.error.otp_required"));
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await authApi.verifyResetOtp(phone, otp);
      const data = res.data!;
      if (!data.success) {
        const errStr = data.error || t("forgot_password.error.otp_incorrect");
        setErrorMsg(errStr);
        toast.error(errStr);
      } else {
        toast.success(t("forgot_password.success.code_verified"));
        navigate({
          to: "/forgot-password/reset",
          search: { phone, otp },
        });
      }
    } catch (err: any) {
      const msg = err.message || t("forgot_password.error.otp_invalid");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* LEFT BRAND PANEL (Aguka Branding) */}
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
            <span>{t("forgot_password.verify.badge")}</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            {t("forgot_password.verify.check_email")}
          </h2>
          <p className="text-lg text-emerald-100/90 leading-relaxed">
            {t("forgot_password.verify.left_description")}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <Link
            to="/forgot-password"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("forgot_password.verify.change_phone")}
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
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {t("forgot_password.verify.check_email")}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t("forgot_password.verify.sent_to", { email })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-semibold text-slate-700">
                  {t("forgot_password.code.label")}
                </Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl border-slate-200 bg-white px-4 text-center text-2xl font-extrabold tracking-[10px] text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all font-mono"
                  required
                  autoFocus
                />
                {errorMsg ? (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-slate-400" />
                  {t("forgot_password.code.valid_minutes")}
                </span>
                {countdown > 0 ? (
                  <span className="text-slate-500 font-semibold">
                    {t("forgot_password.code.resend_in", { seconds: countdown })}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    {t("forgot_password.code.resend")}
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? t("forgot_password.verifying") : t("forgot_password.verify_code")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6 text-center lg:hidden">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("forgot_password.verify.change_phone")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
