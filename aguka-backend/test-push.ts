import { prisma } from './src/prisma.js';
import { alertSimulator } from './src/simulation/alert-simulator.js';

async function main() {
  try {
    let profile = await prisma.farmerProfile.findFirst({ where: { userId: '2d4450dd-9603-42ac-9fa5-4387beb9e9d8' } });
    if (!profile) {
      console.log('No profile found. Creating a default one...');
      profile = await prisma.farmerProfile.create({
        data: {
          userId: '2d4450dd-9603-42ac-9fa5-4387beb9e9d8',
          farmName: 'Aguka Farm',
          fullName: 'Test Farmer',
          district: 'Musanze',
          sector: 'Remera',
        }
      });
    }
    console.log('Found profile:', profile.id);
    const result = await alertSimulator.simulateNutrientDeficiency(profile.id);
    console.log('Alert Result:', JSON.stringify(result));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
