import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ArrowLeft, ShieldAlert, PhoneCall, FileText, CheckCircle2, ShieldCheck, Mail } from "lucide-react";

export const Route = createFileRoute("/forgot-password/support")({
  validateSearch: (s: Record<string, unknown>): { phone: string } => ({
    phone: String(s.phone || ""),
  }),
  component: ForgotPasswordSupportPage,
});

function ForgotPasswordSupportPage() {
  const { phone } = Route.useSearch();

  const supportSteps = [
    {
      title: "Contact Cooperative Manager or Extension Officer",
      desc: "Reach out to your cooperative head or local representative in person or via telephone.",
      icon: PhoneCall,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Provide Account Identification Details",
      desc: "Specify your registered phone number (" + phone + ") and verify your full name with a national ID card.",
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Receive a Temporary Password",
      desc: "The admin will reset your credentials via the Admin User Dashboard and supply a temporary password.",
      icon: ShieldCheck,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Sign In & Force Change Password",
      desc: "Log in with the temporary password and you will be immediately prompted to set your new private password.",
      icon: CheckCircle2,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

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
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Smart Farming Kit</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-200 backdrop-blur-md ring-1 ring-white/10">
            <ShieldAlert className="h-4 w-4" />
            <span>Admin-Assisted Mode</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Account recovery support.
          </h2>
          <p className="text-lg text-emerald-100/90 leading-relaxed">
            Because there is no email linked to your account, a secure admin-assisted password reset is required.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <Link
            to="/forgot-password"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Link>
          <span className="text-xs text-emerald-200/60">Powered by Imbaraga</span>
        </div>
      </div>

      {/* RIGHT CONTENT PANEL */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 sm:px-12 xl:px-20 bg-slate-50/50">
        <div className="mx-auto w-full max-w-xl">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <div>
              <span className="text-xl font-bold text-slate-900">Aguka</span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-600">Smart Farming</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Recovery via Support
              </h2>
              <p className="text-sm text-slate-500">
                To guarantee account privacy and safety, please follow these steps to reset your password:
              </p>
            </div>

            {/* Steps list */}
            <div className="space-y-4">
              {supportSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${step.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step {idx + 1}</span>
                      <h4 className="text-base font-bold text-slate-800">{step.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Support Info */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 space-y-3">
              <h5 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Aguka Helpdesk
              </h5>
              <p className="text-sm text-emerald-700 leading-relaxed font-medium">
                Need immediate help? Contact Aguka support directly at:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1 text-sm text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-emerald-600" />
                  +250 788 123 456
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  support@aguka.imbaraga.org
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
