import { apiClient } from "./client";

export enum PostAudience {
  GLOBAL = "GLOBAL",
  DISTRICT = "DISTRICT",
  COOPERATIVE = "COOPERATIVE",
  ASSIGNED_FARMERS = "ASSIGNED_FARMERS",
}

export enum PostType {
  COMMUNITY_POST = "COMMUNITY_POST",
  COMMUNITY_ADVISORY = "COMMUNITY_ADVISORY",
  COMMUNITY_ALERT = "COMMUNITY_ALERT",
  COMMUNITY_EMERGENCY = "COMMUNITY_EMERGENCY",
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  type: PostType;
  priority: string;
  audienceType: PostAudience;
  audienceId?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  authorFarm?: string;
  authorDistrict?: string;
  imageUrls: string[];
  videoUrls: string[];
  attachmentUrls: string[];
  commentCount: number;
  likeCount: number;
  viewCount: number;
  hasLiked: boolean;
  isPinned: boolean;
  isAnswered: boolean;
  isKnowledgeBase: boolean;
  createdAt: string;
  comments?: ForumComment[];
}

export interface ForumComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  isAcceptedAnswer: boolean;
  createdAt: string;
  replies?: ForumComment[];
}

export const forumApi = {
  getPosts: (params?: {
    category?: string;
    page?: number;
    limit?: number;
    audienceType?: PostAudience;
    audienceId?: string;
  }) => {
    const formattedParams: Record<string, string> = {};
    if (params) {
      if (params.category) formattedParams.category = params.category;
      if (params.page) formattedParams.page = String(params.page);
      if (params.limit) formattedParams.limit = String(params.limit);
      if (params.audienceType) formattedParams.audienceType = params.audienceType;
      if (params.audienceId) formattedParams.audienceId = params.audienceId;
    }
    return apiClient.get<{ posts: ForumPost[]; pagination: any }>("/forums", formattedParams);
  },

  getPost: (id: string) => apiClient.get<ForumPost>(`/forums/${id}`),

  createPost: (data: {
    title: string;
    content: string;
    category?: string;
    type?: PostType;
    priority?: string;
    audienceType?: PostAudience;
    audienceId?: string;
    imageUrls?: string[];
    videoUrls?: string[];
    attachmentUrls?: string[];
  }) => apiClient.post<ForumPost>("/forums", data),

  likePost: (id: string) => apiClient.post<{ liked: boolean; likesCount: number }>(`/forums/${id}/like`),

  addComment: (id: string, content: string, parentCommentId?: string) =>
    apiClient.post<ForumComment>(`/forums/${id}/comments`, { content, parentCommentId }),

  markAsSeen: (id: string) => apiClient.post<{ success: boolean }>(`/forums/${id}/seen`),

  reportPost: (id: string, reason: string) =>
    apiClient.post<{ success: boolean }>(`/forums/${id}/report`, { reason }),

  pinPost: (id: string, isPinned: boolean) =>
    apiClient.post<{ success: boolean }>(`/forums/${id}/pin`, { isPinned }),

  verifyAnswer: (commentId: string) =>
    apiClient.post<{ success: boolean }>(`/forums/comments/${commentId}/verify`),

  promoteToKnowledgeBase: (id: string) =>
    apiClient.post<{ success: boolean }>(`/forums/${id}/promote`),

  deletePost: (id: string) => apiClient.delete<{ success: boolean }>(`/forums/${id}`),
};
