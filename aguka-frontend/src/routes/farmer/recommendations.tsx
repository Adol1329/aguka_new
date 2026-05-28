import { createFileRoute } from "@tanstack/react-router";
import { RecommendationList } from "@/components/recommendations/RecommendationList";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/farmer/recommendations")({
  component: () => {
    const { t } = useI18n();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("smart.recommendations")}</h1>
        </div>
        
        <div className="space-y-4">
          {/* All recommendations */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">{t("smart.all_recommendations")}</h2>
            <RecommendationList />
          </div>
          
          {/* Irrigation recommendations */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">{t("smart.irrigation_recommendations")}</h2>
            <RecommendationList type="irrigation" />
          </div>
          
          {/* Pest/Disease recommendations */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">{t("smart.pest_disease_recommendations")}</h2>
            <RecommendationList type="pest-disease" />
          </div>
          
          {/* Fertilizer recommendations */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">{t("smart.fertilizer_recommendations")}</h2>
            <RecommendationList type="fertilizer" />
          </div>
        </div>
      </div>
    );
  }
});