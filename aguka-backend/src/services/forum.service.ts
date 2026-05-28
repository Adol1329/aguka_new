import { prisma } from "../prisma.js";
import { NotFoundError } from "../middleware/error.middleware.js";

export class ForumService {
  async getPosts(
    _userId: string,
    filters: { category?: string; limit?: number; page?: number } = {},
  ) {
    const { category, limit = 20, page = 1 } = filters;
    const skip = (page - 1) * limit;

    const posts = await prisma.forumPost.findMany({
      where: category ? { category } : {},
      include: {
        farmer: {
          select: {
            fullName: true,
            farmName: true,
            user: {
              select: {
                phone: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    const total = await prisma.forumPost.count({
      where: category ? { category } : {},
    });

    return {
      posts: posts.map((p) => this.formatPost(p)),
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
        farmer: {
          select: {
            fullName: true,
            farmName: true,
            user: {
              select: {
                phone: true,
              },
            },
          },
        },
        comments: {
          include: {
            farmer: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    return this.formatPost(post);
  }

  async createPost(
    userId: string,
    data: { title: string; content: string; category?: string },
  ) {
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!farmerProfile) {
      throw new NotFoundError("Farmer profile");
    }

    const post = await prisma.forumPost.create({
      data: {
        farmerId: farmerProfile.id,
        title: data.title,
        content: data.content,
        category: data.category || "General",
      },
    });

    return post;
  }

  async likePost(_userId: string, postId: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        likesCount: { increment: 1 },
      },
    });

    return { liked: true, likesCount: updatedPost.likesCount };
  }

  async addComment(userId: string, postId: string, content: string) {
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId },
    });

    if (!farmerProfile) {
      throw new NotFoundError("Farmer profile");
    }

    const comment = await prisma.forumComment.create({
      data: {
        farmerId: farmerProfile.id,
        postId,
        content,
      },
    });

    // Update comment count on post
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        commentsCount: { increment: 1 },
      },
    });

    return comment;
  }

  private formatPost(post: any) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      authorName:
        post.farmer?.fullName || post.farmer?.user?.phone || "Unknown Farmer",
      authorFarm: post.farmer?.farmName,
      commentCount: post.commentsCount || post._count?.comments || 0,
      likeCount: post.likesCount || 0,
      createdAt: post.createdAt,
      comments: post.comments?.map((c: any) => ({
        id: c.id,
        content: c.content,
        authorName: c.farmer?.fullName || "Farmer",
        createdAt: c.createdAt,
      })),
    };
  }
}

export const forumService = new ForumService();
