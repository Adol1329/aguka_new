import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n";

interface TableSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear: () => void;
  resultsCount?: number;
}

export function TableSearchBar({ 
  value, 
  onChange, 
  placeholder, 
  onClear,
  resultsCount 
}: TableSearchBarProps) {
  const { t } = useI18n();

  return (
    <div className="relative flex flex-col gap-2 w-full">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || t('common.search') + "..."}
          className="pl-9 pr-12 bg-muted/30 border-border/50 hover:bg-muted/50 focus:bg-background transition-all"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {value && resultsCount !== undefined && (
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider ml-1">
          {resultsCount === 0 ? t("table.search.no_matches") : t("table.search.matches", { count: resultsCount })}
        </div>
      )}
    </div>
  );
}
