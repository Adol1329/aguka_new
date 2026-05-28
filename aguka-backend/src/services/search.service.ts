import { prisma } from "../prisma.js";
import { UserRole } from "@prisma/client";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  category: string;
  icon?: string;
  url?: string;
  metadata?: any;
}

export class SearchService {
  async globalSearch(query: string, userId: string, role: UserRole) {
    const q = query.trim();
    if (!q) return {};

    const results: Record<string, SearchResult[]> = {};

    // 1. SEARCH CROPS (GUIDES)
    const crops = await prisma.crop.findMany({
      where: {
        OR: [
          { nameEn: { contains: q, mode: "insensitive" } },
          { nameRw: { contains: q, mode: "insensitive" } },
          { nameFr: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    });

    if (crops.length > 0) {
      results["Guides"] = crops.map((c) => ({
        id: c.id,
        title: c.nameEn,
        subtitle: c.category,
        type: "crop",
        category: "Guides",
        icon: "sprout",
        url: `/farmer/crops/${c.id}`,
      }));
    }

    // 2. SEARCH MARKET PRICES
    const prices = await prisma.marketPrice.findMany({
      where: {
        OR: [
          { marketName: { contains: q, mode: "insensitive" } },
          { district: { contains: q, mode: "insensitive" } },
          { crop: { nameEn: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { crop: true },
      take: 5,
    });

    if (prices.length > 0) {
      results["Market"] = prices.map((p) => ({
        id: p.id,
        title: `${p.crop.nameEn} - ${p.marketName}`,
        subtitle: `${p.priceRwfPerKg} RWF/kg · ${p.district}`,
        type: "market",
        category: "Market",
        icon: "trending-up",
      }));
    }

    // 3. SEARCH ALERTS (IF FARMER)
    if (role === "farmer") {
      const farmerProfile = await prisma.farmerProfile.findFirst({
        where: { userId },
      });
      if (farmerProfile) {
        const alerts = await prisma.alert.findMany({
          where: {
            farmerId: farmerProfile.id,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { message: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        });

        if (alerts.length > 0) {
          results["Alerts"] = alerts.map((a) => ({
            id: a.id,
            title: a.title,
            subtitle: a.severity,
            type: "alert",
            category: "Alerts",
            icon: "alert-triangle",
          }));
        }
      }
    }

    // 4. SEARCH COMMUNITY (FORUM POSTS)
    const posts = await prisma.forumPost.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    });

    if (posts.length > 0) {
      results["Community"] = posts.map((p) => ({
        id: p.id,
        title: p.title || "Discussion Topic",
        subtitle: p.content.substring(0, 50) + "...",
        type: "forum",
        category: "Community",
        icon: "message-square",
      }));
    }

    // 5. SEARCH USERS (IF ADMIN)
    if (role === "admin" || role === "super_admin") {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
            {
              farmerProfile: { fullName: { contains: q, mode: "insensitive" } },
            },
          ],
        },
        include: { farmerProfile: true },
        take: 5,
      });

      if (users.length > 0) {
        results["Users"] = users.map((u) => ({
          id: u.id,
          title: u.farmerProfile?.fullName || u.phone,
          subtitle: u.role,
          type: "user",
          category: "Users",
          icon: "user",
        }));
      }
    }

    return results;
  }
}

export const searchService = new SearchService();
