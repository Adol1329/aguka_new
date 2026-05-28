import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: TablePaginationProps) {
  const { t } = useI18n();

  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-6 mt-6">
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            {t("table.pagination.showing")} <span className="font-medium text-foreground">{startItem}</span> {t("table.pagination.to")}{" "}
            <span className="font-medium text-foreground">{endItem}</span> {t("table.pagination.of")}{" "}
            <span className="font-medium text-foreground">{totalItems}</span> {t("table.pagination.entries")}
          </>
        ) : (
          t("table.pagination.no_entries")
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          title={t("table.pagination.first_page")}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title={t("table.pagination.previous_page")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-center min-w-[3rem] text-sm font-medium">
          {page} / {totalPages || 1}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          title={t("table.pagination.next_page")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || totalPages === 0}
          title={t("table.pagination.last_page")}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
