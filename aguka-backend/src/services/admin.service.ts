import { subMonths, endOfMonth, format } from "date-fns";
import { prisma } from "../prisma.js";
import { mailService } from "../mail/mail.service.js";

export class AdminService {
  /**
   * Get KPI summary for the admin dashboard
   */
  async getKpiSummary() {
    const [
      totalFarmers,
      activeFarms,
      sensorsOnline,
      sensorsOffline,
      alertsToday,
      criticalAlerts,
      openSupportTickets,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "farmer" } }),
      prisma.farmerProfile.count({ where: { user: { isActive: true } } }),
      prisma.sensor.count({
        where: {
          isActive: true,
          lastReadingAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      }),
      prisma.sensor.count({
        where: {
          OR: [
            { isActive: false },
            {
              lastReadingAt: { lt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
            },
            { lastReadingAt: null },
          ],
        },
      }),
      prisma.alert.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.alert.count({ where: { severity: "critical", isRead: false } }),
      prisma.supportTicket.count({ where: { status: "open" } }),
    ]);

    // Simple growth calculation vs last week (mocked for now)
    const farmerGrowthPct = 12.5;

    return {
      totalFarmers,
      activeFarms,
      sensorsOnline,
      sensorsOffline,
      alertsToday,
      criticalAlerts,
      openSupportTickets,
      farmerGrowthPct,
    };
  }

  /**
   * Get farmer growth chart data (last 12 months)
   */
  async getFarmerGrowth() {
    const months = Array.from({ length: 12 })
      .map((_, i) => subMonths(new Date(), i))
      .reverse();

    const growth = await Promise.all(
      months.map(async (month) => {
        const count = await prisma.user.count({
          where: {
            role: "farmer",
            createdAt: { lte: endOfMonth(month) },
          },
        });
        return {
          date: format(month, "MMM yyyy"),
          count,
        };
      }),
    );

    return growth;
  }

  /**
   * Get alerts distribution by type
   */
  async getAlertsByType() {
    const alerts = await prisma.alert.groupBy({
      by: ["alertType"],
      _count: {
        id: true,
      },
    });

    return alerts.map((a) => ({
      type: a.alertType,
      count: a._count.id,
    }));
  }

  /**
   * Get soil health score distribution
   */
  async getSoilHealthDistribution() {
    const ranges = [
      { label: "Excellent (80-100)", min: 80, max: 100 },
      { label: "Good (60-79)", min: 60, max: 79 },
      { label: "Fair (40-59)", min: 40, max: 59 },
      { label: "Poor (0-39)", min: 0, max: 39 },
    ];

    const distribution = await Promise.all(
      ranges.map(async (range) => {
        const count = await prisma.soilReading.count({
          where: {
            soilHealthScore: { gte: range.min, lte: range.max },
          },
        });
        return {
          range: range.label,
          count,
        };
      }),
    );

    return distribution;
  }

  // When admin approves:
  async approveUser(id: string, adminId: string) {
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'active' },
      include: {
        cooperativeProfile: true,
      }
    });

    // If the approved user is a cooperative manager, automatically create the Cooperative 
    // and link them as a manager using their onboarding profile data.
    if (user.role === 'cooperative' && user.cooperativeProfile) {
      // Check if they are already linked
      const existingMember = await prisma.cooperativeMember.findUnique({
        where: { userId: user.id }
      });
      
      if (!existingMember) {
        // Create the actual Cooperative entity
        const newCoop = await prisma.cooperative.create({
          data: {
            name: user.cooperativeProfile.cooperativeName || "Unnamed Cooperative",
            registrationNumber: user.cooperativeProfile.registrationNumber,
            district: "Unknown", // Assuming district is not in CooperativeProfile yet, can be updated later
            sector: "Unknown",
            contactPhone: user.phone,
            contactEmail: user.email,
          }
        });

        // Link the user to the new cooperative
        await prisma.cooperativeMember.create({
          data: {
            userId: user.id,
            cooperativeId: newCoop.id,
            role: 'manager',
            status: 'active'
          }
        });
      }
    }

    // Send email
    await mailService.sendAccountApproved({
      email:    user.email,
      fullName: user.fullName || user.phone,
      phone:    user.phone,
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId:  user.id,
        title:   'Account Approved / Konti Yemejwe',
        message: 'Your Aguka account is approved. Welcome!',
        channel: 'app',
        status:  'sent',
        sentAt:  new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId:       adminId,
        action:       'ACCOUNT_APPROVED',
        resourceType: 'User',
        resourceId:   id,
      },
    });

    return { success: true };
  }

  // When admin rejects:
  async rejectUser(
    id: string,
    adminId: string,
    reason: string
  ) {
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'suspended' },
    });

    // Send email
    await mailService.sendAccountRejected({
      email:    user.email,
      fullName: user.fullName || user.phone,
      reason:   reason,
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId:  user.id,
        title:   'Account Not Approved / Konti Ntiyemejwe',
        message: `Account not approved. Reason: ${reason}`,
        channel: 'app',
        status:  'sent',
        sentAt:  new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId:       adminId,
        action:       'ACCOUNT_REJECTED',
        resourceType: 'User',
        resourceId:   id,
        newValue:     { reason },
      },
    });

    return { success: true };
  }
}

export const adminService = new AdminService();
