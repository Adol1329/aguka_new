import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { config } from "./config/index.js";

const pool = new pg.Pool({ connectionString: config.database.url });
const adapter = new PrismaPg(pool);

export const basePrisma = new PrismaClient({ adapter });

/**
 * Models that support soft delete
 */
const SOFT_DELETE_MODELS = [
  "user",
  "farmerProfile",
  "cooperative",
  "extensionOfficerProfile",
  "cooperativeProfile",
  "sensor",
  "crop",
];

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!SOFT_DELETE_MODELS.includes(model)) {
          return query(args);
        }

        const typedArgs = args as any;

        // Handle Read Operations: Filter out deleted records
        if (
          ["findMany", "findFirst", "findUnique", "count", "aggregate", "groupBy"].includes(
            operation
          )
        ) {
          typedArgs.where = { ...(typedArgs.where || {}), deletedAt: null };
        }

        // Handle Delete Operations: Convert to Soft Delete (Update)
        if (operation === "delete" && typedArgs.where) {
          return (basePrisma as any)[model].update({
            where: typedArgs.where,
            data: { deletedAt: new Date() },
          });
        }

        if (operation === "deleteMany" && typedArgs.where) {
          return (basePrisma as any)[model].updateMany({
            where: typedArgs.where,
            data: { deletedAt: new Date() },
          });
        }

        return query(typedArgs);
      },
    },
  },
});
