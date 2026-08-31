import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onOpen: () => void;
  onExport: (format: string) => void;
}

export function ReportCard({ title, description, icon, onOpen, onExport }: ReportCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2 text-primary">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          View full details, interactive charts, and verifiable data logs for this report.
        </p>
      </CardContent>
      <CardFooter className="flex gap-2 justify-between">
        <Button variant="default" onClick={onOpen} className="flex-1">
          Open Report
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("pdf")}>
              <FileText className="mr-2 h-4 w-4" /> PDF Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("excel")}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("csv")}>
              <FileJson className="mr-2 h-4 w-4" /> CSV Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
