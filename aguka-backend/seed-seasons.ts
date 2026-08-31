import { prisma } from "./src/prisma.js";

async function main() {
  const seasons = [
    { name: "Season A", startMonth: 8, endMonth: 11, description: "September to January" },
    { name: "Season B", startMonth: 2, endMonth: 6, description: "March to July" },
    { name: "Season C", startMonth: 6, endMonth: 7, description: "June to August" },
    { name: "Off-season", startMonth: 12, endMonth: 1, description: "Off-season" }
  ];

  for (const s of seasons) {
    await prisma.season.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
  }
  
  console.log("Seasons seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });