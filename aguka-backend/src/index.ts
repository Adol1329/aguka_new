import { server } from "./app.js";
import { config } from "./config/index.js";
import { prisma } from "./prisma.js";
import { logger } from "./utils/logger.js";
import * as os from 'os';

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected");

    const host = "0.0.0.0";
    const localIP = getLocalIP();
    server.listen(config.port, host, () => {
      logger.info(`
═══════════════════════════════════════════════════════════╗
║        AGUKA SMART FARMING KIT - BACKEND API            ║
═══════════════════════════════════════════════════════════╣
║  Environment: ${config.env.padEnd(41)}║
║  Local:       http://localhost:${config.port.toString().padEnd(35)}║
║  Network:     http://${localIP}:${config.port.toString().padEnd(31)}║
║  API Version: ${config.apiVersion.padEnd(41)}║
═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
