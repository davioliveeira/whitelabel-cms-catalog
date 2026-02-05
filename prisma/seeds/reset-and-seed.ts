import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up users...');

  // Delete all users
  await prisma.user.deleteMany({});
  console.log('✅ Users deleted.');

  const passwordHash = await bcrypt.hash('123456', 10);

  console.log('🌱 Seeding Super Admin...');
  await prisma.user.create({
    data: {
      email: 'super@admin.com',
      name: 'Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN', // Ensure this matches enum in schema
      storeId: null,
    },
  });
  console.log('✅ Super Admin created: super@admin.com / 123456');

  console.log('🌱 Seeding Demo Store & User...');

  // Access Store model (handling potential naming difference in client vs schema)
  // Schema says 'model Store', but existing seed used 'prisma.tenant'.
  // We'll try 'store' first (standard), fallback to 'tenant'.
  const storeModel = (prisma as any).store || (prisma as any).tenant;

  if (!storeModel) {
    throw new Error('Could not find Store/Tenant model in Prisma Client');
  }

  // Create or update Demo Store
  const demoStore = await storeModel.upsert({
    where: { slug: 'loja-demo' },
    update: {},
    create: {
      name: 'Loja Demo Brutalist',
      slug: 'loja-demo',
      logoUrl: 'https://via.placeholder.com/150',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      borderRadius: '0',
      whatsappPrimary: '+5511999999999',
      isActive: true,
      onboardingComplete: true,
    },
  });

  // Create Demo User linked to store
  await prisma.user.create({
    data: {
      email: 'demo@loja.com',
      name: 'Demo User',
      passwordHash,
      role: 'STORE_OWNER',
      storeId: demoStore.id,
    },
  });
  console.log('✅ Demo User created: demo@loja.com / 123456');
  console.log('✅ Demo Store created: /loja-demo');

  // ---------------------------------------------------------------------------
  // Seed Products (Arab Perfumery)
  // ---------------------------------------------------------------------------
  console.log('🧴 Seeding 30 Arab Perfumes...');

  const arabPerfumes = [
    {
      name: "Oud Mood",
      brand: "Lattafa",
      description: "Uma fragrância quente e envolvente com notas de oud, âmbar, resinas e especiarias. Perfeito para quem busca presença e sofisticação.",
      category: "Unissex",
      originalPrice: 289.90,
      salePrice: 249.90,
      imageUrl: "https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Club de Nuit Intense",
      brand: "Armaf",
      description: "Um perfume amadeirado especiado masculino. As notas de topo são Limão, Abacaxi, Bergamota e Groselha Preta.",
      category: "Masculino",
      originalPrice: 350.00,
      salePrice: 299.90,
      imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Amber Oud Gold Edition",
      brand: "Al Haramain",
      description: "Doce, frutado e almiscarado. Uma verdadeira joia da perfumaria árabe com notas de melão, abacaxi e âmbar.",
      category: "Unissex",
      originalPrice: 420.00,
      salePrice: 379.90,
      imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Yara",
      brand: "Lattafa",
      description: "Um perfume delicado e cremoso com notas de orquídea, heliotrópio e tangerina. Feminino e encantador.",
      category: "Feminino",
      originalPrice: 220.00,
      salePrice: 189.90,
      imageUrl: "https://images.unsplash.com/photo-1615108395423-380ccea66b0d?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Asad",
      brand: "Lattafa",
      description: "Pimenta preta, tabaco e café compõem essa fragrância masculina robusta e elegante, ideal para a noite.",
      category: "Masculino",
      originalPrice: 260.00,
      salePrice: 219.90,
      imageUrl: "https://images.unsplash.com/photo-1595425970339-272e0136d8d6?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Khamrah",
      brand: "Lattafa",
      description: "Canela, noz-moscada e tâmaras. Um perfume gourmand especiado que remete ao luxo e calor do oriente.",
      category: "Unissex",
      originalPrice: 310.00,
      salePrice: 279.90,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Hawas for Him",
      brand: "Rasasi",
      description: "Uma fragrância aquática aromática que captura o espírito aventureiro e moderno. Notas de ameixa e canela.",
      category: "Masculino",
      originalPrice: 380.00,
      salePrice: 349.00,
      imageUrl: "https://images.unsplash.com/photo-1585386927338-76c22f672740?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Fakhar Black",
      brand: "Lattafa",
      description: "Inspirado em clássicos modernos, traz maçã, bergamota e gengibre. Versátil e elegante para o dia a dia.",
      category: "Masculino",
      originalPrice: 190.00,
      salePrice: 159.90,
      imageUrl: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Bade'e Al Oud (Oud for Glory)",
      brand: "Lattafa",
      description: "Oud majestoso, açafrão e lavanda. Um perfume escuro, misterioso e extremamente fixante.",
      category: "Unissex",
      originalPrice: 299.00,
      salePrice: 269.90,
      imageUrl: "https://images.unsplash.com/photo-1519669556878-63bd08b1312b?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Shaghaf Oud",
      brand: "Swiss Arabian",
      description: "Pralinê, açafrão e oud. Um gourmand oriental que é puro luxo em um frasco dourado. Intenso.",
      category: "Unissex",
      originalPrice: 340.00,
      salePrice: 299.90,
      imageUrl: "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Tag-Him",
      brand: "Armaf",
      description: "Fresco, amadeirado e especiado. Notas de toranja, limão e pimenta rosa. Ideal para o homem dinâmico.",
      category: "Masculino",
      originalPrice: 180.00,
      salePrice: 149.90,
      imageUrl: "https://images.unsplash.com/photo-1631541909061-71e349d1f203?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Modest Deux",
      brand: "Afnan",
      description: "Doce e frutado com toques de chocolate e morango. Uma fragrância feminina divertida e sedutora.",
      category: "Feminino",
      originalPrice: 210.00,
      salePrice: 179.90,
      imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "9pm",
      brand: "Afnan",
      description: "Baunilha, âmbar e maçã. Um perfume noturno, adocicado e perfeito para festas e encontros.",
      category: "Masculino",
      originalPrice: 230.00,
      salePrice: 199.90,
      imageUrl: "https://images.unsplash.com/photo-1550525811-e5869dd03032?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Supremacy Not Only Intense",
      brand: "Afnan",
      description: "Cassis, bergamota e musgo de carvalho. Uma bomba de projeção frutada e defumada.",
      category: "Masculino",
      originalPrice: 360.00,
      salePrice: 319.90,
      imageUrl: "https://images.unsplash.com/photo-1616949755610-8c9bc08f8c0e?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Ana Abiyedh Rouge",
      brand: "Lattafa",
      description: "Pêra, kumquat e gerânio. Inspirado em fragrâncias de nicho famosas, doce e sofisticado.",
      category: "Unissex",
      originalPrice: 180.00,
      salePrice: 149.90,
      imageUrl: "https://images.unsplash.com/photo-1605618797371-3c22ad4e377f?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Ajwad",
      brand: "Lattafa",
      description: "Frutas exóticas, rosa e almíscar. Um perfume mosaico que mistura o frescor com a profundidade oriental.",
      category: "Unissex",
      originalPrice: 220.00,
      salePrice: 189.90,
      imageUrl: "https://images.unsplash.com/photo-1512777576244-b846ac3d816f?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "La Yuqawam Homme",
      brand: "Rasasi",
      description: "Couro, framboesa e tomilho. Uma obra-prima da perfumaria árabe, sinônimo de elegância masculina.",
      category: "Masculino",
      originalPrice: 480.00,
      salePrice: 429.90,
      imageUrl: "https://images.unsplash.com/photo-1549557053-a1286c757c21?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Junoon Noir",
      brand: "Al Haramain",
      description: "Fava tonka, baunilha e jasmim. Um floral oriental feminino, misterioso e encantador.",
      category: "Feminino",
      originalPrice: 340.00,
      salePrice: 299.90,
      imageUrl: "https://images.unsplash.com/photo-1595166661361-b1e7c4f421ce?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Qaa'ed",
      brand: "Lattafa",
      description: "Especiarias quentes, canela e oud. Um perfume para quem gosta de fragrâncias de personalidade forte.",
      category: "Unissex",
      originalPrice: 200.00,
      salePrice: 169.90,
      imageUrl: "https://images.unsplash.com/photo-1528740561666-dc24705f08a7?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Bent Al Ezz",
      brand: "Rasasi",
      description: "Mel, pêssego e sândalo. Uma fragrância feminina rica e opulenta.",
      category: "Feminino",
      originalPrice: 150.00,
      salePrice: 129.90,
      imageUrl: "https://images.unsplash.com/photo-1632230626359-d89280d47345?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Midnight Oud",
      brand: "Ard Al Zaafaran",
      description: "Orégano, pimenta e oud. Inspirado em grandes clássicos, oferece um aroma esfumaçado e complexo.",
      category: "Masculino",
      originalPrice: 180.00,
      salePrice: 149.90,
      imageUrl: "https://images.unsplash.com/photo-1531693251400-38df35776dc7?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Wisal Dhahab",
      brand: "Ajmal",
      description: "Pêra, maçã, rosa e sândalo. Um frasco dourado que guarda uma fragrância frutada e floral.",
      category: "Unissex",
      originalPrice: 250.00,
      salePrice: 219.90,
      imageUrl: "https://images.unsplash.com/photo-1549880860-60b8686259ce?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Raghba",
      brand: "Lattafa",
      description: "Açúcar queimado, baunilha e oud. Um clássico doce e incensado da Lattafa.",
      category: "Unissex",
      originalPrice: 140.00,
      salePrice: 119.90,
      imageUrl: "https://images.unsplash.com/photo-1610461888750-10bfc601b874?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Sura",
      brand: "Swiss Arabian",
      description: "Uma sinfonia floral frutada para mulheres que amam aromas alegres e vibrantes.",
      category: "Feminino",
      originalPrice: 160.00,
      salePrice: 139.90,
      imageUrl: "https://images.unsplash.com/photo-1512404396328-912d0903332e?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Shaghaf Men",
      brand: "Swiss Arabian",
      description: "Lavanda, limão e notas marinhas. Refrescante com uma base amadeirada sólida.",
      category: "Masculino",
      originalPrice: 190.00,
      salePrice: 169.90,
      imageUrl: "https://images.unsplash.com/photo-1522336366917-a64d14210e75?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Oud 24 Hours",
      brand: "Ard Al Zaafaran",
      description: "Chocolate amargo, tangerina e especiarias. Um perfume intrigante e de longa duração.",
      category: "Unissex",
      originalPrice: 130.00,
      salePrice: 109.90,
      imageUrl: "https://images.unsplash.com/photo-1615370216715-77987216c52a?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Ameer Al Oudh Intense Oud",
      brand: "Lattafa",
      description: "Madeira de oud, açúcar e baunilha. Confortável, quente e perfeito para o inverno.",
      category: "Unissex",
      originalPrice: 200.00,
      salePrice: 179.90,
      imageUrl: "https://images.unsplash.com/photo-1632766024921-39951ad7077a?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Teriaq",
      brand: "Lattafa",
      description: "Caramelo, couro e damasco. Uma criação complexa e moderna lançada recentemente.",
      category: "Unissex",
      originalPrice: 280.00,
      salePrice: 249.90,
      imageUrl: "https://images.unsplash.com/photo-1620917670397-9963624e7568?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Velvet Oud",
      brand: "Lattafa",
      description: "Couro, oud e cítricos. Elegante e vem em uma embalagem aveludada muito luxuosa.",
      category: "Masculino",
      originalPrice: 210.00,
      salePrice: 189.90,
      imageUrl: "https://images.unsplash.com/photo-1549463567-54c330df768f?q=80&w=600&auto=format&fit=crop"
    }
  ];

  for (const product of arabPerfumes) {
    await prisma.product.create({
      data: {
        ...product,
        storeId: demoStore.id,
        isAvailable: true,
      }
    });
  }
  console.log(`✅ Seeded ${arabPerfumes.length} Arab perfumes for demo store.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
