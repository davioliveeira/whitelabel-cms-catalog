// =============================================================================
// Seed: Properar Perfumaria - Loja de Perfumes Árabes
// =============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌙 Seeding Properar Perfumaria...');

  // 1. Create tenant
  const passwordHash = await bcrypt.hash('admin123', 12);
  
  const tenant = await prisma.tenant.upsert({
    where: { email: 'contato@properar.com.br' },
    update: {},
    create: {
      name: 'Properar Perfumaria',
      slug: 'properar',
      email: 'contato@properar.com.br',
      passwordHash,
      logoUrl: '/uploads/brands/properar-logo.png',
      whatsappPrimary: '+5511999887766',
      whatsappSecondary: '+5511988776655',
      primaryColor: '#8B4513',
      secondaryColor: '#DAA520',
      borderRadius: '8',
      onboardingComplete: true,
    },
  });

  console.log('✅ Tenant created:', tenant.name);

  // 2. Create products - Perfumes Árabes Premium
  const products = [
    {
      name: 'Oud Al Sultan',
      description: 'Fragrância oriental masculina com notas de oud, âmbar e sândalo. Perfume árabe intenso e marcante, perfeito para ocasiões especiais. Duração de 8-12 horas.',
      brand: 'Al Haramain',
      category: 'Masculino',
      originalPrice: 289.90,
      salePrice: 249.90,
      imageUrl: '/uploads/products/oud-al-sultan.jpg',
    },
    {
      name: 'Amber Mystique',
      description: 'Perfume unissex com âmbar, baunilha e especiarias orientais. Aroma envolvente e sofisticado que conquista a todos. Fixação prolongada.',
      brand: 'Rasasi',
      category: 'Unissex',
      originalPrice: 349.90,
      salePrice: 299.90,
      imageUrl: '/uploads/products/amber-mystique.jpg',
    },
    {
      name: 'Rose Al Amal',
      description: 'Fragrância floral feminina com rosas damascenas, jasmim e almíscar. Elegante e delicada, ideal para o dia a dia. Alta qualidade e excelente fixação.',
      brand: 'Ajmal',
      category: 'Feminino',
      originalPrice: 269.90,
      salePrice: 229.90,
      imageUrl: '/uploads/products/rose-al-amal.jpg',
    },
    {
      name: 'Musk Al Ghazal',
      description: 'Perfume masculino com almíscar branco, cedro e vetiver. Aroma suave e sofisticado, perfeito para homens modernos. Longa duração.',
      brand: 'Swiss Arabian',
      category: 'Masculino',
      originalPrice: 199.90,
      salePrice: 169.90,
      imageUrl: '/uploads/products/musk-al-ghazal.jpg',
    },
    {
      name: 'Saffron Gold',
      description: 'Fragrância unissex luxuosa com açafrão, rosa e oud. Perfume árabe premium com notas amadeiradas e florais. Exclusivo e sofisticado.',
      brand: 'Al Haramain',
      category: 'Unissex',
      originalPrice: 399.90,
      salePrice: 349.90,
      imageUrl: '/uploads/products/saffron-gold.jpg',
    },
    {
      name: 'Jasmine Royale',
      description: 'Perfume feminino com jasmim sambac, gardênia e sândalo. Floral oriental elegante e envolvente. Perfeito para a noite.',
      brand: 'Ajmal',
      category: 'Feminino',
      originalPrice: 279.90,
      salePrice: 239.90,
      imageUrl: '/uploads/products/jasmine-royale.jpg',
    },
    {
      name: 'Black Oud Intense',
      description: 'Fragrância masculina intensa com oud negro, couro e especiarias. Perfume árabe poderoso e marcante. Para homens de personalidade forte.',
      brand: 'Rasasi',
      category: 'Masculino',
      originalPrice: 429.90,
      salePrice: 379.90,
      imageUrl: '/uploads/products/black-oud-intense.jpg',
    },
    {
      name: 'White Musk Harmony',
      description: 'Perfume feminino suave com almíscar branco, lírio e violeta. Delicado e romântico, ideal para o dia. Fixação média-longa.',
      brand: 'Swiss Arabian',
      category: 'Feminino',
      originalPrice: 189.90,
      salePrice: 159.90,
      imageUrl: '/uploads/products/white-musk-harmony.jpg',
    },
    {
      name: 'Amber Nights',
      description: 'Fragrância oriental unissex com âmbar cinza, baunilha e patchouli. Aroma quente e envolvente para as noites. Premium quality.',
      brand: 'Al Haramain',
      category: 'Unissex',
      originalPrice: 319.90,
      salePrice: 279.90,
      imageUrl: '/uploads/products/amber-nights.jpg',
    },
    {
      name: 'Cardamom Spice',
      description: 'Perfume masculino com cardamomo, gengibre e madeiras orientais. Aromático e vibrante, perfeito para homens jovens. Longa duração.',
      brand: 'Rasasi',
      category: 'Masculino',
      originalPrice: 249.90,
      salePrice: 209.90,
      imageUrl: '/uploads/products/cardamom-spice.jpg',
    },
    {
      name: 'Orchid Al Fajr',
      description: 'Fragrância feminina com orquídea, pêssego e almíscar. Floral frutado sofisticado e envolvente. Ideal para mulheres elegantes.',
      brand: 'Ajmal',
      category: 'Feminino',
      originalPrice: 299.90,
      salePrice: 259.90,
      imageUrl: '/uploads/products/orchid-al-fajr.jpg',
    },
    {
      name: 'Sandalwood Mystic',
      description: 'Perfume unissex com sândalo, cedro e vetiver. Amadeirado oriental relaxante e sofisticado. Excelente fixação.',
      brand: 'Swiss Arabian',
      category: 'Unissex',
      originalPrice: 229.90,
      salePrice: 199.90,
      imageUrl: '/uploads/products/sandalwood-mystic.jpg',
    },
    {
      name: 'Rose Oud Imperial',
      description: 'Fragrância premium com rosa turca e oud cambojano. Perfume árabe luxuoso e exclusivo. Para quem busca sofisticação máxima.',
      brand: 'Al Haramain',
      category: 'Unissex',
      originalPrice: 549.90,
      salePrice: 489.90,
      imageUrl: '/uploads/products/rose-oud-imperial.jpg',
    },
    {
      name: 'Vanilla Desire',
      description: 'Perfume feminino gourmand com baunilha, caramelo e almíscar. Doce e envolvente, perfeito para a noite. Alta fixação.',
      brand: 'Rasasi',
      category: 'Feminino',
      originalPrice: 239.90,
      salePrice: 199.90,
      imageUrl: '/uploads/products/vanilla-desire.jpg',
    },
    {
      name: 'Leather Al Majlis',
      description: 'Fragrância masculina com couro, tabaco e oud. Perfume árabe intenso e sofisticado. Para homens de estilo único.',
      brand: 'Ajmal',
      category: 'Masculino',
      originalPrice: 369.90,
      salePrice: 319.90,
      imageUrl: '/uploads/products/leather-al-majlis.jpg',
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        ...productData,
        tenantId: tenant.id,
        isAvailable: true,
      },
    });
    console.log(`  ✨ Product created: ${product.name}`);
  }

  console.log('\n🎉 Properar Perfumaria seeded successfully!');
  console.log(`📧 Login: contato@properar.com.br`);
  console.log(`🔑 Password: admin123`);
  console.log(`🌐 Catalog: http://localhost:4200/properar`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
