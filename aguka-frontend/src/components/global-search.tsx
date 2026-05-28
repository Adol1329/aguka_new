import * as React from "react";
import { 
  Search, 
  Mic, 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Command as CommandIcon,
  X,
  Loader2
} from "lucide-react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/hooks/use-search";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n";

const icons: Record<string, any> = {
  sprout: Sprout,
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  "message-square": MessageSquare,
  user: User,
};

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { data: results, isLoading } = useSearch(query);
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "s" && !open && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const handleSelect = (url?: string) => {
    if (url) {
      navigate({ to: url });
      setOpen(false);
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("global_search.voice_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Map internal language codes to BCP 47
    const langMap: any = {
      rw: 'rw-RW',
      fr: 'fr-FR',
      en: 'en-US'
    };
    recognition.lang = langMap[lang] || 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.start();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex h-10 w-full items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 text-sm text-muted-foreground transition-all hover:bg-muted/50 md:w-64"
      >
        <Search className="h-4 w-4" />
        <span>{t("common.search")}...</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">S</span>
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
            >
              <Command className="flex h-full w-full flex-col">
                <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                  <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                  <Command.Input
                    autoFocus
                    placeholder={t('common.search') + "..."}
                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    value={query}
                    onValueChange={setQuery}
                  />
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={startVoiceSearch}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-1"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2">
                  <Command.Empty className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">{t("global_search.empty.title")}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate({ to: '/farmer/community' })}>
                          {t("global_search.empty.search_community")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate({ to: '/farmer/profile' })}>
                          {t("global_search.empty.contact_services")}
                        </Button>
                      </div>
                    </div>
                  </Command.Empty>

                  {results && Object.entries(results).map(([category, items]) => (
                    <Command.Group key={category} heading={category} className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {items.map((item) => {
                        const Icon = icons[item.icon || "sprout"] || Sprout;
                        return (
                          <Command.Item
                            key={item.id}
                            onSelect={() => handleSelect(item.url)}
                            className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-all hover:bg-primary/10 aria-selected:bg-primary/10"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium group-hover:text-primary">{item.title}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</span>
                            </div>
                          </Command.Item>
                        );
                      })}
                    </Command.Group>
                  ))}
                </Command.List>

                <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border bg-background px-1">↑↓</kbd> {t("global_search.hint.navigate")}
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border bg-background px-1">↵</kbd> {t("global_search.hint.select")}
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border bg-background px-1">ESC</kbd> {t("global_search.hint.close")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CommandIcon className="h-3 w-3" />
                    <span>{t("global_search.title")}</span>
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
