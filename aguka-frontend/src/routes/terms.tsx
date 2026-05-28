import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Shield, FileText, ArrowLeft, Leaf, CheckCircle2, Cloud, Sparkles } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();

  const sections = [
    {
      id: "01",
      title: "Kwemera Amategeko / Acceptance of Terms",
      content: "Mu gukoresha gahunda ya Aguka (aba ari kuri terefone cyangwa mudasobwa), wemeye gukurikiza amategeko n'amabwiriza yose agenga iri koranabuhanga. Niba utemera aya mategeko, ntugakoreshe iyi serivisi.",
    },
    {
      id: "02",
      title: "Kurinda Umutekano w'Amakuru / Data Privacy & Sensors",
      content: "Aguka ikorana n'ibyuma bipima ubutaka (sensors) n'ikirere. Twubaha kandi tukarinda amakuru yose y'imirima yawe n'umusaruro wawe. Amakuru yawe ntashobora guhabwa abandi bantu batabifitiye uburenganzira mu buryo bw'amategeko.",
    },
    {
      id: "03",
      title: "Imenyesha n'Inama z'Ubuhinzi / In-App Advisories Only",
      content: "Inama zose n'imenyesha ry'ubutaka cyangwa ikirere bitangwa binyuze muri porogaramu ya Aguka (In-App notifications). Serivisi z'imenyesha rya SMS cyangwa USSD ntabwo zikoreshwa kuko zitarashyirwa mu bikorwa muri iri koranabuhanga.",
    },
    {
      id: "04",
      title: "Inshingano z'Umuhinzi / User Obligations",
      content: "Umuhinzi afite inshingano zo kurinda ibikoresho bya sensor mu murima we, gutanga amakuru y'ukuri mu gihe biyandikisha, no gukurikira inama z'ubuhinzi hashingiwe ku bipimo bitangwa na Aguka.",
    },
    {
      id: "05",
      title: "Guhagarika Serivisi / Termination of Service",
      content: "Aguka ifite uburenganzira bwo guhagarika konti y'umukoresha wese wishe amategeko n'amabwiriza, cyangwa ukoresheje nabi ibikoresho n'amakuru y'ikoranabuhanga.",
    },
  ];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Panel: Aguka Branding & Slogan */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-white lg:flex overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-900 opacity-[0.98]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5 z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <Leaf className="h-5 w-5 text-emerald-300" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-white">Aguka</span>
        </Link>

        <div className="relative space-y-6 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" />
            Umutekano n'Amategeko
          </div>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
            Amategeko n'Amabwiriza Agenga Aguka
          </h2>
          <p className="max-w-md text-emerald-100/80 leading-relaxed text-sm">
            Soma witonze amategeko agenga ikoreshwa rya gahunda ya Aguka, kurinda amakuru y'ubutaka n'ikirere, hamwe n'inshingano za buri muhinzi n'umufatanyabikorwa.
          </p>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" />
              <span>Kinyarwanda translation as the base system</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" />
              <span>Real-time in-app advisory protection</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" />
              <span>No SMS/USSD dependency rules enforced</span>
            </div>
          </div>
        </div>

        <div className="relative text-xs text-emerald-200/50 z-10">
          © 2026 Imbaraga Farmers Organization
        </div>
      </div>

      {/* Right Panel: Scrollable Content with comfortable margins */}
      <div className="flex flex-col bg-slate-50/50 min-h-screen">
        {/* Upper Header with Language Switcher */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-white">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <span className="font-display font-bold text-lg">Aguka</span>
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Comfortable scrollable container */}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-12 md:px-12">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-zinc-950">
                  Amategeko n'Amabwiriza
                </h1>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
                  Terms & Conditions · Last Updated May 2026
                </p>
              </div>
            </div>

            {/* Main scrollable body */}
            <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {sections.map((sec) => (
                <div key={sec.id} className="space-y-2 group">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {sec.id}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-700 transition-colors">
                      {sec.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed pl-8 font-medium">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Premium, clearly-styled Back Button */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
              <Button asChild variant="outline" className="border-emerald-600/30 text-emerald-700 hover:bg-emerald-50/50 hover:text-emerald-800 font-bold rounded-xl px-5 py-2.5 h-auto transition-all duration-200">
                <Link to="/auth" search={{ mode: "signup" }}>
                  <ArrowLeft className="mr-2 h-4 w-4 stroke-[2.5]" /> Subira Inyuma / Go Back
                </Link>
              </Button>

              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Umutekano Wizeye</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
