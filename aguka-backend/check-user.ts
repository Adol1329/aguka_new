import { prisma } from './src/prisma.js';
async function main() {
  const user = await prisma.user.findFirst({ where: { phone: '250788300020' } });
  console.log(JSON.stringify({ phone: user?.phone, isActive: user?.isActive, status: user?.status }, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());