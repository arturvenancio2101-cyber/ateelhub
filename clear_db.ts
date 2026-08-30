import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  
  // Deleting in order to avoid foreign key constraints (if not cascaded properly)
  await prisma.ideaVote.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.kitItem.deleteMany();
  await prisma.kit.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.productQuote.deleteMany();
  await prisma.product.deleteMany();
  
  console.log('Database cleared!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
