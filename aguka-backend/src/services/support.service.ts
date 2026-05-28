import { prisma } from "../prisma.js";

export class SupportService {
  /**
   * Get paginated support tickets
   */
  async getTickets(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 10, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      status,
    };

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { farmer: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { farmer: true },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return {
      success: true,
      data: tickets,
      total,
      page,
      limit,
    };
  }

  /**
   * Reply to a ticket
   */
  async replyToTicket(id: string, reply: string) {
    return prisma.supportTicket.update({
      where: { id },
      data: {
        adminReply: reply,
        status: "in_progress",
      },
    });
  }

  /**
   * Update ticket status
   */
  async updateStatus(id: string, status: string) {
    const data: any = { status };
    if (status === "resolved") {
      data.resolvedAt = new Date();
    }

    return prisma.supportTicket.update({
      where: { id },
      data,
    });
  }

  /**
   * Get support statistics
   */
  async getStats() {
    const [open, inProgress, resolved] = await Promise.all([
      prisma.supportTicket.count({ where: { status: "open" } }),
      prisma.supportTicket.count({ where: { status: "in_progress" } }),
      prisma.supportTicket.count({ where: { status: "resolved" } }),
    ]);

    return { open, inProgress, resolved };
  }
}

export const supportService = new SupportService();
