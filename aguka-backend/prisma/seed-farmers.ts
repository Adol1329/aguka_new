import { PrismaClient, UserRole, UserStatus, WaterSource, IrrigationType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FARMERS = [
  { phone: '250788100011', name: 'Alexis Niyonsenga',    farm: 'Niyonsenga Organic Farm', district: 'Musanze',  sector: 'Kinigi',    size: 3.2, water: WaterSource.rainwater,  irr: IrrigationType.drip,      lat: -1.4100, lng: 29.6200 },
  { phone: '250788100012', name: 'Marie Mukamana',       farm: 'Mukamana Green Fields',   district: 'Rubavu',   sector: 'Gisenyi',   size: 1.5, water: WaterSource.well,       irr: IrrigationType.sprinkler, lat: -1.6700, lng: 29.2500 },
  { phone: '250788100013', name: 'Emmanuel Habimana',    farm: 'Habimana Valley Farm',    district: 'Gakenke', sector: 'Muhondo',   size: 2.0, water: WaterSource.river,      irr: IrrigationType.flood,     lat: -1.6900, lng: 29.7800 },
  { phone: '250788100014', name: 'Vestine Uwase',        farm: 'Uwase Hillside Gardens',  district: 'Burera',   sector: 'Cyanika',   size: 1.8, water: WaterSource.rainwater,  irr: IrrigationType.drip,      lat: -1.4600, lng: 29.8500 },
  { phone: '250788100015', name: 'Patrick Nkurunziza',   farm: 'Nkurunziza Crop Estate',  district: 'Musanze',  sector: 'Muhoza',    size: 4.1, water: WaterSource.well,        irr: IrrigationType.drip,      lat: -1.4990, lng: 29.6340 },
  { phone: '250788100016', name: 'Solange Ingabire',     farm: 'Ingabire Family Plot',    district: 'Nyabihu', sector: 'Shyira',    size: 2.6, water: WaterSource.rainwater,  irr: IrrigationType.manual,    lat: -1.5800, lng: 29.4900 },
  { phone: '250788100017', name: 'Celestin Hakizimana', farm: 'Hakizimana Coffee Farm',  district: 'Rutsiro',  sector: 'Mushonyi',  size: 5.0, water: WaterSource.river,      irr: IrrigationType.drip,      lat: -2.0100, lng: 29.3700 },
  { phone: '250788100018', name: 'Florentine Mukamurera',farm: 'Mukamurera Market Garden',district: 'Ngororero',sector: 'Kabaya',    size: 1.2, water: WaterSource.well,       irr: IrrigationType.sprinkler, lat: -1.8800, lng: 29.5200 },
  { phone: '250788100019', name: 'Gratien Ntirenganya', farm: 'Ntirenganya Grain Fields', district: 'Musanze', sector: 'Cyuve',     size: 3.7, water: WaterSource.rainwater,  irr: IrrigationType.drip,      lat: -1.4750, lng: 29.5900 },
  { phone: '250788100020', name: 'Chantal Umubyeyi',    farm: 'Umubyeyi Maize Fields',   district: 'Rubavu',  sector: 'Nyamyumba', size: 2.3, water: WaterSource.river,       irr: IrrigationType.flood,     lat: -1.7200, lng: 29.1800 },
  { phone: '250788100021', name: 'Damascene Nzeyimana', farm: 'Nzeyimana Potato Estate', district: 'Burera',  sector: 'Rugendabari',size: 2.8, water: WaterSource.rainwater, irr: IrrigationType.drip,      lat: -1.4400, lng: 29.9100 },
  { phone: '250788100022', name: 'Monique Mukagasana',  farm: 'Mukagasana Mixed Farm',   district: 'Gakenke', sector: 'Janja',      size: 1.9, water: WaterSource.well,        irr: IrrigationType.sprinkler, lat: -1.6800, lng: 29.8100 },
  { phone: '250788100023', name: 'Theogene Nsengimana', farm: 'Nsengimana Agro Farm',    district: 'Musanze', sector: 'Busogo',     size: 3.0, water: WaterSource.river,      irr: IrrigationType.drip,      lat: -1.5200, lng: 29.5500 },
  { phone: '250788100024', name: 'Aline Tuyisenge',     farm: 'Tuyisenge Green Farm',    district: 'Nyabihu', sector: 'Rurembo',    size: 1.6, water: WaterSource.rainwater,  irr: IrrigationType.manual,    lat: -1.6000, lng: 29.5200 },
  { phone: '250788100025', name: 'Innocent Uwihanganye',farm: 'Uwihanganye Irrigation Co',district: 'Rubavu', sector: 'Bugeshi',    size: 4.4, water: WaterSource.well,        irr: IrrigationType.drip,      lat: -1.6500, lng: 29.3000 },
  { phone: '250788100026', name: 'Annonciata Mukandoli',farm: 'Mukandoli Herb Gardens',  district: 'Musanze', sector: 'Nkotsi',     size: 0.9, water: WaterSource.well,       irr: IrrigationType.drip,      lat: -1.5100, lng: 29.6500 },
  { phone: '250788100027', name: 'Silas Bizimana',      farm: 'Bizimana Crop Fields',    district: 'Gakenke', sector: 'Cyabingo',   size: 3.5, water: WaterSource.rainwater,  irr: IrrigationType.flood,     lat: -1.7100, lng: 29.8400 },
  { phone: '250788100028', name: 'Josephine Nyirahabimana', farm: 'Nyirahabimana Farm',  district: 'Burera',  sector: 'Nemba',      size: 2.1, water: WaterSource.river,      irr: IrrigationType.sprinkler, lat: -1.4200, lng: 29.9700 },

  
];

async function main() {
  console.log('🌱 Seeding additional farmers...');

  const passwordHash = await argon2.hash('password123');

  // Find the existing cooperative to attach farmers
  const coop = await prisma.cooperative.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!coop) {
    console.error('❌ No cooperative found. Run the main seed first.');
    process.exit(1);
  }
  console.log(`✅ Found cooperative: ${coop.name}`);

  for (let i = 0; i < FARMERS.length; i++) {
    const f = FARMERS[i];
    const email = `farmer${11 + i}@aguka.rw`;

    // Skip if phone already exists
    const existing = await prisma.user.findUnique({ where: { phone: f.phone } });
    if (existing) {
      console.log(`⏭️  Skipping ${f.name} (already exists)`);
      continue;
    }

    await prisma.user.create({
      data: {
        phone: f.phone,
        email,
        passwordHash,
        role: UserRole.farmer,
        status: UserStatus.active,
        isOnboarded: true,
        farmerProfile: {
          create: {
            fullName: f.name,
            farmName: f.farm,
            district: f.district,
            sector: f.sector,
            location: `${f.sector}, ${f.district}`,
            farmSizeHectares: f.size,
            waterSource: f.water,
            irrigationType: f.irr,
            cooperativeId: coop.id,
            gpsLatitude: f.lat,
            gpsLongitude: f.lng,
            preferredChannel: 'sms',
          },
        },
        cooperativeMember: {
          create: {
            cooperativeId: coop.id,
            role: 'member',
            status: 'active',
          },
        },
      },
    });
    console.log(`✅ Created farmer: ${f.name}`);
  }

  console.log(`\n🎉 Done! Added up to ${FARMERS.length} farmers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
