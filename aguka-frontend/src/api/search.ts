import { apiClient } from './client';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'crop' | 'market' | 'alert' | 'forum' | 'user';
  category: string;
  icon?: string;
  url?: string;
  metadata?: any;
}

export interface GlobalSearchResponse {
  [category: string]: SearchResult[];
}

export const searchApi = {
  globalSearch: (query: string) =>
    apiClient.get<GlobalSearchResponse>('/search', { q: query }),
};
