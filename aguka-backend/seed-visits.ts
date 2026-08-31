import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding field visit notes...");

  const officers = await prisma.user.findMany({
    where: { role: "officer" },
  });

  if (officers.length === 0) {
    console.log("❌ No officers found. Run main seed first.");
    return;
  }

  const assignments = await prisma.extensionOfficerAssignment.findMany({
    include: {
      farmer: {
        include: { farmerProfile: true }
      }
    }
  });

  if (assignments.length === 0) {
    console.log("❌ No assignments found. Run main seed first.");
    return;
  }

  const visitNotes = [
    {
      notes: "Checked potato crops. Growth is consistent but soil moisture is slightly low. Advised on increasing drip frequency.",
      actionItems: "Farmer to adjust irrigation schedule to 30 mins daily.",
      status: "completed",
    },
    {
      notes: "Routine visit to check on maize plantation. Pest traps show low activity. Overall healthy crop.",
      actionItems: "Continue monitoring for fall armyworm signs.",
      status: "completed",
    },
    {
      notes: "Upcoming visit to discuss fertilizer application for the next phase.",
      actionItems: null,
      status: "pending",
    },
    {
      notes: "Soil test requested by farmer due to yellowing of bean leaves. Need to check nitrogen levels.",
      actionItems: "Bring pH and NPK test kit.",
      status: "pending",
    }
  ];

  for (const assignment of assignments) {
    // Create 1-2 visits for each assigned farmer
    const numVisits = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numVisits; i++) {
      const noteData = visitNotes[Math.floor(Math.random() * visitNotes.length)];
      const visitDate = new Date();
      if (noteData.status === "pending") {
        visitDate.setDate(visitDate.getDate() + (1 + Math.floor(Math.random() * 7)));
      } else {
        visitDate.setDate(visitDate.getDate() - (1 + Math.floor(Math.random() * 14)));
      }

      await prisma.fieldVisitNote.create({
        data: {
          officerId: assignment.extensionOfficerId,
          farmerId: assignment.farmer.farmerProfile!.id,
          visitDate,
          notes: noteData.notes,
          actionItems: noteData.actionItems,
          status: noteData.status,
          followUpDate: noteData.status === "completed" ? new Date(Date.now() + 14 * 86400000) : null,
        },
      });
    }
  }

  console.log("✅ Seeding visit notes completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
