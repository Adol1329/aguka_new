import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useMarketPrices, usePriceAlerts, useCreatePriceAlert } from "@/hooks/use-data";
import { useTableSearch } from "@/hooks/use-table-search";
import { TableSearchBar } from "@/components/table-search-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { TablePagination } from "@/components/table-pagination";
import { TrendingUp, TrendingDown, Minus, Loader2, MapPin, Bell, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/farmer/market")({
  component: MarketPage,
});

function MarketPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'prices' | 'alerts'>('prices');
  const { data: prices, isLoading: isPricesLoading } = useMarketPrices();
  const { data: alerts, isLoading: isAlertsLoading } = usePriceAlerts();
  const createAlert = useCreatePriceAlert();

  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ cropId: "", targetPrice: "", alertType: "below" });

  const { query, setQuery, filteredData: displayedPrices, reset } = useTableSearch(
    prices || [],
    ['crop.nameEn', 'marketName', 'district', 'trend']
  );

  const { 
    paginatedItems, 
    page, 
    setPage, 
    totalPages, 
    totalItems, 
    pageSize 
  } = useClientPagination(displayedPrices, 10);

  const handleCreateAlert = async () => {
    if (!newAlert.cropId || !newAlert.targetPrice) {
      toast.error(t("market.error.select_crop_and_price"));
      return;
    }
    createAlert.mutate({
      cropId: newAlert.cropId,
      targetPrice: parseFloat(newAlert.targetPrice),
      alertType: newAlert.alertType
    }, {
      onSuccess: () => {
        toast.success(t("market.success.alert_created"));
        setShowAddAlert(false);
        setNewAlert({ cropId: "", targetPrice: "", alertType: "below" });
      },
      onError: () => toast.error(t("market.error.create_alert_failed"))
    });
  };

  const isLoading = isPricesLoading || isAlertsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t("market.page.title")}
          subtitle={t("market.page.subtitle")}
        />
        <div className="flex p-1 bg-muted rounded-lg">
          <Button 
            variant={activeTab === 'prices' ? 'default' : 'ghost'} 
            size="sm" 
            className="text-xs"
            onClick={() => setActiveTab('prices')}
          >
            {t("market.tab.prices")}
          </Button>
          <Button 
            variant={activeTab === 'alerts' ? 'default' : 'ghost'} 
            size="sm" 
            className="text-xs"
            onClick={() => setActiveTab('alerts')}
          >
            {t("market.tab.alerts")}
          </Button>
        </div>
      </div>

      {activeTab === 'prices' ? (
        <Card className="p-6">
          <div className="mb-6 max-w-md">
            <TableSearchBar
              value={query}
              onChange={setQuery}
              onClear={reset}
              placeholder={t("market.search.placeholder")}
              resultsCount={displayedPrices.length}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">{t("market.table.crop")}</th>
                  <th className="pb-3">{t("market.table.market")}</th>
                  <th className="pb-3">{t("market.table.price_per_kg")}</th>
                  <th className="pb-3">{t("market.table.trend")}</th>
                  <th className="pb-3">{t("market.table.last_updated")}</th>
                  <th className="pb-3 text-right">{t("market.table.action")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-4 font-medium">{p.crop?.nameEn}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {p.marketName} · {p.district}
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-primary">{p.priceRwfPerKg}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(p.trend)}
                        <span className="text-xs uppercase font-medium">{p.trend || t("market.trend.stable")}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-muted-foreground">
                      {new Date(p.recordedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setNewAlert({ ...newAlert, cropId: p.cropId });
                        setShowAddAlert(true);
                      }}>
                        <Bell className="h-3.5 w-3.5 mr-1" /> {t("market.action.alert")}
                      </Button>
                    </td>
                  </tr>
                ))}
                {displayedPrices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      {t("market.empty.no_matching_prices")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={setPage}
          />
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 border-dashed flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setShowAddAlert(true)}>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold">{t("market.card.set_price_alert")}</h4>
              <p className="text-xs text-muted-foreground">{t("market.card.get_notified")}</p>
            </div>
          </Card>

          {Array.isArray(alerts) && alerts.map((a: any) => (
            <Card key={a.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={a.isActive ? 'default' : 'secondary'}>
                    {a.isActive ? t("market.badge.active") : t("market.badge.inactive")}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h4 className="font-bold text-lg">{a.crop?.nameEn || t("market.fallback.selected_crop")}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {t("market.alert.when_below")} <span className="font-bold text-foreground">{a.targetPrice} RWF</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t text-[10px] text-muted-foreground flex justify-between items-center">
                <span>{t("market.alert.last_trigger")}: {a.isTriggered ? t("market.alert.recent") : t("market.alert.never")}</span>
                <span className="uppercase font-bold tracking-tighter">SMS {a.smsEnabled ? t("market.alert.sms_on") : t("market.alert.sms_off")}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Alert Dialog */}
      <Dialog open={showAddAlert} onOpenChange={setShowAddAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("market.dialog.create_title")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("market.dialog.crop")}</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newAlert.cropId}
                onChange={(e) => setNewAlert({ ...newAlert, cropId: e.target.value })}
              >
                <option value="">{t("market.dialog.select_crop")}</option>
                {prices?.map((p: any) => (
                  <option key={p.id} value={p.cropId}>{p.crop?.nameEn}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>{t("market.dialog.target_price")}</Label>
              <Input 
                type="number" 
                placeholder={t("market.dialog.target_price_example")} 
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("market.dialog.alert_type")}</Label>
              <div className="flex gap-2">
                <Button 
                  variant={newAlert.alertType === 'below' ? 'default' : 'outline'} 
                  className="flex-1 text-xs"
                  onClick={() => setNewAlert({ ...newAlert, alertType: 'below' })}
                >
                  {t("market.dialog.when_below")}
                </Button>
                <Button 
                  variant={newAlert.alertType === 'above' ? 'default' : 'outline'} 
                  className="flex-1 text-xs"
                  onClick={() => setNewAlert({ ...newAlert, alertType: 'above' })}
                >
                  {t("market.dialog.when_above")}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAlert(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateAlert} disabled={createAlert.isPending} className="bg-primary">
              {t("market.action.set_alert")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
