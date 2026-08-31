import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReportTableSection } from "@/api/reports-v2";

export function TableSectionCard({ table }: { table: ReportTableSection }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {table.icon && <span>{table.icon}</span>}
          {table.heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {table.columns.map((c) => (
                  <TableHead key={c.key} className={`text-${c.align ?? "left"}`}>
                    {c.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={table.columns.length}
                    className="text-center text-muted-foreground"
                  >
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                table.rows.map((row, i) => (
                  <TableRow key={i}>
                    {table.columns.map((c) => (
                      <TableCell key={c.key} className={`text-${c.align ?? "left"}`}>
                        {formatCell(row[c.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {table.footnote && (
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            {table.footnote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
}
