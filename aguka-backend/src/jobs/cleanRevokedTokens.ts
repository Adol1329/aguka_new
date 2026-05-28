import { prisma } from "../prisma.js";

export async function cleanRevokedTokens() {
  return prisma.revokedToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
