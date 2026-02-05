
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Force resetting database...');

  try {
    // Drop schema public cascade (this drops all tables, types, etc.)
    await prisma.$executeRawUnsafe(`DROP SCHEMA public CASCADE;`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);

    // Grant permissions back (default for postgres usually)
    await prisma.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO public;`);
    // Or specifically to current user if needed, but 'public' usually suffices for local dev

    console.log('Database reset successful.');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
