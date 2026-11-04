import prisma from '../lib/prisma';

async function main() {
  const settings = await prisma.adminSettings.findUnique({ where: { id: 'default' } });
  const sync = await prisma.syncConfig.findUnique({ where: { id: 'default' } });
  console.log('Current Admin Settings:', settings);
  console.log('Current Sync Config:', sync);
}

main().finally(() => prisma.$disconnect());
