import { apiClient, type ApiResponse } from "./client";

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  authorFarm?: string;
  commentCount: number;
  likeCount: number;
  createdAt: string;
  comments?: ForumComment[];
}

export interface ForumComment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export const forumApi = {
  getPosts: (params?: { category?: string; page?: number; limit?: number }) => {
    const formattedParams: Record<string, string> = {};
    if (params) {
      if (params.category) formattedParams.category = params.category;
      if (params.page) formattedParams.page = String(params.page);
      if (params.limit) formattedParams.limit = String(params.limit);
    }
    return apiClient.get<{ posts: ForumPost[]; pagination: any }>("/forums", formattedParams);
  },

  getPost: (id: string) =>
    apiClient.get<ForumPost>(`/forums/${id}`),

  createPost: (data: { title: string; content: string; category?: string; tags?: string[] }) =>
    apiClient.post<ForumPost>("/forums", data),

  likePost: (id: string) =>
    apiClient.post<{ liked: boolean }>(`/forums/${id}/like`),

  addComment: (id: string, content: string) =>
    apiClient.post<ForumComment>(`/forums/${id}/comments`, { content }),
};
