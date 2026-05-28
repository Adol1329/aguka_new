export interface Recommendation {
  id: string;
  farmerId: string;
  type: string; // irrigation, pest-disease, fertilizer, etc.
  title: string;
  message: string;
  recommendation: string;
  confidence: 'low' | 'medium' | 'high';
  priority: number; // 1-5 scale
  actionRequired: boolean;
  details?: Record<string, any>;
  isRead?: boolean;
  generatedAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
}