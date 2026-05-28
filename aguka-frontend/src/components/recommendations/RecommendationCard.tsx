import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RecommendationBadge } from "./RecommendationBadge";
import { acceptRecommendation, dismissRecommendation } from "@/lib/recommendationApi";
import { useToast } from "@/hooks/use-toast";

interface RecommendationCardProps {
  recommendation: {
    id: string;
    title: string;
    message: string;
    recommendation: string;
    confidence: 'low' | 'medium' | 'high';
    priority: number;
    actionRequired: boolean;
    details?: Record<string, any>;
  };
}

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptRecommendation(recommendation.id, "placeholder"); // Type would come from context
      toast({
        title: "Recommendation accepted",
        description: "Your action has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await dismissRecommendation(recommendation.id, "placeholder"); // Type would come from context
      toast({
        title: "Recommendation dismissed",
        description: "This recommendation has been dismissed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg flex-1">
          {recommendation.title}
        </h3>
        <RecommendationBadge confidence={recommendation.confidence} />
      </div>
      
      <p className="text-muted-foreground mb-4">{recommendation.message}</p>
      
      <div className="bg-muted p-4 rounded-lg mb-4">
        <p className="font-medium mb-2">Recommended Action:</p>
        <p className="text-sm">{recommendation.recommendation}</p>
      </div>
      
      {recommendation.details && Object.keys(recommendation.details).length > 0 && (
        <div className="mb-4">
          <p className="font-medium mb-2">Details:</p>
          <div className="text-sm space-y-1">
            {Object.entries(recommendation.details).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-medium w-24">{`${key}:`}</span>
                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline"
          size="sm"
          disabled={isDismissing}
          onClick={handleDismiss}
          className={isDismissing ? "opacity-50" : ""}
        >
          {isDismissing ? "Dismissing..." : "Dismiss"}
        </Button>
        <Button 
          variant={recommendation.actionRequired ? "default" : "outline"}
          size="sm"
          disabled={isAccepting}
          onClick={handleAccept}
          className={isAccepting ? "opacity-50" : ""}
        >
          {isAccepting ? "Accepting..." : recommendation.actionRequired ? "Accept" : "Mark as Read"}
        </Button>
      </div>
    </div>
  );
};