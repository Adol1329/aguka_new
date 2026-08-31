import { prisma } from "../prisma.js";
import { NotFoundError, ForbiddenError } from "../middleware/error.middleware.js";
import { notificationRuleService } from "./notification-rule.service.js";
import { PostAudience, PostStatus, PostType, UserRole } from "@prisma/client";
import { logger } from "../utils/logger.js";

let realtimeSyncInstance: any = null;

export const setForumRealTimeSync = (instance: any) => {
  realtimeSyncInstance = instance;
};

export class ForumService {
  /**
   * Get community posts with scoped filtering
   */
  async getPosts(
    _userId: string,
    filters: {
      category?: string;
      limit?: number;
      page?: number;
      audienceType?: PostAudience;
      audienceId?: string;
    } = {},
  ) {
    const { category, limit = 20, page = 1, audienceType, audienceId } = filters;
    const skip = (page - 1) * limit;

    // Get user to determine default scope
    const user = await prisma.user.findUnique({
      where: { id: _userId },
      include: {
        farmerProfile: true,
        officerProfile: true,
        cooperativeProfile: true,
      },
    });

    if (!user) throw new NotFoundError("User");

    // Define scope conditions
    let scopeCondition: any = {
      OR: [
        { audienceType: PostAudience.GLOBAL },
      ],
    };

    if (user.role === UserRole.farmer && user.farmerProfile) {
      if (user.farmerProfile.cooperativeId) {
        scopeCondition.OR.push({
          audienceType: PostAudience.COOPERATIVE,
          audienceId: user.farmerProfile.cooperativeId,
        });
      }
      if (user.farmerProfile.district) {
        scopeCondition.OR.push({
          audienceType: PostAudience.DISTRICT,
          audienceId: user.farmerProfile.district,
        });
      }
    }

    // Admins and Officers can see everything for moderation/visibility
    if (user.role === UserRole.admin || user.role === UserRole.super_admin || user.role === UserRole.officer) {
      scopeCondition = {};
    }

    // Explicit filter override if provided
    if (audienceType) {
      scopeCondition = { audienceType, ...(audienceId ? { audienceId } : {}) };
    }

    const whereClause = {
      ...scopeCondition,
      ...(category ? { category } : {}),
      // Hide reported/hidden/archived posts from normal users
      ...(user.role === UserRole.admin || user.role === UserRole.super_admin
        ? {}
        : { status: PostStatus.active }),
    };

    const posts = await prisma.forumPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            avatarUrl: true,
            farmerProfile: { select: { farmName: true, district: true } },
            officerProfile: { select: { organization: true } },
            cooperativeProfile: { select: { cooperativeName: true } },
          },
        },
        likes: {
          where: { userId: _userId },
          select: { id: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip,
    });

    const total = await prisma.forumPost.count({
      where: whereClause,
    });

    return {
      posts: posts.map((p) => ({
        ...this.formatPost(p),
        hasLiked: p.likes.length > 0,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(postId: string, _userId: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
            avatarUrl: true,
            farmerProfile: { select: { farmName: true, district: true } },
            officerProfile: { select: { organization: true } },
            cooperativeProfile: { select: { cooperativeName: true } },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                role: true,
                avatarUrl: true,
              },
            },
            replies: {
              include: {
                author: { select: { id: true, fullName: true, role: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          where: { userId: _userId },
          select: { id: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    return {
      ...this.formatPost(post),
      hasLiked: post.likes.length > 0,
    };
  }

  /**
   * Create a new post with audience scoping and classification
   */
  async createPost(
    userId: string,
    data: {
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
    },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { farmerProfile: true, officerProfile: true, cooperativeProfile: true },
    });

    if (!user) throw new NotFoundError("User");

    // Default values if not provided
    const type = data.type || PostType.COMMUNITY_POST;
    const audienceType = data.audienceType || PostAudience.GLOBAL;
    let audienceId = data.audienceId;

    // Automatic scoping if not provided
    if (!audienceId) {
      if (audienceType === PostAudience.COOPERATIVE) {
        audienceId = user.farmerProfile?.cooperativeId || user.cooperativeProfile?.id;
      } else if (audienceType === PostAudience.DISTRICT) {
        audienceId = user.farmerProfile?.district;
      }
    }

    const post = await prisma.forumPost.create({
      data: {
        authorId: userId,
        title: data.title,
        content: data.content,
        category: data.category || "General",
        type,
        priority: data.priority || (type === PostType.COMMUNITY_EMERGENCY ? "urgent" : "normal"),
        audienceType,
        audienceId,
        imageUrls: data.imageUrls || [],
        videoUrls: data.videoUrls || [],
        attachmentUrls: data.attachmentUrls || [],
        cooperativeId: user.farmerProfile?.cooperativeId || null,
      },
    });

    // 1. Trigger Notifications for high-priority events
    if (type === PostType.COMMUNITY_ADVISORY || type === PostType.COMMUNITY_ALERT || type === PostType.COMMUNITY_EMERGENCY) {
      await this.notifyAudience(post, user);
    }

    // 2. Emit real-time feed update
    if (realtimeSyncInstance) {
      realtimeSyncInstance.broadcastCommunityEvent(
        {
          type: "post:new",
          post: await this.getPostById(post.id, userId),
        },
        { type: post.audienceType, id: post.audienceId || undefined },
      );
    }

    return post;
  }

  async likePost(userId: string, postId: string) {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
      const updatedPost = await prisma.forumPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });

      // Emit real-time update
      if (realtimeSyncInstance) {
        realtimeSyncInstance.broadcastCommunityEvent(
          { type: "reaction:new", postId, likesCount: updatedPost.likesCount, liked: false },
          { type: updatedPost.audienceType, id: updatedPost.audienceId || undefined },
        );
      }

      return { liked: false, likesCount: updatedPost.likesCount };
    }

    await prisma.postLike.create({ data: { postId, userId } });
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      include: { author: { select: { id: true, fullName: true } } },
      data: { likesCount: { increment: 1 } },
    });

    // 1. Notify author (LOW priority)
    if (updatedPost.authorId !== userId) {
      notificationRuleService.createNotification({
        userId: updatedPost.authorId,
        title: "New Like",
        message: "Someone liked your post.",
        type: "COMMUNITY_LIKE",
        priority: "low",
        metadata: { postId },
      });
    }

    // 2. Emit real-time feed update
    if (realtimeSyncInstance) {
      realtimeSyncInstance.broadcastCommunityEvent(
        {
          type: "reaction:new",
          postId: postId,
          likesCount: updatedPost.likesCount,
          liked: true,
        },
        { type: updatedPost.audienceType, id: updatedPost.audienceId || undefined },
      );
    }

    return {
      liked: true,
      likesCount: updatedPost.likesCount,
      authorId: updatedPost.authorId,
    };
  }

  async addComment(
    userId: string,
    postId: string,
    content: string,
    parentCommentId?: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError("User");

    const comment = await prisma.forumComment.create({
      data: {
        authorId: userId,
        postId,
        content,
        parentCommentId: parentCommentId || null,
      },
      include: {
        author: { select: { fullName: true } },
        post: { include: { author: true } },
      },
    });

    // Update comment count on post
    await prisma.forumPost.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    // 1. Notify author (NORMAL priority)
    if (comment.post.authorId !== userId) {
      notificationRuleService.createNotification({
        userId: comment.post.authorId,
        title: "New Reply",
        message: `${user.fullName || "Someone"} replied to your post.`,
        type: "COMMUNITY_COMMENT",
        priority: "normal",
        metadata: { postId, commentId: comment.id },
      });
    }

    // 2. Emit real-time feed update
    if (realtimeSyncInstance) {
      realtimeSyncInstance.broadcastCommunityEvent(
        {
          type: "comment:new",
          postId: postId,
          comment: {
            id: comment.id,
            content: comment.content,
            authorName: (comment as any).author?.fullName || "Member",
            authorRole: user.role,
            authorId: userId,
            createdAt: comment.createdAt,
            parentCommentId: comment.parentCommentId,
          },
        },
        { type: comment.post.audienceType, id: comment.post.audienceId || undefined },
      );
    }

    return comment;
  }

  /**
   * Internal helper to notify target audience for advisories and alerts
   */
  private async notifyAudience(post: any, author: any) {
    try {
      let targetUsers: string[] = [];

      if (post.audienceType === PostAudience.GLOBAL) {
        const users = await prisma.user.findMany({
          where: { role: UserRole.farmer, isActive: true },
          select: { id: true },
        });
        targetUsers = users.map(u => u.id);
      } else if (post.audienceType === PostAudience.DISTRICT && post.audienceId) {
        const users = await prisma.user.findMany({
          where: { 
            role: UserRole.farmer, 
            isActive: true,
            farmerProfile: { district: post.audienceId }
          },
          select: { id: true },
        });
        targetUsers = users.map(u => u.id);
      } else if (post.audienceType === PostAudience.COOPERATIVE && post.audienceId) {
        const users = await prisma.user.findMany({
          where: { 
            role: UserRole.farmer, 
            isActive: true,
            farmerProfile: { cooperativeId: post.audienceId }
          },
          select: { id: true },
        });
        targetUsers = users.map(u => u.id);
      } else if (post.audienceType === PostAudience.ASSIGNED_FARMERS) {
        const assignments = await prisma.extensionOfficerAssignment.findMany({
          where: { extensionOfficerId: author.id },
          select: { farmerId: true },
        });
        targetUsers = assignments.map(a => a.farmerId);
      }

      // Batch create notifications through dispatcher
      for (const targetId of targetUsers) {
        if (targetId === author.id) continue;
        
        notificationRuleService.createNotification({
          userId: targetId,
          title: post.type === PostType.COMMUNITY_EMERGENCY ? "🚨 EMERGENCY ALERT" : "New Advisory",
          message: post.title || post.content.substring(0, 100),
          type: post.type,
          priority: post.priority,
          metadata: { postId: post.id, authorId: author.id },
        });
      }

      logger.info(`Notified ${targetUsers.length} users for community event ${post.id}`);
    } catch (err) {
      logger.error("Failed to notify audience for community post:", err);
    }
  }

  async markAsSeen(_userId: string, postId: string) {
    await prisma.forumPost.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } },
    });
    return { success: true };
  }

  async reportPost(userId: string, postId: string, reason: string) {
    return prisma.postReport.create({
      data: { postId, userId, reason },
    });
  }

  async pinPost(_userId: string, postId: string, isPinned: boolean) {
    const post = await prisma.forumPost.update({
      where: { id: postId },
      data: { isPinned },
    });

    if (realtimeSyncInstance) {
      realtimeSyncInstance.broadcastCommunityEvent(
        { type: "post:pinned", postId, isPinned },
        { type: post.audienceType, id: post.audienceId || undefined },
      );
    }

    return post;
  }

  async verifyAnswer(_userId: string, commentId: string) {
    const comment = await prisma.forumComment.update({
      where: { id: commentId },
      data: { isAcceptedAnswer: true },
    });

    const post = await prisma.forumPost.update({
      where: { id: comment.postId },
      data: { isAnswered: true },
    });

    if (realtimeSyncInstance) {
      realtimeSyncInstance.broadcastCommunityEvent(
        { type: "comment:verified", postId: post.id, commentId },
        { type: post.audienceType, id: post.audienceId || undefined },
      );
    }

    return comment;
  }

  async promoteToKnowledgeBase(_userId: string, postId: string) {
    return prisma.forumPost.update({
      where: { id: postId },
      data: { isKnowledgeBase: true },
    });
  }

  async deletePost(userId: string, postId: string, userRole: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundError("Post");

    if (
      post.authorId !== userId &&
      userRole !== UserRole.admin &&
      userRole !== UserRole.super_admin
    ) {
      throw new ForbiddenError("Unauthorized to delete this post");
    }

    // Emit real-time removal before deleting
    if (realtimeSyncInstance) {
      realtimeSyncInstance.broadcastCommunityEvent(
        { type: "post:deleted", postId },
        { type: post.audienceType, id: post.audienceId || undefined },
      );
    }

    await prisma.forumPost.delete({ where: { id: postId } });
    return { success: true };
  }

  private formatPost(post: any) {
    const formatComment = (c: any): any => ({
      id: c.id,
      content: c.content,
      authorName: c.author?.fullName || "Member",
      authorRole: c.author?.role || "farmer",
      authorId: c.author?.id,
      authorAvatar: c.author?.avatarUrl,
      isAcceptedAnswer: c.isAcceptedAnswer || false,
      createdAt: c.createdAt,
      replies: c.replies ? c.replies.map(formatComment) : [],
    });

    const rootComments = post.comments
      ? post.comments.filter((c: any) => !c.parentCommentId).map(formatComment)
      : [];

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      type: post.type,
      priority: post.priority,
      audienceType: post.audienceType,
      audienceId: post.audienceId,
      imageUrls: post.imageUrls,
      videoUrls: post.videoUrls,
      attachmentUrls: post.attachmentUrls,
      authorId: post.author?.id,
      authorRole: post.author?.role,
      authorName: post.author?.fullName || "Unknown Member",
      authorAvatar: post.author?.avatarUrl,
      authorFarm: post.author?.farmerProfile?.farmName,
      authorDistrict: post.author?.farmerProfile?.district,
      commentCount: post.commentsCount || post._count?.comments || 0,
      likeCount: post.likesCount || 0,
      viewCount: post.viewsCount || 0,
      isPinned: post.isPinned || false,
      isAnswered: post.isAnswered || false,
      isKnowledgeBase: post.isKnowledgeBase || false,
      status: post.status,
      createdAt: post.createdAt,
      comments: rootComments,
    };
  }
}

export const forumService = new ForumService();
