
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const email = 'contato@properar.com.br';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  // 1. Create Tenant (Store)
  let tenant = await prisma.store.findUnique({
    where: { slug: 'properar' },
  });

  if (!tenant) {
    console.log('Creating tenant...');
    tenant = await prisma.store.create({
      data: {
        name: 'Properar Demo',
        slug: 'properar',
        // No password needed on tenant anymore as users handle auth
      },
    });
    console.log('Tenant created:', tenant.id);
  } else {
    console.log('Tenant already exists:', tenant.id);
  }

  // 2. Create User linked to Tenant
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('Creating user...');
    user = await prisma.user.create({
      data: {
        email,
        name: 'Admin User',
        passwordHash,
        role: 'STORE_OWNER',
        storeId: tenant.id,
        isActive: true,
      },
    });
    console.log('User created:', user.id);
  } else {
    // Update password just in case
    console.log('User exists, updating password...');
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        storeId: tenant.id, // Ensure link
        role: 'STORE_OWNER',
      },
    });
    console.log('User updated');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
