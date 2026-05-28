import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  console.log("Connecting to Postgres...");
  await client.connect();
  
  try {
    console.log("Attempting to rename enum value...");
    await client.query(`ALTER TYPE "UserRole" RENAME VALUE 'cooperative_manager' TO 'cooperative';`);
    console.log("Enum renamed!");
  } catch(e: any) {
    console.log("Enum rename output:", e.message);
  }
  
  try {
    console.log("Attempting to update any remaining users...");
    await client.query(`UPDATE "User" SET "role" = 'cooperative' WHERE "role"::text = 'cooperative_manager';`);
    console.log("Users updated!");
  } catch(e: any) {
    console.log("User update output:", e.message);
  }
  
  await client.end();
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
