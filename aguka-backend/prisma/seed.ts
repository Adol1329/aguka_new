import {
  PrismaClient,
  UserRole,
  UserStatus,
  WaterSource,
  IrrigationType,
  SensorType,
  AlertType,
  AlertSeverity,
  ActivityType,
  ResourceType,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as argon2 from "argon2";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  // 0. Cleanup
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.soilReading.deleteMany();
  await prisma.weatherReading.deleteMany();
  await prisma.irrigationLog.deleteMany();
  await prisma.irrigationSchedule.deleteMany();
  await prisma.irrigationZone.deleteMany();
  await prisma.farmActivity.deleteMany();
  await prisma.farmerCrop.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.livestock.deleteMany();
  await prisma.resourceBooking.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.cooperativeActivity.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.cooperativeMember.deleteMany();
  await prisma.extensionOfficerAssignment.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash("password123");

  // ─── 1. Admin Users ───────────────────────────────────────────────────────
  console.log("👥 Seeding admin users...");

  const superAdmin = await prisma.user.create({
    data: {
      phone: "250780000001",
      email: "superadmin@aguka.rw",
      passwordHash,
      role: UserRole.super_admin,
      status: UserStatus.active,
    },
  });

  const admin = await prisma.user.create({
    data: {
      phone: "250780000002",
      email: "admin@aguka.rw",
      passwordHash,
      role: UserRole.admin,
      status: UserStatus.active,
    },
  });

  const officer1 = await prisma.user.create({
    data: {
      phone: "250780000003",
      email: "officer1@aguka.rw",
      fullName: "Umujyanama Mukamana",
      passwordHash,
      role: UserRole.officer,
      status: UserStatus.active,
      officerProfile: {
        create: {
          employeeId: "OFF-001",
          organization: "Aguka Extension Services",
          specializations: ["Soil health", "Irrigation", "Pest management"],
          coveredSectors: [
            "Kinigi",
            "Gisenyi",
            "Ngoma",
            "Nyamata",
            "Kabarondo",
          ],
        },
      },
    },
  });

  const officer2 = await prisma.user.create({
    data: {
      phone: "250780000004",
      email: "officer2@aguka.rw",
      fullName: "Eric Ndayisaba",
      passwordHash,
      role: UserRole.officer,
      status: UserStatus.active,
      officerProfile: {
        create: {
          employeeId: "OFF-002",
          organization: "Aguka Extension Services",
          specializations: ["Coffee", "Tea", "Climate smart agriculture"],
          coveredSectors: ["Kagano", "Rwerere", "Gasaka", "Kinazi", "Base"],
        },
      },
    },
  });

  // ─── 2. Crops ────────────────────────────────────────────────────────────
  console.log("🌽 Seeding crops...");
  const crops = await Promise.all([
    prisma.crop.create({
      data: {
        id: "maize",
        nameEn: "Maize",
        nameRw: "Ibigori",
        category: "Cereal",
        growingPeriodDays: 120,
        waterRequirementMm: 500,
        optimalPhMin: 5.8,
        optimalPhMax: 7.0,
      },
    }),
    prisma.crop.create({
      data: {
        id: "potato",
        nameEn: "Potato",
        nameRw: "Ibirayi",
        category: "Tuber",
        growingPeriodDays: 90,
        waterRequirementMm: 400,
        optimalPhMin: 5.0,
        optimalPhMax: 6.5,
      },
    }),
    prisma.crop.create({
      data: {
        id: "coffee",
        nameEn: "Coffee",
        nameRw: "Ikawa",
        category: "Cash Crop",
        growingPeriodDays: 1095,
        waterRequirementMm: 800,
        optimalPhMin: 5.0,
        optimalPhMax: 6.0,
      },
    }),
    prisma.crop.create({
      data: {
        id: "beans",
        nameEn: "Beans",
        nameRw: "Ibishyimbo",
        category: "Legume",
        growingPeriodDays: 75,
        waterRequirementMm: 300,
        optimalPhMin: 6.0,
        optimalPhMax: 7.5,
      },
    }),
    prisma.crop.create({
      data: {
        id: "rice",
        nameEn: "Rice",
        nameRw: "Umuceri",
        category: "Cereal",
        growingPeriodDays: 150,
        waterRequirementMm: 1200,
        optimalPhMin: 5.0,
        optimalPhMax: 6.5,
      },
    }),
    prisma.crop.create({
      data: {
        id: "cassava",
        nameEn: "Cassava",
        nameRw: "Imyumbati",
        category: "Tuber",
        growingPeriodDays: 360,
        waterRequirementMm: 600,
        optimalPhMin: 4.5,
        optimalPhMax: 7.0,
      },
    }),
    prisma.crop.create({
      data: {
        id: "sorghum",
        nameEn: "Sorghum",
        nameRw: "Amasaka",
        category: "Cereal",
        growingPeriodDays: 130,
        waterRequirementMm: 350,
        optimalPhMin: 5.5,
        optimalPhMax: 7.5,
      },
    }),
    prisma.crop.create({
      data: {
        id: "banana",
        nameEn: "Banana",
        nameRw: "Igitoki",
        category: "Fruit",
        growingPeriodDays: 365,
        waterRequirementMm: 1000,
        optimalPhMin: 5.5,
        optimalPhMax: 6.5,
      },
    }),
    prisma.crop.create({
      data: {
        id: "tea",
        nameEn: "Tea",
        nameRw: "Icyayi",
        category: "Cash Crop",
        growingPeriodDays: 1460,
        waterRequirementMm: 1200,
        optimalPhMin: 4.5,
        optimalPhMax: 5.5,
      },
    }),
    prisma.crop.create({
      data: {
        id: "wheat",
        nameEn: "Wheat",
        nameRw: "Ingano",
        category: "Cereal",
        growingPeriodDays: 110,
        waterRequirementMm: 450,
        optimalPhMin: 6.0,
        optimalPhMax: 7.0,
      },
    }),
  ]);

  // ─── 3. Cooperatives ─────────────────────────────────────────────────────
  console.log("🏢 Seeding 10 cooperatives...");

  const cooperativeData = [
    {
      name: "Abunzubumwe Cooperative",
      registrationNumber: "COOP/2024/001",
      district: "Musanze",
      sector: "Kinigi",
      contactPhone: "250788123001",
      contactEmail: "kinigi.coop@gmail.com",
      description:
        "Supporting potato and maize farmers in the Kinigi volcanic region.",
    },
    {
      name: "Iterambere Farmers Coop",
      registrationNumber: "COOP/2024/002",
      district: "Rubavu",
      sector: "Gisenyi",
      contactPhone: "250788123002",
      contactEmail: "iterambere.rubavu@gmail.com",
      description:
        "Coffee and banana cooperative serving western province farmers.",
    },
    {
      name: "Duhingane Agricultural Coop",
      registrationNumber: "COOP/2024/003",
      district: "Huye",
      sector: "Ngoma",
      contactPhone: "250788123003",
      contactEmail: "duhingane.huye@gmail.com",
      description:
        "Bean and sorghum farming collective in the southern province.",
    },
    {
      name: "Tuzamurane Rice Cooperative",
      registrationNumber: "COOP/2024/004",
      district: "Bugesera",
      sector: "Nyamata",
      contactPhone: "250788123004",
      contactEmail: "tuzamurane.bugesera@gmail.com",
      description:
        "Specialised in irrigated rice farming in the Nyamata marshlands.",
    },
    {
      name: "Intwari Agri Cooperative",
      registrationNumber: "COOP/2024/005",
      district: "Kayonza",
      sector: "Kabarondo",
      contactPhone: "250788123005",
      contactEmail: "intwari.kayonza@gmail.com",
      description:
        "Cassava and maize cooperative promoting food security in Eastern province.",
    },
    {
      name: "Ubumwe Tea Cooperative",
      registrationNumber: "COOP/2024/006",
      district: "Nyamasheke",
      sector: "Kagano",
      contactPhone: "250788123006",
      contactEmail: "ubumwe.tea@gmail.com",
      description: "Tea cultivation and processing cooperative near Lake Kivu.",
    },
    {
      name: "Ejo Heza Wheat Coop",
      registrationNumber: "COOP/2024/007",
      district: "Burera",
      sector: "Rwerere",
      contactPhone: "250788123007",
      contactEmail: "ejoheza.burera@gmail.com",
      description:
        "Wheat and Irish potato cooperative operating in highland areas.",
    },
    {
      name: "Amahoro Coffee Cooperative",
      registrationNumber: "COOP/2024/008",
      district: "Nyamagabe",
      sector: "Gasaka",
      contactPhone: "250788123008",
      contactEmail: "amahoro.coffee@gmail.com",
      description: "Specialty coffee cooperative exporting washed Arabica.",
    },
    {
      name: "Twisungane Banana Coop",
      registrationNumber: "COOP/2024/009",
      district: "Ruhango",
      sector: "Kinazi",
      contactPhone: "250788123009",
      contactEmail: "twisungane.ruhango@gmail.com",
      description: "Banana farming and juice processing cooperative.",
    },
    {
      name: "Agakunze Horticulture Coop",
      registrationNumber: "COOP/2024/010",
      district: "Rulindo",
      sector: "Base",
      contactPhone: "250788123010",
      contactEmail: "agakunze.rulindo@gmail.com",
      description:
        "Vegetables, tomatoes and horticulture cooperative for urban markets.",
    },
  ];

  const coops = await Promise.all(
    cooperativeData.map((data) => prisma.cooperative.create({ data })),
  );

  // ─── 4. Cooperative Managers ─────────────────────────────────────────────
  console.log("👔 Seeding cooperative managers...");

  const managerNames = [
    {
      phone: "250788200001",
      email: "manager.kinigi@aguka.rw",
      fullName: "Pascal Nkurunziza",
    },
    {
      phone: "250788200002",
      email: "manager.rubavu@aguka.rw",
      fullName: "Solange Mukamana",
    },
    {
      phone: "250788200003",
      email: "manager.huye@aguka.rw",
      fullName: "Innocent Niyonzima",
    },
    {
      phone: "250788200004",
      email: "manager.bugesera@aguka.rw",
      fullName: "Vestine Uwase",
    },
    {
      phone: "250788200005",
      email: "manager.kayonza@aguka.rw",
      fullName: "Théoneste Habyarimana",
    },
    {
      phone: "250788200006",
      email: "manager.nyamasheke@aguka.rw",
      fullName: "Chantal Nyiransabimana",
    },
    {
      phone: "250788200007",
      email: "manager.burera@aguka.rw",
      fullName: "Fidèle Nshimiyimana",
    },
    {
      phone: "250788200008",
      email: "manager.nyamagabe@aguka.rw",
      fullName: "Odette Ingabire",
    },
    {
      phone: "250788200009",
      email: "manager.ruhango@aguka.rw",
      fullName: "Jean-Paul Habimana",
    },
    {
      phone: "250788200010",
      email: "manager.rulindo@aguka.rw",
      fullName: "Yvonne Mutuyimana",
    },
  ];

  const coopManagers = await Promise.all(
    managerNames.map((m, i) =>
      prisma.user.create({
        data: {
          phone: m.phone,
          email: m.email,
          passwordHash,
          role: UserRole.cooperative,
          status: UserStatus.active,
          cooperativeMember: {
            create: {
              cooperativeId: coops[i].id,
              role: "manager",
            },
          },
        },
      }),
    ),
  );

  // ─── 5. Cooperative Resources & Events ───────────────────────────────────
  console.log("📦 Seeding cooperative resources...");

  const resourceNames = [
    {
      name: "Tractor A1",
      type: ResourceType.equipment,
      desc: "John Deere 5075E for plowing",
    },
    {
      name: "Sprayer Unit B2",
      type: ResourceType.equipment,
      desc: "Motorised crop sprayer",
    },
    {
      name: "Storage Silo 1",
      type: ResourceType.storage,
      desc: "10-tonne grain storage silo",
    },
    {
      name: "Water Pump P1",
      type: ResourceType.equipment,
      desc: "Diesel water pump for irrigation",
    },
    {
      name: "Harvester H1",
      type: ResourceType.equipment,
      desc: "Combine harvester for maize",
    },
    {
      name: "Seed Store",
      type: ResourceType.storage,
      desc: "Certified seed storage facility",
    },
    {
      name: "Greenhouse G1",
      type: ResourceType.storage,
      desc: "Seedling greenhouse 200m²",
    },
    {
      name: "Truck T1",
      type: ResourceType.equipment,
      desc: "Transport truck 3-tonne capacity",
    },
    {
      name: "Drip Kit D1",
      type: ResourceType.equipment,
      desc: "Drip irrigation kit 2 hectares",
    },
    {
      name: "Processing Unit P2",
      type: ResourceType.equipment,
      desc: "Coffee wet processing station",
    },
  ];

  await Promise.all(
    coops.map((coop, i) =>
      prisma.resource.create({
        data: {
          cooperativeId: coop.id,
          name: resourceNames[i].name,
          resourceType: resourceNames[i].type,
          description: resourceNames[i].desc,
          addedBy: coopManagers[i].id,
        },
      }),
    ),
  );

  await Promise.all(
    coops.map((coop, i) =>
      prisma.cooperativeActivity.create({
        data: {
          cooperativeId: coop.id,
          title: [
            "Post-harvest Handling Training",
            "Irrigation Best Practices Workshop",
            "Market Linkage Forum",
            "Soil Health Seminar",
            "Pest & Disease Management",
            "Financial Literacy for Farmers",
            "Export Standards Training",
            "Cooperative Governance Meeting",
            "Agri-Input Subsidy Briefing",
            "Climate Smart Agriculture Session",
          ][i],
          activityType: [
            ActivityType.training,
            ActivityType.training,
            ActivityType.meeting,
            ActivityType.training,
            ActivityType.training,
            ActivityType.training,
            ActivityType.training,
            ActivityType.meeting,
            ActivityType.meeting,
            ActivityType.training,
          ][i],
          scheduledAt: new Date(Date.now() + 86400000 * (i + 1)),
          location: `${coops[i].district} - ${coops[i].sector} Coop Office`,
          expectedParticipants: 30 + i * 5,
        },
      }),
    ),
  );

  // ─── 6. Farmers (20) ─────────────────────────────────────────────────────
  console.log("🧑‍🌾 Seeding 20 farmers...");

  const farmerData = [
    // coop[0] – Musanze / Kinigi
    {
      phone: "250788300001",
      email: "jean.habimana@aguka.rw",
      fullName: "Jean Damascene Habimana",
      farmName: "Habimana Family Farm",
      district: "Musanze",
      sector: "Kinigi",
      size: 2.5,
      soil: "Volcanic",
      water: WaterSource.rainwater,
      irr: IrrigationType.drip,
      lat: -1.4333,
      lng: 29.6333,
      coopIdx: 0,
      crops: ["maize", "potato"],
    },
    {
      phone: "250788300002",
      email: "solange.uwimana@aguka.rw",
      fullName: "Solange Uwimana",
      farmName: "Uwimana Green Farm",
      district: "Musanze",
      sector: "Kinigi",
      size: 1.8,
      soil: "Loamy",
      water: WaterSource.well,
      irr: IrrigationType.sprinkler,
      lat: -1.441,
      lng: 29.62,
      coopIdx: 0,
      crops: ["potato", "beans"],
    },
    {
      phone: "250788300003",
      email: "celestin.bizimana@aguka.rw",
      fullName: "Célestin Bizimana",
      farmName: "Bizimana Hillside Farm",
      district: "Musanze",
      sector: "Kinigi",
      size: 3.0,
      soil: "Volcanic",
      water: WaterSource.rainwater,
      irr: IrrigationType.drip,
      lat: -1.429,
      lng: 29.64,
      coopIdx: 0,
      crops: ["maize", "wheat"],
    },

    // coop[1] – Rubavu / Gisenyi
    {
      phone: "250788300004",
      email: "claudine.mukand@aguka.rw",
      fullName: "Claudine Mukandayisenga",
      farmName: "Mukand Riverside Farm",
      district: "Rubavu",
      sector: "Gisenyi",
      size: 1.5,
      soil: "Sandy Loam",
      water: WaterSource.river,
      irr: IrrigationType.flood,
      lat: -1.6833,
      lng: 29.2667,
      coopIdx: 1,
      crops: ["coffee", "banana"],
    },
    {
      phone: "250788300005",
      email: "theophile.ntu@aguka.rw",
      fullName: "Théophile Ntungwanayo",
      farmName: "Ntu Lake Farm",
      district: "Rubavu",
      sector: "Gisenyi",
      size: 2.2,
      soil: "Loamy",
      water: WaterSource.well,
      irr: IrrigationType.drip,
      lat: -1.675,
      lng: 29.28,
      coopIdx: 1,
      crops: ["coffee", "beans"],
    },

    // coop[2] – Huye / Ngoma
    {
      phone: "250788300006",
      email: "immacule.uwera@aguka.rw",
      fullName: "Immaculée Uwera",
      farmName: "Uwera Southern Farm",
      district: "Huye",
      sector: "Ngoma",
      size: 1.2,
      soil: "Clay",
      water: WaterSource.rainwater,
      irr: IrrigationType.sprinkler,
      lat: -2.599,
      lng: 29.739,
      coopIdx: 2,
      crops: ["beans", "sorghum"],
    },
    {
      phone: "250788300007",
      email: "evariste.nzig@aguka.rw",
      fullName: "Évariste Nzigiyimana",
      farmName: "Nzigi Valley Farm",
      district: "Huye",
      sector: "Ngoma",
      size: 2.0,
      soil: "Sandy",
      water: WaterSource.well,
      irr: IrrigationType.drip,
      lat: -2.605,
      lng: 29.745,
      coopIdx: 2,
      crops: ["beans", "maize"],
    },

    // coop[3] – Bugesera / Nyamata
    {
      phone: "250788300008",
      email: "vestine.nkusi@aguka.rw",
      fullName: "Vestine Nkusi",
      farmName: "Nkusi Marshland Farm",
      district: "Bugesera",
      sector: "Nyamata",
      size: 3.5,
      soil: "Alluvial",
      water: WaterSource.river,
      irr: IrrigationType.flood,
      lat: -2.153,
      lng: 30.052,
      coopIdx: 3,
      crops: ["rice", "beans"],
    },
    {
      phone: "250788300009",
      email: "patrice.mugabo@aguka.rw",
      fullName: "Patrice Mugabo",
      farmName: "Mugabo Rice Fields",
      district: "Bugesera",
      sector: "Nyamata",
      size: 4.0,
      soil: "Alluvial",
      water: WaterSource.river,
      irr: IrrigationType.flood,
      lat: -2.161,
      lng: 30.06,
      coopIdx: 3,
      crops: ["rice"],
    },

    // coop[4] – Kayonza / Kabarondo
    {
      phone: "250788300010",
      email: "domitille.uwim@aguka.rw",
      fullName: "Domitille Uwimana",
      farmName: "Uwimana Eastern Farm",
      district: "Kayonza",
      sector: "Kabarondo",
      size: 2.8,
      soil: "Sandy Loam",
      water: WaterSource.rainwater,
      irr: IrrigationType.drip,
      lat: -1.597,
      lng: 30.628,
      coopIdx: 4,
      crops: ["cassava", "maize"],
    },
    {
      phone: "250788300011",
      email: "alexis.mugenzi@aguka.rw",
      fullName: "Alexis Mugenzi",
      farmName: "Mugenzi Savanna Farm",
      district: "Kayonza",
      sector: "Kabarondo",
      size: 1.6,
      soil: "Sandy",
      water: WaterSource.well,
      irr: IrrigationType.sprinkler,
      lat: -1.602,
      lng: 30.635,
      coopIdx: 4,
      crops: ["cassava", "beans"],
    },

    // coop[5] – Nyamasheke / Kagano
    {
      phone: "250788300012",
      email: "chantal.nkuru@aguka.rw",
      fullName: "Chantal Nkurukiyinka",
      farmName: "Nkuru Tea Gardens",
      district: "Nyamasheke",
      sector: "Kagano",
      size: 2.1,
      soil: "Volcanic",
      water: WaterSource.rainwater,
      irr: IrrigationType.drip,
      lat: -2.335,
      lng: 29.178,
      coopIdx: 5,
      crops: ["tea", "coffee"],
    },
    {
      phone: "250788300013",
      email: "felix.rutageng@aguka.rw",
      fullName: "Félix Rutagengwa",
      farmName: "Rutagengwa Lake Farm",
      district: "Nyamasheke",
      sector: "Kagano",
      size: 1.9,
      soil: "Loamy",
      water: WaterSource.river,
      irr: IrrigationType.flood,
      lat: -2.341,
      lng: 29.183,
      coopIdx: 5,
      crops: ["tea", "banana"],
    },

    // coop[6] – Burera / Rwerere
    {
      phone: "250788300014",
      email: "fidele.nshimi@aguka.rw",
      fullName: "Fidèle Nshimiyimana",
      farmName: "Nshimi Highland Farm",
      district: "Burera",
      sector: "Rwerere",
      size: 2.3,
      soil: "Volcanic",
      water: WaterSource.rainwater,
      irr: IrrigationType.drip,
      lat: -1.47,
      lng: 29.85,
      coopIdx: 6,
      crops: ["wheat", "potato"],
    },

    // coop[7] – Nyamagabe / Gasaka
    {
      phone: "250788300015",
      email: "odette.ingab@aguka.rw",
      fullName: "Odette Ingabire",
      farmName: "Ingabire Coffee Estate",
      district: "Nyamagabe",
      sector: "Gasaka",
      size: 3.2,
      soil: "Volcanic",
      water: WaterSource.rainwater,
      irr: IrrigationType.drip,
      lat: -2.452,
      lng: 29.52,
      coopIdx: 7,
      crops: ["coffee"],
    },
    {
      phone: "250788300016",
      email: "theogene.mug@aguka.rw",
      fullName: "Théogène Mugwaneza",
      farmName: "Mugwaneza Arabica Farm",
      district: "Nyamagabe",
      sector: "Gasaka",
      size: 2.7,
      soil: "Loamy",
      water: WaterSource.well,
      irr: IrrigationType.sprinkler,
      lat: -2.46,
      lng: 29.528,
      coopIdx: 7,
      crops: ["coffee", "beans"],
    },

    // coop[8] – Ruhango / Kinazi
    {
      phone: "250788300017",
      email: "jeanpaul.hab@aguka.rw",
      fullName: "Jean-Paul Habimana",
      farmName: "Habimana Banana Grove",
      district: "Ruhango",
      sector: "Kinazi",
      size: 1.4,
      soil: "Loamy",
      water: WaterSource.rainwater,
      irr: IrrigationType.drip,
      lat: -2.224,
      lng: 29.78,
      coopIdx: 8,
      crops: ["banana", "maize"],
    },

    // coop[9] – Rulindo / Base
    {
      phone: "250788300018",
      email: "yvonne.mutuy@aguka.rw",
      fullName: "Yvonne Mutuyimana",
      farmName: "Mutuy Green Acres",
      district: "Rulindo",
      sector: "Base",
      size: 1.1,
      soil: "Clay Loam",
      water: WaterSource.well,
      irr: IrrigationType.sprinkler,
      lat: -1.729,
      lng: 29.96,
      coopIdx: 9,
      crops: ["beans", "wheat"],
    },
    {
      phone: "250788300019",
      email: "gabriel.niyonz@aguka.rw",
      fullName: "Gabriel Niyonzima",
      farmName: "Niyonzima Horticulture",
      district: "Rulindo",
      sector: "Base",
      size: 0.9,
      soil: "Sandy Loam",
      water: WaterSource.river,
      irr: IrrigationType.drip,
      lat: -1.735,
      lng: 29.967,
      coopIdx: 9,
      crops: ["maize", "cassava"],
    },
    {
      phone: "250788300020",
      email: "alice.nyira@aguka.rw",
      fullName: "Alice Nyirabashyitsi",
      farmName: "Nyira Mixed Farm",
      district: "Rulindo",
      sector: "Base",
      size: 1.3,
      soil: "Loamy",
      water: WaterSource.rainwater,
      irr: IrrigationType.sprinkler,
      lat: -1.74,
      lng: 29.973,
      coopIdx: 9,
      crops: ["beans", "banana"],
    },
  ];

  const createdFarmers: { user: any; profile: any }[] = [];

  for (const f of farmerData) {
    const farmerUser = await prisma.user.create({
      data: {
        phone: f.phone,
        email: f.email,
        passwordHash,
        role: UserRole.farmer,
        status: UserStatus.active,
        farmerProfile: {
          create: {
            fullName: f.fullName,
            farmName: f.farmName,
            district: f.district,
            sector: f.sector,
            farmSizeHectares: f.size,
            soilType: f.soil,
            waterSource: f.water,
            irrigationType: f.irr,
            cooperativeId: coops[f.coopIdx].id,
            gpsLatitude: f.lat,
            gpsLongitude: f.lng,
          },
        },
      },
      include: { farmerProfile: true },
    });

    createdFarmers.push({
      user: farmerUser,
      profile: farmerUser.farmerProfile,
    });

    // Add farmer as cooperative member
    await prisma.cooperativeMember.create({
      data: {
        cooperativeId: coops[f.coopIdx].id,
        userId: farmerUser.id,
        role: "member",
      },
    });
  }

  console.log("👨‍🌾 Assigning farmers to extension officers...");

  await prisma.extensionOfficerAssignment.createMany({
    data: createdFarmers.map(({ user }, index) => ({
      extensionOfficerId: index < 10 ? officer1.id : officer2.id,
      farmerId: user.id,
    })),
  });

  // ─── 7. Farmer Crops ─────────────────────────────────────────────────────
  console.log("🌱 Seeding farmer crops...");

  for (let i = 0; i < createdFarmers.length; i++) {
    const { profile } = createdFarmers[i];
    const cropIds = farmerData[i].crops;
    for (const cropId of cropIds) {
      await prisma.farmerCrop.create({
        data: {
          farmerId: profile.id,
          cropId,
          plantedDate: new Date(Date.now() - Math.random() * 90 * 86400000),
          status: "growing",
          plotSizeHectares: +(
            profile.farmSizeHectares / cropIds.length
          ).toFixed(1),
        },
      });
    }
  }

  // ─── 8. Sensors & Readings ───────────────────────────────────────────────
  console.log("📡 Seeding sensors and readings...");

  const sensorTypes = [
    SensorType.soil_moisture,
    SensorType.weather,
    SensorType.soil_moisture,
  ];

  for (const [{ profile }, index] of createdFarmers.map(
    (farmer, index) => [farmer, index] as const,
  )) {
    const moistureBase = 28 + ((index * 7) % 42);
    const tempBase = 18 + ((index * 3) % 13);
    const phBase = 5.4 + ((index * 0.17) % 1.8);
    const sensor = await prisma.sensor.create({
      data: {
        farmerId: profile.id,
        sensorType: SensorType.soil_moisture,
        serialNumber: `SN-AG-${profile.id.slice(-6).toUpperCase()}`,
        isActive: true,
        batteryLevel: 60 + Math.floor(Math.random() * 40),
      },
    });

    await prisma.soilReading.createMany({
      data: [
        {
          farmerId: profile.id,
          sensorId: sensor.id,
          moisturePercent: moistureBase,
          temperatureCelsius: tempBase,
          phLevel: +phBase.toFixed(1),
          readingAt: new Date(Date.now() - 7200000),
        },
        {
          farmerId: profile.id,
          sensorId: sensor.id,
          moisturePercent: Math.min(78, moistureBase + 4 + (index % 5)),
          temperatureCelsius: +(tempBase + 0.8 + (index % 4) * 0.4).toFixed(1),
          phLevel: +(phBase + 0.2).toFixed(1),
          readingAt: new Date(),
        },
      ],
    });

    await prisma.weatherReading.create({
      data: {
        farmerId: profile.id,
        temperatureCelsius: tempBase + 2,
        humidityPercent: 52 + ((index * 5) % 34),
        rainfallMm: (index * 1.7) % 12,
        readingAt: new Date(),
      },
    });
  }

  // ─── 9. Irrigation ───────────────────────────────────────────────────────
  console.log("💧 Seeding irrigation...");

  for (const { profile } of createdFarmers) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const zone = await prisma.irrigationZone.create({
      data: {
        farmerId: profile.id,
        name: "Main Plot",
        sizeHectares: +(profile.farmSizeHectares * 0.7).toFixed(1),
        cropType:
          farmerData.find((f) =>
            f.email.includes(
              profile.fullName?.split(" ")[0].toLowerCase() ?? "",
            ),
          )?.crops[0] ?? "Maize",
        status: "idle",
      },
    });

    const schedule = await prisma.irrigationSchedule.create({
      data: {
        farmerId: profile.id,
        scheduleType: "daily",
        startTime: `0${5 + Math.floor(Math.random() * 3)}:00`,
        durationMinutes: 20 + Math.floor(Math.random() * 20),
        frequency: "daily",
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
        isActive: true,
      },
    });

    await prisma.irrigationLog.create({
      data: {
        farmerId: profile.id,
        zoneId: zone.id,
        scheduleId: schedule.id,
        action: "START",
        reason: "Scheduled irrigation",
        triggeredBy: "schedule",
        executedAt: new Date(Date.now() - 86400000),
        durationMinutes: 25,
        waterUsedLiters: 300 + Math.floor(Math.random() * 300),
      },
    });
  }

  // ─── 10. Farm Activities ─────────────────────────────────────────────────
  console.log("📝 Seeding farm activities...");

  const activityPool = [
    {
      type: "Planting",
      cat: "Crop",
      note: "Planted first season crop in main plot",
    },
    {
      type: "Fertilizing",
      cat: "Crop",
      note: "Applied NPK fertilizer",
      cost: 25000,
    },
    { type: "Weeding", cat: "Crop", note: "Manual weeding of all rows" },
    {
      type: "Spraying",
      cat: "Crop",
      note: "Applied fungicide spray",
      cost: 15000,
    },
    {
      type: "Harvesting",
      cat: "Crop",
      note: "First harvest completed",
      revenue: 120000,
    },
  ];

  for (const { profile } of createdFarmers) {
    await prisma.farmActivity.createMany({
      data: activityPool.slice(0, 3).map((a, idx) => ({
        farmerId: profile.id,
        activityType: a.type,
        category: a.cat,
        notes: a.note,
        activityDate: new Date(Date.now() - (60 - idx * 15) * 86400000),
        ...(a.cost ? { costRwf: a.cost } : {}),
      })),
    });
  }

  // ─── 11. Alerts ──────────────────────────────────────────────────────────
  console.log("⚠️ Seeding alerts...");

  const alertTemplates = [
    {
      alertType: AlertType.soil,
      severity: AlertSeverity.warning,
      title: "Low Soil Moisture",
      message: "Soil moisture is below 30% in main plot.",
      recommendation: "Start irrigation soon.",
    },
    {
      alertType: AlertType.weather,
      severity: AlertSeverity.critical,
      title: "Heavy Rain Warning",
      message: "Heavy rain expected in the region.",
      recommendation: "Ensure drainage is clear.",
    },
    {
      alertType: AlertType.pest,
      severity: AlertSeverity.info,
      title: "Pest Risk Elevated",
      message: "Fall armyworm risk is high this season.",
      recommendation: "Inspect crops and apply approved pesticide.",
    },
    {
      alertType: AlertType.soil,
      severity: AlertSeverity.warning,
      title: "Low Soil pH",
      message: "Soil pH is below optimal range.",
      recommendation: "Apply lime to raise pH levels.",
    },
    {
      alertType: AlertType.weather,
      severity: AlertSeverity.info,
      title: "Dry Spell Expected",
      message: "Below-average rainfall forecast for 2 weeks.",
      recommendation: "Plan supplemental irrigation.",
    },
  ];

  for (const { profile } of createdFarmers) {
    const numAlerts = 1 + Math.floor(Math.random() * 3);
    const selected = alertTemplates.slice(0, numAlerts);
    await prisma.alert.createMany({
      data: selected.map((a) => ({
        farmerId: profile.id,
        ...a,
      })),
    });
  }

  console.log("✅ Seeding completed!");
  console.log(`   • 2 admin users (super_admin, admin)`);
  console.log(`   • 2 officer users`);
  console.log(`   • 10 cooperatives with managers, resources & activities`);
  console.log(
    `   • 20 farmers with profiles, crops, sensors, irrigation & alerts`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
