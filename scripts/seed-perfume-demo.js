const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Seeding Perfume Store Demo...\n');

  // =============================================================================
  // 1. Create Store
  // =============================================================================
  const storeName = 'Essência Elegante';
  const storeSlug = 'essencia-elegante';

  let store = await prisma.store.findUnique({
    where: { slug: storeSlug },
  });

  if (!store) {
    console.log('📦 Creating store...');
    store = await prisma.store.create({
      data: {
        name: storeName,
        slug: storeSlug,
        logoUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        borderRadius: '0.75rem',
        whatsappPrimary: '+5511987654321',
        whatsappSecondary: '+5511987654322',
        isActive: true,
        onboardingComplete: true,
      },
    });
    console.log(`✅ Store created: ${store.name} (${store.slug})\n`);
  } else {
    console.log(`✅ Store already exists: ${store.name}\n`);
  }

  // =============================================================================
  // 2. Create Users
  // =============================================================================

  // Store Owner
  const ownerEmail = 'dono@essenciaelegante.com.br';
  const ownerPassword = '123456';
  const ownerPasswordHash = await bcrypt.hash(ownerPassword, 12);

  let owner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (!owner) {
    console.log('👤 Creating store owner...');
    owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: 'Maria Silva',
        passwordHash: ownerPasswordHash,
        role: 'STORE_OWNER',
        storeId: store.id,
        isActive: true,
      },
    });
    console.log(`✅ Owner created: ${owner.email}`);
  } else {
    await prisma.user.update({
      where: { id: owner.id },
      data: { passwordHash: ownerPasswordHash, role: 'STORE_OWNER', isActive: true },
    });
    console.log(`✅ Owner updated: ${owner.email}`);
  }

  // Attendant
  const attendantEmail = 'atendente@essenciaelegante.com.br';
  const attendantPassword = '123456';
  const attendantPasswordHash = await bcrypt.hash(attendantPassword, 12);

  let attendant = await prisma.user.findUnique({
    where: { email: attendantEmail },
  });

  if (!attendant) {
    console.log('👤 Creating attendant...');
    attendant = await prisma.user.create({
      data: {
        email: attendantEmail,
        name: 'João Santos',
        passwordHash: attendantPasswordHash,
        role: 'ATTENDANT',
        storeId: store.id,
        isActive: true,
      },
    });
    console.log(`✅ Attendant created: ${attendant.email}\n`);
  } else {
    await prisma.user.update({
      where: { id: attendant.id },
      data: { passwordHash: attendantPasswordHash, role: 'ATTENDANT', isActive: true },
    });
    console.log(`✅ Attendant updated: ${attendant.email}\n`);
  }

  // =============================================================================
  // 3. Create Products
  // =============================================================================
  console.log('🧴 Creating products...\n');

  const products = [
    {
      name: 'Chanel N°5 Eau de Parfum',
      description: 'O perfume feminino mais icônico do mundo. Uma fragrância atemporal com notas florais e aldeídicas.',
      brand: 'Chanel',
      category: 'Feminino',
      originalPrice: 899.00,
      salePrice: 749.00,
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
      stockQuantity: 15,
      isAvailable: true,
    },
    {
      name: 'Dior Sauvage Eau de Toilette',
      description: 'Fragrância masculina fresca e intensa. Notas de bergamota, pimenta e âmbar.',
      brand: 'Dior',
      category: 'Masculino',
      originalPrice: 699.00,
      salePrice: 599.00,
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
      stockQuantity: 23,
      isAvailable: true,
    },
    {
      name: 'Lancôme La Vie Est Belle',
      description: 'Perfume feminino doce e floral. Notas de íris, patchouli e baunilha.',
      brand: 'Lancôme',
      category: 'Feminino',
      originalPrice: 799.00,
      salePrice: 679.00,
      imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800',
      stockQuantity: 8,
      isAvailable: true,
    },
    {
      name: 'Paco Rabanne 1 Million',
      description: 'Fragrância masculina marcante e sedutora. Notas de toranja, canela e couro.',
      brand: 'Paco Rabanne',
      category: 'Masculino',
      originalPrice: 549.00,
      salePrice: 449.00,
      imageUrl: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800',
      stockQuantity: 31,
      isAvailable: true,
    },
    {
      name: 'Versace Bright Crystal',
      description: 'Perfume feminino fresco e vibrante. Notas de romã, peônia e almíscar.',
      brand: 'Versace',
      category: 'Feminino',
      originalPrice: 459.00,
      salePrice: 389.00,
      imageUrl: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800',
      stockQuantity: 12,
      isAvailable: true,
    },
    {
      name: 'Hugo Boss Bottled',
      description: 'Fragrância masculina clássica e elegante. Notas de maçã, canela e sândalo.',
      brand: 'Hugo Boss',
      category: 'Masculino',
      originalPrice: 399.00,
      salePrice: 329.00,
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800',
      stockQuantity: 19,
      isAvailable: true,
    },
    {
      name: 'Gucci Bloom Eau de Parfum',
      description: 'Perfume feminino floral intenso. Notas de jasmim, tuberosa e rangoon.',
      brand: 'Gucci',
      category: 'Feminino',
      originalPrice: 729.00,
      salePrice: 629.00,
      imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=800',
      stockQuantity: 5,
      isAvailable: true,
    },
    {
      name: 'Carolina Herrera Good Girl',
      description: 'Fragrância feminina ousada e sofisticada. Notas de amêndoa, café e tuberosa.',
      brand: 'Carolina Herrera',
      category: 'Feminino',
      originalPrice: 649.00,
      salePrice: 549.00,
      imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800',
      stockQuantity: 2,
      isAvailable: true,
    },
    {
      name: 'Armani Code Homme',
      description: 'Perfume masculino sedutor e misterioso. Notas de bergamota, anis estrelado e couro.',
      brand: 'Giorgio Armani',
      category: 'Masculino',
      originalPrice: 579.00,
      salePrice: 489.00,
      imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',
      stockQuantity: 0,
      isAvailable: false,
    },
    {
      name: 'Yves Saint Laurent Black Opium',
      description: 'Fragrância feminina viciante e sensual. Notas de café, baunilha e flor de laranjeira.',
      brand: 'Yves Saint Laurent',
      category: 'Feminino',
      originalPrice: 689.00,
      salePrice: 589.00,
      imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800',
      stockQuantity: 27,
      isAvailable: true,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: {
        storeId: store.id,
        name: product.name,
      },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...product,
          storeId: store.id,
        },
      });
      console.log(`  ✅ ${product.name} (Estoque: ${product.stockQuantity})`);
    } else {
      console.log(`  ⏭️  ${product.name} (já existe)`);
    }
  }

  // =============================================================================
  // Summary
  // =============================================================================
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n👤 Store Owner:`);
  console.log(`   Email: ${ownerEmail}`);
  console.log(`   Password: ${ownerPassword}`);
  console.log(`\n👤 Attendant:`);
  console.log(`   Email: ${attendantEmail}`);
  console.log(`   Password: ${attendantPassword}`);
  console.log(`\n🏪 Store:`);
  console.log(`   Name: ${store.name}`);
  console.log(`   Slug: ${store.slug}`);
  console.log(`   URL: http://localhost:8001/${store.slug}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
