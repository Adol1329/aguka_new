import { cn } from "@/lib/utils";

interface RecommendationBadgeProps {
  confidence: 'low' | 'medium' | 'high';
  className?: string;
}

export const RecommendationBadge = ({ 
  confidence, 
  className = "" 
}: RecommendationBadgeProps) => {
  // Map confidence levels to colors and labels
  const variants: Record<'low' | 'medium' | 'high', { 
    bg: string; 
    text: string; 
    label: string 
  }> = {
    low: { 
      bg: "bg-green-50", 
      text: "text-green-800", 
      label: "Low" 
    },
    medium: { 
      bg: "bg-yellow-50", 
      text: "text-yellow-800", 
      label: "Medium" 
    },
    high: { 
      bg: "bg-red-50", 
      text: "text-red-800", 
      label: "High" 
    }
  };

  const variant = variants[confidence];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variant.bg,
      variant.text,
      className
    )}>
      {variant.label}
    </span>
  );
};