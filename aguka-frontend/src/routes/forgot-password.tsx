import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Mail, Key, Eye, EyeOff, CheckCircle2, Timer } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { normalizeRwandaPhone, validateRwandaPhone } from "@/utils/phoneUtils";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [step, setStep] = useState<"phone" | "code" | "password">("phone");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhoneChange = (val: string) => {
    setErrorMsg("");
    // Allow common phone formatting while keeping the input predictable.
    if (/^[0-9+\s()-]*$/.test(val)) {
      setPhone(val);
    }
  };

  const normalizedPhone = normalizeRwandaPhone(phone);
  const showPhoneHint = phone.length > 0 && validateRwandaPhone(phone);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  useEffect(() => {
    if (step !== "code" || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg(t("forgot_password.error.phone_required"));
      return;
    }
    if (!normalizedPhone) {
      setErrorMsg(t("forgot_password.error.invalid_phone"));
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await authApi.checkForgotPassword(normalizedPhone);
      const data = res.data!;
      if (!data.exists) {
        setErrorMsg(t("forgot_password.error.no_account"));
        toast.error(t("forgot_password.error.no_account"));
      } else if (data.hasEmail) {
        toast.success(t("forgot_password.success.code_sent_to", { email: data.maskedEmail || t("forgot_password.your_email") }));
        setRecoveryPhone(normalizedPhone);
        setMaskedEmail(data.maskedEmail || t("forgot_password.your_email"));
        setOtp("");
        setCountdown(60);
        setStep("code");
      } else {
        toast.info(t("forgot_password.info.admin_recovery_required"));
        navigate({
          to: "/forgot-password/support",
          search: { phone: normalizedPhone },
        });
      }
    } catch (err: any) {
      const msg = err.message || t("forgot_password.error.generic");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string) => {
    setErrorMsg("");
    if (/^[0-9]*$/.test(val) && val.length <= 6) {
      setOtp(val);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !recoveryPhone) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await authApi.checkForgotPassword(recoveryPhone);
      const data = res.data!;
      setMaskedEmail(data.maskedEmail || maskedEmail || t("forgot_password.your_email"));
      setOtp("");
      setCountdown(60);
      toast.success(t("forgot_password.success.code_resent"));
    } catch (err: any) {
      const msg = err.message || t("forgot_password.error.resend_failed");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg(t("forgot_password.error.otp_required"));
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await authApi.verifyResetOtp(recoveryPhone, otp);
      const data = res.data!;
      if (!data.success) {
        const msg = data.error || t("forgot_password.error.otp_incorrect");
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      toast.success(t("forgot_password.success.code_verified"));
      setStep("password");
    } catch (err: any) {
      const msg = err.message || t("forgot_password.error.otp_invalid");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      await authApi.resetPasswordWithOtp(recoveryPhone, otp, password);
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

  const goBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setErrorMsg("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* LEFT BRAND PANEL (Aguka Branding) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-12 text-white lg:flex overflow-hidden">
        {/* Glow Effects */}
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
            <span>{t("forgot_password.badge.secure_recovery")}</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            {t("forgot_password.left.title")}
          </h2>
          <p className="text-lg text-emerald-100/90 leading-relaxed">
            {t("forgot_password.left.description")}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("forgot_password.back_to_signin")}
          </Link>
          <span className="text-xs text-emerald-200/60">{t("forgot_password.powered_by")}</span>
        </div>
      </div>

      {/* RIGHT CONTENT PANEL (Split Screen layout form) */}
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
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {t("forgot_password.title")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("forgot_password.subtitle")}
              </p>
            </div>

            {step === "phone" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                    {t("auth.phone")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="0780000003"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all font-medium"
                    required
                  />
                  {errorMsg ? (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {t("forgot_password.phone_hint")}
                      </p>
                      {showPhoneHint ? (
                        <p className="text-xs font-semibold text-emerald-600">
                          {t("forgot_password.we_will_use", { phone: normalizedPhone || "" })}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? t("forgot_password.checking_security") : t("auth.continue")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            ) : null}

            {step === "code" ? (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t("forgot_password.code.enter_email_code")}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {t("forgot_password.code.sent_to_for", { email: maskedEmail, phone: recoveryPhone })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-semibold text-slate-700">
                    {t("forgot_password.code.label")}
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="144278"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    disabled={isLoading}
                    className="h-14 w-full rounded-xl border-slate-200 bg-white px-4 text-center font-mono text-2xl font-extrabold tracking-[10px] text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                    required
                    autoFocus
                  />
                  {errorMsg ? (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <Timer className="h-4 w-4" />
                    {t("forgot_password.code.valid_minutes")}
                  </span>
                  {countdown > 0 ? (
                    <span className="font-semibold text-slate-500">{t("forgot_password.code.resend_in", { seconds: countdown })}</span>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={isLoading} className="font-bold text-emerald-600 hover:text-emerald-700">
                      {t("forgot_password.code.resend")}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isLoading ? t("forgot_password.verifying") : t("forgot_password.verify_code")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <button type="button" onClick={goBackToPhone} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700">
                    {t("forgot_password.use_different_phone")}
                  </button>
                </div>
              </form>
            ) : null}

            {step === "password" ? (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t("forgot_password.success.code_verified")}</p>
                      <p className="mt-1 text-xs text-slate-600">{t("forgot_password.password.create_for", { phone: recoveryPhone })}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                    {t("forgot_password.password.new")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setErrorMsg("");
                        setPassword(e.target.value);
                      }}
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border-slate-200 bg-white pr-10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-400">{t("forgot_password.password.min_hint")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-sm font-semibold text-slate-700">
                    {t("forgot_password.password.confirm")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setErrorMsg("");
                        setConfirmPassword(e.target.value);
                      }}
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border-slate-200 bg-white pr-10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword ? (
                    <p className={`text-xs font-semibold ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                      {passwordsMatch ? t("forgot_password.passwords_match") : t("forgot_password.error.passwords_mismatch")}
                    </p>
                  ) : null}
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
                  {isLoading ? t("forgot_password.resetting_password") : t("forgot_password.reset_password")}
                  <Key className="h-4 w-4" />
                </Button>
              </form>
            ) : null}

            <div className="mt-8 border-t border-slate-100 pt-6 text-center lg:hidden">
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("forgot_password.back_to_signin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
