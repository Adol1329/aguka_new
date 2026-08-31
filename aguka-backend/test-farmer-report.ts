import { prisma } from "./src/prisma.js";
import { farmerReportsService, FARMER_REPORT_SPECS } from "./src/reports-v2/farmer-reports.service.js";

async function main() {
  try {
    const farmerProfile = await prisma.farmerProfile.findFirst({
      include: { user: true }
    });

    if (!farmerProfile || !farmerProfile.user) {
      console.log("No farmer profile with a user found.");
      return;
    }

    const userId = farmerProfile.userId;
    console.log(`Found farmer userId: ${userId} (${farmerProfile.fullName})\n`);

    for (const spec of FARMER_REPORT_SPECS) {
      console.log(`Testing report spec: [${spec.type}] - ${spec.title}`);
      try {
        const report = await farmerReportsService.buildReport(userId, spec, {});
        console.log(`✅ Success: ${report.executiveSummary.substring(0, 80)}...`);
      } catch (err) {
        console.error(`❌ Failed: ${(err as Error).message}`);
      }
      console.log("---");
    }

  } catch (error) {
    console.error("\n❌ Setup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
