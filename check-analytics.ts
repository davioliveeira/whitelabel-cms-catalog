
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAnalytics() {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: 'loja-demo' },
    });

    if (!store) {
      console.log('Demo store not found');
      return;
    }

    console.log(`Checking events for store: ${store.name} (${store.id})`);

    const viewCount = await prisma.analyticsEvent.count({
      where: {
        storeId: store.id,
        eventType: 'VIEW'
      }
    });

    const clickCount = await prisma.analyticsEvent.count({
      where: {
        storeId: store.id,
        eventType: 'WHATSAPP_CLICK'
      }
    });

    console.log('--- Analytics Report ---');
    console.log(`Total Views: ${viewCount}`);
    console.log(`Total WhatsApp Clicks: ${clickCount}`);
    console.log('------------------------');

    const recent = await prisma.analyticsEvent.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log("Recent Events:", recent);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkAnalytics();
