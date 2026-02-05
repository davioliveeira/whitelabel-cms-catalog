// =============================================================================
// Update Product Images - Properar Perfumaria
// =============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🖼️  Updating Properar Perfumaria product images...');

  // Find tenant
  const tenant = await prisma.tenant.findUnique({
    where: { email: 'contato@properar.com.br' },
  });

  if (!tenant) {
    throw new Error('❌ Tenant not found! Run seed-properar.sh first.');
  }

  // High-quality perfume images from Unsplash (free to use)
  const imageUpdates = [
    {
      name: 'Oud Al Sultan',
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    },
    {
      name: 'Amber Mystique',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    },
    {
      name: 'Rose Al Amal',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
    },
    {
      name: 'Musk Al Ghazal',
      imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&q=80',
    },
    {
      name: 'Saffron Gold',
      imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80',
    },
    {
      name: 'Jasmine Royale',
      imageUrl: 'https://images.unsplash.com/photo-1595425959632-34f2822322ce?w=800&q=80',
    },
    {
      name: 'Black Oud Intense',
      imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
    },
    {
      name: 'White Musk Harmony',
      imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80',
    },
    {
      name: 'Amber Nights',
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    },
    {
      name: 'Cardamom Spice',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    },
    {
      name: 'Orchid Al Fajr',
      imageUrl: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
    },
    {
      name: 'Sandalwood Mystic',
      imageUrl: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80',
    },
    {
      name: 'Rose Oud Imperial',
      imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    },
    {
      name: 'Vanilla Desire',
      imageUrl: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=800&q=80',
    },
    {
      name: 'Leather Al Majlis',
      imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    },
  ];

  let updatedCount = 0;

  for (const update of imageUpdates) {
    try {
      const result = await prisma.product.updateMany({
        where: {
          tenantId: tenant.id,
          name: update.name,
        },
        data: {
          imageUrl: update.imageUrl,
        },
      });

      if (result.count > 0) {
        console.log(`  ✅ Updated: ${update.name}`);
        updatedCount++;
      } else {
        console.log(`  ⚠️  Not found: ${update.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Error updating ${update.name}:`, error);
    }
  }

  console.log(`\n🎉 Image update complete! ${updatedCount}/${imageUpdates.length} products updated.`);
  console.log(`🌐 Check your catalog: http://localhost:4200/properar`);
}

main()
  .catch((e) => {
    console.error('❌ Update error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
