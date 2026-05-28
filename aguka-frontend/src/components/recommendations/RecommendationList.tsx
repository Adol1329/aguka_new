import { useState, useEffect } from "react";
import { RecommendationCard } from "./RecommendationCard";
import { fetchRecommendations } from "@/lib/recommendationApi";
import { Loader2 } from "lucide-react";

interface RecommendationListProps {
  type?: string; // Optional filter by type
}

export const RecommendationList = ({ type }: RecommendationListProps = {}) => {
  const [recommendations, setRecommendations] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecommendations(type);
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [type]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-medium text-red-800 mb-2">Error loading recommendations</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recommendations available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
};