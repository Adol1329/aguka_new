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
  await prisma.resourceDistribution.deleteMany();
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
          category: ["Machinery", "Equipment", "Infrastructure", "Machinery", "Machinery", "Infrastructure", "Infrastructure", "Logistics", "Irrigation", "Processing"][i],
          description: resourceNames[i].desc,
          quantity: resourceNames[i].type === "inputs" ? 500 : 1,
          availableQuantity: resourceNames[i].type === "inputs" ? 500 : 1,
          unit: resourceNames[i].type === "inputs" ? "kg" : "unit",
          location: `${coops[i].district} Warehouse`,
          minStockLevel: 20,
          addedBy: coopManagers[i].id,
          status: "available",
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

  // ─── 10. Farm Activity Types (catalog) ───────────────────────────────────
  console.log("🏷️ Seeding farm activity types...");

  const farmActivityTypes = [
    { id: "planting", name: "Planting", icon: "Sprout", fields: [], sortOrder: 0 },
    {
      id: "fertilizing",
      name: "Fertilizing",
      icon: "Beaker",
      fields: ["quantity", "unit", "costRwf"],
      sortOrder: 1,
    },
    { id: "weeding", name: "Weeding", icon: "Scissors", fields: [], sortOrder: 2 },
    {
      id: "spraying",
      name: "Spraying",
      icon: "SprayCan",
      fields: ["quantity", "unit", "costRwf"],
      sortOrder: 3,
    },
    {
      id: "harvesting",
      name: "Harvesting",
      icon: "Wheat",
      fields: ["quantity", "unit", "costRwf"],
      sortOrder: 4,
    },
    { id: "irrigation", name: "Irrigation", icon: "Droplets", fields: [], sortOrder: 5 },
    {
      id: "pest_control",
      name: "Pest Control",
      icon: "Bug",
      fields: ["quantity", "unit", "costRwf"],
      sortOrder: 6,
    },
  ];

  for (const t of farmActivityTypes) {
    await prisma.farmActivityType.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        icon: t.icon,
        fields: t.fields,
        sortOrder: t.sortOrder,
      },
    });
  }

  // ─── 11. Farm Activities ─────────────────────────────────────────────────
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

  // 12. Seed guides
  {
    const existingGuides = await prisma.guide.count();
    if (existingGuides === 0) {
      const guidesData = [
        {
          title: "Maize Growing Guide",
          crop: "Maize",
          category: "Planting",
          summary: "Best practices for spacing, fertilization, and weeding for high-yield maize.",
          content: `## Introduction\nMaize is a staple crop in Rwanda. Proper planting techniques can significantly increase yield.\n\n## Land Preparation\n- Plough the land to a depth of 20-25cm\n- Ensure proper drainage\n- Apply well-decomposed manure at 10 tonnes per hectare\n\n## Planting\n- Plant at the onset of rains\n- Spacing: 75cm between rows, 25cm between plants\n- Seed rate: 20-25kg per hectare\n- Planting depth: 3-5cm\n\n## Fertilization\n- Apply NPK (17-17-17) at 200kg/ha at planting\n- Top-dress with Urea at 150kg/ha after 4-6 weeks\n\n## Weed Control\n- First weeding: 2-3 weeks after planting\n- Second weeding: 5-6 weeks after planting\n\n## Harvesting\n- Maize matures in 90-120 days\n- Harvest when the husk turns brown\n- Dry to 13-14% moisture content before storage`,
          readingTime: 8,
          waterRequirement: "400-600mm",
          growthPeriod: "90-120 days",
          optimalTemp: "20-30°C",
          soilType: "Loamy, well-drained",
          icon: "Sprout",
        },
        {
          title: "Pest Management in Beans",
          crop: "Beans",
          category: "Protection",
          summary: "How to identify and treat common pests in bean plantations organically.",
          content: `## Common Bean Pests\n\n### Bean Aphids\n- **Symptoms**: Curled leaves, stunted growth\n- **Control**: Use neem oil spray or insecticidal soap\n\n### Bean Fly\n- **Symptoms**: Wilting seedlings, swollen stem base\n- **Control**: Seed dressing with appropriate insecticide\n\n### Bean Rust\n- **Symptoms**: Rust-colored spots on leaves\n- **Control**: Remove infected plants, use resistant varieties\n\n## Preventive Measures\n- Practice crop rotation with non-legumes\n- Use certified disease-free seeds\n- Maintain proper plant spacing for air circulation\n- Remove and destroy crop residues after harvest`,
          readingTime: 7,
          growthPeriod: "60-90 days",
          optimalTemp: "15-25°C",
          soilType: "Well-drained loam",
          icon: "Bug",
        },
        {
          title: "Drip Irrigation Setup",
          crop: "Rice",
          category: "Water",
          summary: "Step-by-step guide to installing and maintaining a drip irrigation system.",
          content: `## Benefits of Drip Irrigation\n- Water savings of 40-60%\n- Reduced weed growth\n- Better nutrient absorption\n- Higher yields\n\n## Components Needed\n1. Water source (tank or tap)\n2. Main line (PVC pipe)\n3. Sub-main lines\n4. Drip tapes/emitters\n5. Filters (screen or disc)\n6. Pressure regulator\n\n## Installation Steps\n\n### Step 1: Plan the Layout\n- Measure your field dimensions\n- Mark rows for crop planting\n- Calculate water requirements\n\n### Step 2: Install Main Line\n- Lay PVC pipe from water source\n- Install filter and pressure regulator\n- Add control valves for each section\n\n### Step 3: Install Drip Tapes\n- Lay drip tapes along crop rows\n- Space emitters according to crop type\n- Connect to sub-main lines\n\n### Step 4: Test the System\n- Flush the system before first use\n- Check for leaks at connections\n- Adjust pressure to 1-2 bars\n\n## Maintenance\n- Clean filters weekly\n- Flush lines monthly\n- Replace damaged emitters promptly\n- Drain system before frost`,
          readingTime: 12,
          waterRequirement: "Efficient (40-60% less)",
          optimalTemp: "All climates",
          icon: "Droplets",
        },
        {
          title: "Post-Harvest Handling",
          crop: "Maize",
          category: "Harvest",
          summary: "Reducing losses during storage and transport of grains.",
          content: `## Importance of Post-Harvest Handling\nPost-harvest losses in Rwanda can reach 30%. Proper handling preserves quality and ensures food security.\n\n## Harvesting\n- Harvest at the right maturity stage\n- Use clean harvesting tools\n- Avoid damaging grains during harvest\n\n## Drying\n- Sun-dry on clean tarpaulins (not directly on soil)\n- Stir regularly for even drying\n- Dry to 13-14% moisture content\n- Use moisture meter for accuracy\n\n## Shelling/Threshing\n- Shell when grains are properly dry\n- Use mechanical shellers to reduce damage\n- Clean grains after shelling\n\n## Storage\n- Use clean, airtight containers\n- Add natural repellents (neem leaves, chili)\n- Store in a cool, dry place\n- Inspect regularly for pests\n\n## Transportation\n- Use clean, dry sacks\n- Protect from rain and moisture\n- Avoid overfilling sacks which causes grain damage`,
          readingTime: 6,
          waterRequirement: "N/A (dry process)",
          icon: "Leaf",
        },
        {
          title: "Tomato Growing Guide",
          crop: "Tomato",
          category: "Planting",
          summary: "Complete guide to growing healthy tomatoes from nursery to harvest.",
          content: `## Nursery Establishment\n- Prepare a seedbed of 1m width\n- Mix soil with well-decomposed manure\n- Sow seeds in rows 10cm apart\n- Water gently twice daily\n- Transplant after 3-4 weeks\n\n## Transplanting\n- Space plants 60cm between rows, 45cm between plants\n- Transplant in the evening\n- Water immediately after planting\n\n## Staking\n- Stake plants to keep fruits off the ground\n- Use wooden stakes or trellis system\n- Tie stems loosely with soft material\n\n## Fertilization\n- Apply DAP at transplanting\n- Apply CAN at 3 and 6 weeks after transplanting\n- Side-dress with compost\n\n## Common Diseases\n- **Late blight**: Remove infected leaves, spray with fungicide\n- **Bacterial wilt**: Practice crop rotation, remove infected plants\n\n## Harvesting\n- Harvest starts 60-80 days after transplanting\n- Pick at the breaker stage (first color change)\n- Handle gently to avoid bruising`,
          readingTime: 10,
          waterRequirement: "500-800mm",
          growthPeriod: "90-110 days",
          optimalTemp: "20-27°C",
          soilType: "Well-drained sandy loam",
          icon: "Sprout",
        },
        {
          title: "Soil Conservation Techniques",
          crop: "Beans",
          category: "Protection",
          summary: "Methods to prevent soil erosion and maintain soil fertility on sloping farmland.",
          content: `## Why Soil Conservation Matters\nSoil erosion is a major challenge in Rwanda's hilly landscape. Losing topsoil reduces crop yields significantly.\n\n## Terracing\n- Build bench terraces on slopes\n- Maintain terrace risers with grass\n- Use stones where available for reinforcement\n\n## Contour Farming\n- Plough along contour lines\n- Reduces runoff speed\n- Increases water infiltration\n\n## Cover Cropping\n- Plant legumes as ground cover\n- Reduces soil erosion between seasons\n- Adds nitrogen to the soil\n\n## Mulching\n- Apply organic mulch 5-10cm thick\n- Retains soil moisture\n- Suppresses weed growth\n- Adds organic matter when decomposed\n\n## Agroforestry\n- Plant trees on farm boundaries\n- Trees provide shade and wind breaks\n- Leaves add nutrients to soil\n- Roots hold soil together`,
          readingTime: 8,
          optimalTemp: "All climates",
          icon: "Leaf",
        },
        {
          title: "Dairy Cow Nutrition",
          crop: null,
          category: "Feeding",
          summary: "Balanced feed formulations for maximizing milk production.",
          content: `## Nutritional Requirements for Dairy Cows\n\n### Forage (60-70% of diet)\n- Good quality Napier grass\n- Rhodes grass or natural pasture\n- Leguminous forages (desmodium, lucerne)\n\n### Concentrates (30-40% of diet)\n- Maize germ meal\n- Rice bran\n- Cotton seed cake or soybean meal\n- Mineral supplements\n\n## Feeding Schedule\n- Morning: 6-8kg of forage + 2-3kg of concentrate\n- Mid-day: Free access to water + mineral lick\n- Evening: 6-8kg of forage + 2-3kg of concentrate\n\n## Water Requirements\n- A lactating cow needs 60-80 liters of water daily\n- Ensure clean, fresh water at all times\n\n## Mineral Supplementation\n- Provide salt lick blocks\n- Supplement with Calcium and Phosphorus\n- Add Vitamin A, D, E complex\n\n## Signs of Good Nutrition\n- Shiny coat\n- Normal manure consistency\n- High milk yield\n- Regular heat cycles\n- Healthy calves at birth`,
          readingTime: 10,
          icon: "Milk",
        },
        {
          title: "Poultry Disease Prevention",
          crop: null,
          category: "Health",
          summary: "Vaccination schedules and hygiene practices for healthy chickens.",
          content: `## Essential Vaccinations\n\n### Day-old chicks\n- Newcastle Disease (NDV) vaccine - eye drop\n- Gumboro vaccine\n\n### Week 2\n- NDV booster\n- Fowl Pox vaccine\n\n### Week 4\n- Gumboro booster\n\n### Week 8\n- NDV (killed vaccine) - injection\n\n## Biosecurity Measures\n- Limit visitors to the poultry house\n- Use footbaths with disinfectant\n- Change clothes before entering\n- Keep different age groups separate\n\n## Hygiene Practices\n- Clean and disinfect housing regularly\n- Provide clean bedding (wood shavings)\n- Clean waterers and feeders daily\n- Remove manure frequently\n\n## Common Diseases\n- **Newcastle Disease**: Respiratory distress, green diarrhea, high mortality\n- **Gumboro**: Depression, ruffled feathers, vent picking\n- **Fowl Pox**: Wart-like lesions on comb and wattles\n- **Coccidiosis**: Bloody droppings, reduced feed intake\n\n## Prevention Tips\n- Source chicks from reliable hatcheries\n- Quarantine new birds for 2 weeks\n- Maintain proper ventilation\n- Provide balanced nutrition for immunity`,
          readingTime: 8,
          icon: "Bug",
        },
        {
          title: "Pig Farming Basics",
          crop: null,
          category: "General",
          summary: "A beginner guide to housing, breeding, and feeding pigs.",
          content: `## Housing Requirements\n- Well-ventilated pigsty\n- Concrete floor with proper drainage\n- Separate areas for feeding, sleeping, and dunging\n- Space: 2-3 sq meters per adult pig\n- Roof to provide shade and rain protection\n\n## Choosing Breeds\n- **Landrace**: Good mothering, long body\n- **Large White**: Fast growth, good for meat\n- **Local breeds**: Hardy, disease-resistant\n- Crossbreeds often combine best traits\n\n## Feeding\n### Grower pigs (20-50kg)\n- 1.5-2kg of balanced feed per day\n- Protein content: 16-18%\n\n### Finisher pigs (50-90kg)\n- 2.5-3kg of balanced feed per day\n- Protein content: 14-16%\n\n### Breeding sows\n- Increase feed during gestation\n- Flush feeding before breeding\n- Extra nutrition during lactation\n\n## Breeding Management\n- Sow reaches breeding age at 6-8 months\n- Gestation period: 114 days (3 months, 3 weeks, 3 days)\n- Litter size: 8-12 piglets\n- Weaning at 4-6 weeks\n\n## Health Management\n- Deworm every 3 months\n- Vaccinate against swine fever\n- Trim hooves if overgrown\n- Monitor for signs of illness: fever, loss of appetite, diarrhea`,
          readingTime: 14,
          icon: "Dog",
        },
        {
          title: "Beans Growing Guide",
          crop: "Beans",
          category: "Planting",
          summary: "Best practices for planting, managing, and harvesting beans.",
          content: `## Land Preparation\n- Plough to a depth of 15-20cm\n- Remove weeds and crop residues\n- Prepare raised beds if drainage is poor\n\n## Planting\n- Plant at the onset of rains\n- Spacing: 40cm between rows, 20cm between plants\n- Seed rate: 60-80kg per hectare\n- Planting depth: 3-5cm\n\n## Varieties\n- **Bush beans**: Mature in 60-75 days, no staking needed\n- **Climbing beans**: Mature in 90-110 days, require staking\n\n## Fertilization\n- Apply DAP at 100kg/ha at planting\n- Beans fix their own nitrogen (inoculate seeds)\n- Apply organic manure at 5 tonnes/ha\n\n## Weed Management\n- First weeding: 2-3 weeks after planting\n- Second weeding: before flowering\n- Mulch between rows to suppress weeds\n\n## Harvesting\n- Bush beans: Harvest 60-75 days after planting\n- Climbing beans: Harvest 90-110 days after planting\n- Harvest when pods turn yellow and dry\n- Thresh and clean, then dry to 14% moisture`,
          readingTime: 7,
          waterRequirement: "300-500mm",
          growthPeriod: "60-110 days",
          optimalTemp: "18-25°C",
          soilType: "Well-drained loam",
          icon: "Sprout",
        },
        {
          title: "Rice Growing Guide",
          crop: "Rice",
          category: "Planting",
          summary: "Complete guide to rice cultivation from nursery to harvest.",
          content: `## Nursery Preparation\n- Prepare a wet nursery near water source\n- Level the seedbed carefully\n- Soak seeds for 24 hours before sowing\n- Sow pre-germinated seeds evenly\n- Maintain 2-3cm water level\n\n## Land Preparation\n- Plough and puddle the field\n- Level the field for uniform water distribution\n- Apply well-decomposed manure before transplanting\n\n## Transplanting\n- Transplant seedlings at 3-4 leaf stage (20-25 days)\n- Spacing: 20cm x 20cm\n- Transplant 2-3 seedlings per hill\n- Transplant in straight rows\n\n## Water Management\n- Maintain 5-7cm water depth after transplanting\n- Drain field 7 days before harvest\n- Use alternate wetting and drying to save water\n\n## Fertilization\n- Apply NPK at 200kg/ha before transplanting\n- Top-dress with Urea at 100kg/ha at tillering\n- Top-dress with Urea at 50kg/ha at panicle initiation\n\n## Pest Management\n- **Rice blast**: Use resistant varieties\n- **Stem borer**: Remove egg masses from leaves\n- **Rodents**: Keep field edges clean\n\n## Harvesting\n- Harvest when 80% of grains are golden\n- Cut stems 15-20cm above ground\n- Thresh immediately after harvest\n- Dry to 14% moisture content`,
          readingTime: 10,
          waterRequirement: "800-1200mm",
          growthPeriod: "120-150 days",
          optimalTemp: "20-35°C",
          soilType: "Clay loam with good water retention",
          icon: "Sprout",
        },
        {
          title: "Irrigation Water Management",
          crop: "Tomato",
          category: "Water",
          summary: "Efficient water scheduling and management techniques for vegetable farming.",
          content: `## Water Requirements by Crop Stage\n\n### Nursery Stage\n- Light watering 2-3 times daily\n- Use fine spray to avoid seed displacement\n\n### Vegetative Stage\n- Water every 2-3 days\n- Apply 20-30mm per week\n\n### Flowering Stage\n- Regular watering critical\n- Apply 30-40mm per week\n- Moisture stress causes flower drop\n\n### Fruiting Stage\n- Apply 40-50mm per week\n- Consistent moisture for uniform fruit development\n- Mulch to reduce evaporation\n\n## Irrigation Methods\n\n### Drip Irrigation (Recommended)\n- Water efficiency: 90%\n- Apply directly to root zone\n- Use with fertigation for best results\n\n### Furrow Irrigation\n- Water efficiency: 60%\n- Simple and low-cost\n- Requires well-levelled fields\n\n### Sprinkler Irrigation\n- Water efficiency: 75%\n- Covers large areas quickly\n- Not suitable for windy areas\n\n## Water Quality\n- Test water for salinity\n- Avoid water with high sodium content\n- Filter water to remove sediment\n\n## Scheduling Tips\n- Irrigate early morning or evening\n- Check soil moisture before watering\n- Use rain gauge to track rainfall\n- Adjust schedule based on weather`,
          readingTime: 9,
          waterRequirement: "400-600mm",
          optimalTemp: "All climates",
          icon: "Droplets",
        },
        {
          title: "Organic Farming Practices",
          crop: "Maize",
          category: "Protection",
          summary: "Natural methods for soil fertility and pest control without synthetic chemicals.",
          content: `## Principles of Organic Farming\n1. Work with natural systems\n2. Build soil health\n3. Promote biodiversity\n4. Use renewable resources\n5. Minimize external inputs\n\n## Building Soil Fertility\n\n### Composting\n- Layer green materials with dry materials\n- Keep pile moist\n- Turn every 2 weeks\n- Ready in 3-4 months\n\n### Green Manure\n- Plant legumes (mucuna, lablab)\n- Incorporate into soil before flowering\n- Adds nitrogen and organic matter\n\n### Animal Manure\n- Well-decomposed manure\n- Apply 10-15 tonnes per hectare\n- Incorporate into soil before planting\n\n## Natural Pest Control\n\n### Companion Planting\n- Plant marigolds near tomatoes to repel nematodes\n- Plant onions near carrots to repel carrot fly\n- Use garlic spray as general repellent\n\n### Biological Control\n- Attract beneficial insects (ladybugs, lacewings)\n- Use neem-based products\n- Introduce predatory insects\n\n### Cultural Control\n- Crop rotation\n- Intercropping\n- Proper spacing\n- Timely planting\n\n## Certification\n- Transition period: 2-3 years\n- Keep records of all practices\n- Soil tests required\n- Inspection by certifying body`,
          readingTime: 11,
          icon: "Leaf",
        },
        {
          title: "Disease Management in Tomatoes",
          crop: "Tomato",
          category: "Protection",
          summary: "Identifying and controlling common tomato diseases in Rwandan conditions.",
          content: `## Common Tomato Diseases\n\n### Late Blight (Phytophthora infestans)\n- **Symptoms**: Dark water-soaked spots on leaves, white mold on undersides\n- **Conditions**: Cool, wet weather (15-20°C, high humidity)\n- **Control**: Remove infected leaves, copper-based fungicide\n\n### Early Blight (Alternaria solani)\n- **Symptoms**: Dark concentric rings on lower leaves\n- **Control**: Mulch around plants, avoid overhead watering\n\n### Bacterial Wilt (Ralstonia solanacearum)\n- **Symptoms**: Sudden wilting, brown vascular tissue\n- **Control**: Use resistant varieties, crop rotation (4+ years)\n\n### Tomato Yellow Leaf Curl Virus\n- **Symptoms**: Yellowing, curling leaves, stunted growth\n- **Control**: Control whiteflies, use virus-free seedlings\n\n## Integrated Disease Management\n1. Use certified disease-free seeds\n2. Practice crop rotation (3-4 years)\n3. Ensure proper spacing for airflow\n4. Remove and destroy infected plants\n5. Use resistant varieties when available\n6. Apply fungicides preventively in high-risk periods\n\n## Fungicide Application Schedule\n- Start 2 weeks after transplanting\n- Apply every 7-14 days depending on weather\n- Alternate fungicides to prevent resistance\n- Stop application 7 days before harvest`,
          readingTime: 9,
          growthPeriod: "90-110 days",
          optimalTemp: "20-27°C",
          soilType: "Well-drained sandy loam",
          icon: "Bug",
        },
        {
          title: "Harvest and Storage of Grains",
          crop: "Maize",
          category: "Harvest",
          summary: "Proper techniques for harvesting, drying, and storing grain crops.",
          content: `## Harvest Timing\n\n### Maize\n- Harvest when black layer forms at kernel tip\n- Moisture content: 25-30% for maize\n- Dry to 13-14% for storage\n\n### Beans\n- Harvest when pods turn yellow-brown\n- Dry pods in sun before shelling\n- Target moisture: 14%\n\n### Rice\n- Harvest at 80% golden color\n- Moisture content: 20-25%\n- Dry to 14% for storage\n\n## Drying Methods\n\n### Sun Drying\n- Spread grains in thin layer (5-10cm)\n- Use clean tarpaulins, not bare ground\n- Stir every 2-3 hours\n- Cover at night and during rain\n- Drying time: 2-5 days depending on weather\n\n### Mechanical Drying\n- Use forced air dryers\n- Temperature: 43-50°C for maize\n- Monitor moisture content regularly\n\n## Storage Structures\n\n### Metal Silos\n- Airtight, rodent-proof\n- Capacity: 500-3000kg\n- Fumigate before sealing\n\n### Hermetic Bags (GrainPro)\n- Airtight plastic bags\n- Capacity: 50-100kg\n- No insect infestation possible\n\n### Traditional Granaries\n- Improved with raised platform\n- Rat guards on supports\n- Regular inspection needed\n\n## Storage Best Practices\n- Clean storage area before new harvest\n- Inspect grains regularly for pests\n- Store at cool temperature\n- Use natural repellents (neem, chili)\n- First-in, first-out for older stocks`,
          readingTime: 10,
          waterRequirement: "N/A (post-harvest)",
          icon: "Leaf",
        },
      ];

      for (const guide of guidesData) {
        await prisma.guide.create({ data: guide });
      }
      console.log(`   • ${guidesData.length} farming guides`);
    }
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
