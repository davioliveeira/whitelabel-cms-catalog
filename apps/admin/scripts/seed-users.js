
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking users in the database...');

  // Check and create Super Admin
  const adminEmail = 'super@admin.com';
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log(`Creating user ${adminEmail}...`);
    const hashedPassword = await hash('123456', 12);

    // Check for admin store
    let store = await prisma.store.findUnique({ where: { slug: 'admin-store' } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: 'Admin Store',
          slug: 'admin-store',
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      });
    }

    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Super Admin',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        storeId: store.id
      },
    });
    console.log(`Created user ${adminEmail}`);
  } else {
    console.log(`User ${adminEmail} already exists.`);
    // Update password just in case
    const hashedPassword = await hash('123456', 12);
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: hashedPassword, isActive: true }
    });
    console.log(`Updated password for ${adminEmail}`);
  }

  // Check and create Attendant User
  const attendantEmail = 'atendimento@miners.com.br';
  let attendant = await prisma.user.findUnique({
    where: { email: attendantEmail },
  });

  if (!attendant) {
    console.log(`Creating user ${attendantEmail}...`);
    const hashedPassword = await hash('123456', 12);

    // Ensure 'miners' store exists
    let store = await prisma.store.findUnique({ where: { slug: 'miners' } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: 'Miners Store',
          slug: 'miners',
          logoUrl: '',
          primaryColor: '#000000',
          secondaryColor: '#ffffff'
        }
      });
      console.log('Created Miners Store');
    }

    attendant = await prisma.user.create({
      data: {
        email: attendantEmail,
        name: 'Atendimento Miners',
        passwordHash: hashedPassword,
        role: 'ATTENDANT',
        storeId: store.id,
        isActive: true
      },
    });
    console.log(`Created user ${attendantEmail}`);
  } else {
    console.log(`User ${attendantEmail} already exists.`);
    // Update password just in case
    const hashedPassword = await hash('123456', 12);
    await prisma.user.update({
      where: { id: attendant.id },
      data: { passwordHash: hashedPassword, role: 'ATTENDANT', isActive: true }
    });
    console.log(`Updated password and role for ${attendantEmail}`);
  }

  // List all users
  const users = await prisma.user.findMany({
    include: { store: true }
  });
  console.log('Current Users:');
  users.forEach(u => {
    console.log(`- ${u.email} (${u.role}) - Store: ${u.store?.slug} - Active: ${u.isActive}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
