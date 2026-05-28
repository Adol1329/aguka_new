import { auditService } from "./audit.service.js";
import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";

interface CreateFeedbackData {
  type: "bug" | "feature" | "improvement" | "complaint" | "compliment";
  category: "ui" | "performance" | "feature" | "mobile" | "data" | "other";
  content: string;
  rating?: number;
  screenshots?: string[];
}

interface QuickFeedbackData {
  rating: number;
  comment?: string;
  feature?: string;
}

export class FeedbackService {
  async createFeedback(userId: string, data: CreateFeedbackData) {
    try {
      const feedback = await prisma.feedback.create({
        data: {
          userId,
          type: data.type,
          category: data.category,
          content: data.content,
          rating: data.rating,
          screenshots: data.screenshots || [],
          status: "pending",
        },
        include: {
          user: {
            select: {
              phone: true,
              farmerProfile: {
                select: {
                  fullName: true,
                  farmName: true,
                },
              },
            },
          },
        },
      });

      // Log audit
      await auditService.logAction({
        userId,
        action: "CREATE_FEEDBACK",
        module: "FEEDBACK",
        resourceId: feedback.id,
        details: `Feedback created: ${data.type} - ${data.category}`,
      });

      logger.info(`Feedback created: ${feedback.id} by user ${userId}`);

      return feedback;
    } catch (error) {
      logger.error("Error creating feedback:", error);
      throw error;
    }
  }

  async getFeedbackList(params: {
    page: number;
    limit: number;
    type?: string;
    category?: string;
    status?: string;
    rating?: number;
  }) {
    try {
      const { page, limit, type, category, status, rating } = params;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (type) where.type = type;
      if (category) where.category = category;
      if (status) where.status = status;
      if (rating) where.rating = rating;

      const [feedback, total] = await Promise.all([
        prisma.feedback.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                phone: true,
                farmerProfile: {
                  select: {
                    fullName: true,
                    farmName: true,
                  },
                },
              },
            },
          },
        }),
        prisma.feedback.count({ where }),
      ]);

      return {
        data: feedback,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting feedback list:", error);
      throw error;
    }
  }

  async getFeedbackById(id: string) {
    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              phone: true,
              farmerProfile: {
                select: {
                  fullName: true,
                  farmName: true,
                  location: true,
                },
              },
            },
          },
        },
      });

      if (!feedback) {
        throw new Error("Feedback not found");
      }

      return feedback;
    } catch (error) {
      logger.error("Error getting feedback by ID:", error);
      throw error;
    }
  }

  async updateFeedbackStatus(
    id: string,
    data: {
      status: "pending" | "in_review" | "resolved" | "closed";
      adminResponse?: string;
      updatedBy: string;
    },
  ) {
    try {
      const feedback = await prisma.feedback.update({
        where: { id },
        data: {
          status: data.status,
          adminResponse: data.adminResponse,
          reviewedBy: data.updatedBy,
          reviewedAt: data.status === "resolved" ? new Date() : null,
        },
        include: {
          user: {
            select: {
              phone: true,
              farmerProfile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      });

      // Log audit
      await auditService.logAction({
        userId: data.updatedBy,
        action: "UPDATE_FEEDBACK_STATUS",
        module: "FEEDBACK",
        resourceId: id,
        details: `Feedback status updated to ${data.status}`,
      });

      logger.info(`Feedback ${id} status updated to ${data.status}`);

      return feedback;
    } catch (error) {
      logger.error("Error updating feedback status:", error);
      throw error;
    }
  }

  async getFeedbackAnalytics(params?: { startDate?: Date; endDate?: Date }) {
    try {
      const { startDate, endDate } = params || {};

      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [
        totalFeedback,
        feedbackByType,
        feedbackByCategory,
        feedbackByStatus,
        averageRating,
        recentFeedback,
      ] = await Promise.all([
        prisma.feedback.count({ where }),

        prisma.feedback.groupBy({
          by: ["type"],
          where,
          _count: { type: true },
        }),

        prisma.feedback.groupBy({
          by: ["category"],
          where,
          _count: { category: true },
        }),

        prisma.feedback.groupBy({
          by: ["status"],
          where,
          _count: { status: true },
        }),

        prisma.feedback.aggregate({
          where: {
            ...where,
            rating: { not: null },
          },
          _avg: { rating: true },
        }),

        prisma.feedback.findMany({
          where,
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                farmerProfile: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      return {
        summary: {
          totalFeedback,
          averageRating: averageRating._avg.rating || 0,
          period: {
            start: startDate,
            end: endDate,
          },
        },
        breakdowns: {
          byType: feedbackByType.map((item) => ({
            type: item.type,
            count: item._count.type,
          })),
          byCategory: feedbackByCategory.map((item) => ({
            category: item.category,
            count: item._count.category,
          })),
          byStatus: feedbackByStatus.map((item) => ({
            status: item.status,
            count: item._count.status,
          })),
        },
        recent: recentFeedback.map((item) => ({
          id: item.id,
          type: item.type,
          rating: item.rating,
          createdAt: item.createdAt,
          user: item.user.farmerProfile?.fullName || "Anonymous",
        })),
      };
    } catch (error) {
      logger.error("Error getting feedback analytics:", error);
      throw error;
    }
  }

  async getUserFeedbackHistory(
    userId: string,
    params: { page: number; limit: number },
  ) {
    try {
      const { page, limit } = params;
      const skip = (page - 1) * limit;

      const [feedback, total] = await Promise.all([
        prisma.feedback.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.feedback.count({ where: { userId } }),
      ]);

      return {
        data: feedback,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting user feedback history:", error);
      throw error;
    }
  }

  async submitQuickFeedback(userId: string, data: QuickFeedbackData) {
    try {
      const feedback = await prisma.feedback.create({
        data: {
          userId,
          type: "improvement",
          category: "feature",
          content: data.comment || `Quick rating: ${data.rating}`,
          rating: data.rating,
          status: "pending",
          metadata: {
            quickFeedback: true,
            feature: data.feature,
          },
        },
      });

      // Log audit
      await auditService.logAction({
        userId,
        action: "SUBMIT_QUICK_FEEDBACK",
        module: "FEEDBACK",
        resourceId: feedback.id,
        details: `Quick feedback submitted with rating ${data.rating}`,
      });

      logger.info(`Quick feedback submitted: ${feedback.id} by user ${userId}`);

      return feedback;
    } catch (error) {
      logger.error("Error submitting quick feedback:", error);
      throw error;
    }
  }

  async getTopIssues(limit = 10) {
    try {
      const issues = await prisma.feedback.groupBy({
        by: ["category", "type"],
        where: {
          type: { in: ["bug", "complaint"] },
          status: { not: "resolved" },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      return issues.map((issue) => ({
        category: issue.category,
        type: issue.type,
        count: issue._count.id,
      }));
    } catch (error) {
      logger.error("Error getting top issues:", error);
      throw error;
    }
  }

  async getSatisfactionMetrics() {
    try {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const [ratings, totalFeedback] = await Promise.all([
        prisma.feedback.findMany({
          where: {
            rating: { not: null },
            createdAt: { gte: last30Days },
          },
          select: { rating: true },
        }),
        prisma.feedback.count({
          where: {
            createdAt: { gte: last30Days },
          },
        }),
      ]);

      if (ratings.length === 0) {
        return {
          averageRating: 0,
          satisfactionScore: 0,
          totalRatings: 0,
          responseRate: 0,
        };
      }

      const averageRating =
        ratings.reduce((sum, r) => sum + r.rating!, 0) / ratings.length;
      const satisfactionScore = (averageRating / 5) * 100; // Convert to percentage
      const responseRate = (ratings.length / totalFeedback) * 100;

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        satisfactionScore: Math.round(satisfactionScore),
        totalRatings: ratings.length,
        responseRate: Math.round(responseRate),
      };
    } catch (error) {
      logger.error("Error getting satisfaction metrics:", error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
