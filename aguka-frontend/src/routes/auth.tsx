import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, ROLE_HOME, getStoredUser, mapBackendUserToAuth, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Leaf, Users, Sprout, ArrowRight, Eye, EyeOff, Check, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { BASE_URL } from "@/api/client";
import { Checkbox } from "@/components/ui/checkbox";
import { normalizeRwandaPhone, validateRwandaPhone } from "@/utils/phoneUtils";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode: "signup" | "signin"; redirect?: string } => ({
    mode: (s.mode as string) === "signup" ? "signup" : "signin",
    redirect: s.redirect ? String(s.redirect) : undefined,
  }),
  beforeLoad: () => {
    const user = getStoredUser();
    if (user) {
      throw redirect({ to: ROLE_HOME[user.role] as any });
    }
  },
  component: AuthPage,
});

const ROLE_LABELS = {
  farmer: "Farmer",
  officer: "Extension Officer",
  cooperative: "Cooperative Manager",
};

const ROLE_ICONS = {
  farmer: Leaf,
  officer: Sprout,
  cooperative: Users,
};

function AuthPage() {
  const { mode } = Route.useSearch();
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Mode: signin / signup
  const isSignup = mode === "signup";

  // Shared state
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sign up step state
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"farmer" | "officer" | "cooperative">("farmer");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch Public Stats
  useEffect(() => {
    fetch(`${BASE_URL}/api/stats/public`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsLoading(false);
      });
  }, []);

  // Validation
  const showPhoneError = phone.length > 0 && (phoneTouched || phone.length >= 10) && !validateRwandaPhone(phone);

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "bg-muted", width: "w-0", textColor: "text-muted-foreground" };
    if (pwd.length < 6) return { label: t("auth.password_strength.weak"), color: "bg-destructive", width: "w-1/3", textColor: "text-destructive" };
    
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    
    if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { label: t("auth.password_strength.strong"), color: "bg-success", width: "w-full", textColor: "text-success" };
    }
    return { label: t("auth.password_strength.medium"), color: "bg-warning", width: "w-2/3", textColor: "text-warning" };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword && password === confirmPassword;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error(t("auth.error.phone_password_required"));
      return;
    }
    const normalizedPhone = normalizeRwandaPhone(phone);
    if (!normalizedPhone) {
      toast.error(t("auth.error.invalid_phone_example"));
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.login({ phone: normalizedPhone, password });
      const authData = res.data!;
      const user = mapBackendUserToAuth(authData.user, authData.accessToken, authData.refreshToken);
      signIn(user);
      toast.success((t("common.welcome") || "Welcome") + ", " + user.name);
      navigate({
        to: user.requiresPasswordChange
          ? "/change-password"
          : user.isOnboarded
            ? ROLE_HOME[user.role]
            : "/onboarding",
      });
    } catch (err: any) {
      toast.error(err.message || t("auth.error.login_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error(t("auth.error.full_name_required"));
      return;
    }
    setSignupStep(2);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !confirmPassword) {
      toast.error(t("auth.error.security_fields_required"));
      return;
    }
    const normalizedPhone = normalizeRwandaPhone(phone);
    if (!normalizedPhone) {
      toast.error(t("auth.error.invalid_phone_format"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("auth.error.password_min_length"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("auth.error.passwords_mismatch"));
      return;
    }
    if (!agreeTerms) {
      toast.error(t("auth.error.must_accept_terms"));
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({
        phone: normalizedPhone,
        email: email || undefined,
        password,
        role,
        fullName: name,
        provinceCode: "1",
        districtCode: "11",
        sectorCode: "010101",
        cellCode: "1101",
        villageCode: "110101",
      });
      const authData = res.data!;
      const user = mapBackendUserToAuth(authData.user, authData.accessToken, authData.refreshToken);
      signIn(user);
      toast.success(t("auth.success.account_created", { name: user.name }));
      navigate({ to: "/onboarding" });
    } catch (err: any) {
      toast.error(err.message || t("auth.error.registration_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel with Green Gradient and Live Stats */}
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-info/20 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2 text-primary-foreground">
          <img src="/aguka-logo.png" alt="Aguka Logo" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-bold">{t("app.name") || "Aguka"}</span>
        </Link>

        <div className="relative space-y-6">
          <h2 className="font-display text-4xl font-bold leading-tight text-primary-foreground">
            {t("app.tagline") || "Empowering precision farming across Rwanda."}
          </h2>
          <p className="max-w-md text-primary-foreground/80 leading-relaxed">
            {t("auth.left.description")}
          </p>

          {/* Real-time stats from endpoint */}
          <div className="space-y-3 pt-6 border-t border-white/20">
            {/* Farmer Stats */}
            <div className="flex items-center gap-3 text-sm text-white font-medium animate-in slide-in-from-left-4 duration-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white">
                <Check className="h-3.5 w-3.5 text-emerald-300 stroke-[3]" />
              </div>
              <span>
                {statsLoading ? "---" : (stats?.totalFarmers ?? "")} {t("auth.stats.active_farmers")}
              </span>
            </div>

            {/* Cooperative Stats */}
            <div className="flex items-center gap-3 text-sm text-white font-medium animate-in slide-in-from-left-4 duration-300 delay-100">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white">
                <Check className="h-3.5 w-3.5 text-emerald-300 stroke-[3]" />
              </div>
              <span>
                {statsLoading ? "---" : (stats?.totalCooperatives ?? "")} {t("auth.stats.cooperatives_connected")}
              </span>
            </div>

            {/* Districts Stats */}
            <div className="flex items-center gap-3 text-sm text-white font-medium animate-in slide-in-from-left-4 duration-300 delay-200">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white">
                <Check className="h-3.5 w-3.5 text-emerald-300 stroke-[3]" />
              </div>
              <span>
                {statsLoading ? "---" : (stats?.districtsCount ?? "")} {t("auth.stats.districts_covered")}
              </span>
            </div>
          </div>
        </div>

        <div className="relative text-xs text-primary-foreground/60">
          © 2026 Imbaraga Farmers Organization
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img src="/aguka-logo.png" alt="Aguka Logo" className="h-8 w-8 object-contain" />
            <span className="font-display font-bold">{t("app.name") || "Aguka"}</span>
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-12">
          {/* Progress Indicators for signup */}
          {isSignup && (
            <div className="mb-6 space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                <span>{t("auth.step.progress", { current: signupStep, total: 2 })}</span>
                <span className="text-primary">{signupStep === 1 ? t("auth.step.personal_info") : t("auth.step.security_details")}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: signupStep === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>
          )}

          <h1 className="font-display text-3xl font-bold text-foreground">
            {isSignup ? t("auth.create_account") : (t("auth.signin") || "Sign In")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {isSignup ? t("auth.signup.subtitle") : t("auth.signin.subtitle")}
          </p>

          {/* Form Switcher */}
          {!isSignup ? (
            /* Sign In Page Form */
            <form onSubmit={handleLogin} className="mt-8 space-y-4 animate-in fade-in duration-200">
              {/* Phone Input */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone") || "Phone Number"}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0781234567"
                  onBlur={() => setPhoneTouched(true)}
                  className={`focus-visible:ring-emerald-500 transition-all duration-200 ${
                    showPhoneError ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  required
                />
                {showPhoneError && (
                  <p className="text-xs text-destructive font-semibold animate-in slide-in-from-top-1">
                    {t("auth.error.invalid_phone_short")}
                  </p>
                )}
              </div>

              {/* Password Input with Show/Hide toggle */}
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password") || "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 focus-visible:ring-emerald-500 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Forgot password right-aligned small gray link */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-muted-foreground hover:text-emerald-600 transition-colors duration-200 cursor-pointer"
                  >
                    {t("auth.forgot_password")}
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-95 font-bold shadow-md rounded-xl transition-all duration-200 mt-6"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? t("auth.signing_in") : t("auth.signin")}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            /* Register Page 2-Step Form */
            <div className="mt-8">
              {signupStep === 1 ? (
                /* Step 1: Personal Info + Role Selection */
                <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("auth.full_name")}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Claudette Uwimana"
                      className="focus-visible:ring-emerald-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email_optional")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="claudette@example.com"
                      className="focus-visible:ring-emerald-500 transition-all duration-200"
                    />
                  </div>

                  {/* Restricted 3 roles selector */}
                  <div className="space-y-2">
                    <Label>{t("auth.assign_role")}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["farmer", "officer", "cooperative"] as const).map((r) => {
                        const Icon = ROLE_ICONS[r];
                        const label = ROLE_LABELS[r];
                        const active = role === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-[10px] font-bold tracking-wide uppercase transition-all duration-200 ${
                              active
                                ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/10"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-center leading-tight">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-hero hover:opacity-95 font-bold shadow-md rounded-xl transition-all duration-200 mt-6"
                    size="lg"
                  >
                    {t("auth.continue")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                /* Step 2: Account Security */
                <form onSubmit={handleSignupSubmit} className="space-y-4 animate-in fade-in duration-200">
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("auth.phone_plus250")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0781234567"
                      onBlur={() => setPhoneTouched(true)}
                      className={`focus-visible:ring-emerald-500 transition-all duration-200 ${
                        showPhoneError ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                      required
                    />
                    {showPhoneError && (
                      <p className="text-xs text-destructive font-semibold">
                        {t("auth.error.invalid_phone_short")}
                      </p>
                    )}
                  </div>

                  {/* Password with Strength bar */}
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.password_min8")}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10 focus-visible:ring-emerald-500 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span>{t("auth.password_strength.label")}</span>
                          <span className={strength.textColor}>{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password with checkmark on match */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("auth.confirm_password")}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10 focus-visible:ring-emerald-500 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {passwordsMatch && (
                        <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-success animate-in zoom-in duration-200" />
                      )}
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                      className="mt-0.5"
                      required
                    />
                    <Label htmlFor="terms" className="text-xs text-muted-foreground font-medium leading-relaxed">
                      {t("auth.terms.prefix")}{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline"
                      >
                        {t("auth.terms.terms_of_service")}
                      </a>{" "}
                      {t("auth.terms.and")}{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline"
                      >
                        {t("auth.terms.privacy_policy")}
                      </a>
                    </Label>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
                    </button>

                    <Button
                      type="submit"
                      className="bg-gradient-hero hover:opacity-95 font-bold shadow-md rounded-xl transition-all duration-200 flex-1 sm:flex-none"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? t("auth.signing_up") : t("auth.complete_signup")}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom Switch Link */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {isSignup ? t("auth.have") + " " : t("auth.new_to_aguka") + " "}{" "}
            <Link
              to="/auth"
              search={{ mode: isSignup ? "signin" : "signup" }}
              className="font-bold text-primary hover:underline hover:text-emerald-700 transition-colors"
              onClick={() => {
                // reset inputs
                setPhone("");
                setPhoneTouched(false);
                setPassword("");
                setConfirmPassword("");
                setName("");
                setEmail("");
                setSignupStep(1);
              }}
            >
              {isSignup ? t("auth.signin") : t("auth.register")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
