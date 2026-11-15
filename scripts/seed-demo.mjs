import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  ["Sacs artisanaux", "Sacs en jute, raphia et tissus wax, cousus à la main.", 1],
  ["Éventails", "Éventails pliants en tissu africain.", 2],
  ["Bijoux", "Boucles d’oreilles et bijoux artisanaux.", 3],
  ["Parfums", "Parfums et senteurs naturelles.", 4],
  ["Chaussures", "Chaussures et sandales artisanales.", 5],
  ["Accessoires & Beauté", "Accessoires de mode et de beauté.", 6],
];

const products = [
  {
    slug: "cabas-bleu-denim-ruban-wax",
    name: "Cabas bleu denim, ruban wax",
    categorySlug: "sacs-artisanaux",
    saleMode: "stock",
    price: 28000,
    stockQuantity: 6,
    summary: "Un cabas en toile bleue structurée, barré d’un ruban de wax indigo.",
    description: "Toile bleue structurée, ruban de wax indigo en biais, anses tressées dans le même tissu. Pièce faite main.",
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: "sac-jute-naturel-anses-wax",
    name: "Sac jute naturel, anses wax",
    categorySlug: "sacs-artisanaux",
    saleMode: "sur_commande",
    price: 32000,
    stockQuantity: null,
    leadTime: "7 à 10 jours",
    summary: "Jute naturel, anses arrondies en wax doré et fleur de satin ornée de perles.",
    description: "Fabriqué à la commande : choisissez le tissu wax des anses, les finitions et les initiales.",
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: "pochette-duo-wax-dore-et-lin",
    name: "Pochette duo wax doré et lin",
    categorySlug: "sacs-artisanaux",
    saleMode: "stock",
    price: 25000,
    stockQuantity: 4,
    summary: "Moitié wax ivoire et or, moitié lin naturel, avec cordon torsadé et pompon.",
    description: "Pochette doublée, fermeture discrète, cordon torsadé doré et brun avec pompon.",
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: "eventail-wax-mosaique",
    name: "Éventail wax Mosaïque",
    categorySlug: "eventails",
    saleMode: "stock",
    price: 12000,
    stockQuantity: 9,
    summary: "Éventail pliant en tissu wax aux motifs de feuilles, branches roses ajourées.",
    description: "Tissu wax coloré, branches ajourées rehaussées de dorures. Se plie et se glisse dans un sac.",
    isFeatured: true,
    sortOrder: 4,
  },
];

const zones = [
  { name: "Cotonou", fee: 1500, leadTime: "24 à 48 heures", isPickup: false, sortOrder: 1 },
  { name: "Abomey-Calavi", fee: 1500, leadTime: "24 à 48 heures", isPickup: false, sortOrder: 2 },
  { name: "Porto-Novo", fee: 2500, leadTime: "2 à 3 jours", isPickup: false, sortOrder: 3 },
  { name: "Retrait sur place", fee: 0, leadTime: null, isPickup: true, sortOrder: 4 },
];

const faqs = [
  {
    question: "Comment passer commande ?",
    answer: "Choisissez vos articles, ajoutez-les au panier, remplissez vos coordonnées puis envoyez-nous la capture de votre paiement sur WhatsApp avec votre référence.",
    sortOrder: 1,
  },
  {
    question: "Comment commander une création sur mesure ?",
    answer: "Ouvrez la fiche d’une création « sur commande », décrivez ce que vous voulez et envoyez la demande : nous vous répondons avec un devis sur WhatsApp.",
    sortOrder: 2,
  },
  {
    question: "Quand ma commande est-elle expédiée ?",
    answer: "Après confirmation de votre paiement. Les délais de livraison dépendent de votre zone.",
    sortOrder: 3,
  },
];

const pages = [
  {
    slug: "a-propos",
    title: "À propos",
    content: "## Notre histoire\n\nTexte de démonstration : la propriétaire racontera ici l’histoire de la marque, ce qui l’inspire et son savoir-faire.",
    isPublished: true,
    needsReview: true,
    sortOrder: 1,
  },
  {
    slug: "livraison-retours",
    title: "Livraison et retours",
    content: "## Livraison\n\nTexte de démonstration : zones, délais et frais de livraison.\n\n## Retours\n\nTexte de démonstration : conditions de retour et d’échange.",
    isPublished: true,
    needsReview: true,
    sortOrder: 2,
  },
  {
    slug: "conditions-de-vente",
    title: "Conditions de vente",
    content: "Texte à rédiger et à valider par la propriétaire avant publication.",
    isPublished: false,
    needsReview: true,
    sortOrder: 3,
  },
  {
    slug: "confidentialite",
    title: "Confidentialité",
    content: "Texte à rédiger et à valider par la propriétaire avant publication.",
    isPublished: false,
    needsReview: true,
    sortOrder: 4,
  },
];

async function main() {
  const categoryIds = new Map();

  for (const [name, description, sortOrder] of categories) {
    const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/&/g, "et").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name, description, sortOrder, isVisible: true },
      create: { name, slug, description, sortOrder, isVisible: true },
    });
    categoryIds.set(slug, category.id);
  }

  for (const product of products) {
    const { categorySlug, ...data } = product;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: { ...data, categoryId: categoryIds.get(categorySlug), status: "published" },
      create: { ...data, categoryId: categoryIds.get(categorySlug), status: "published" },
    });
  }

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { id: zone.sortOrder },
      update: { ...zone, isActive: true },
      create: { ...zone, isActive: true },
    });
  }

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data: { ...faq, isVisible: true } });
    } else {
      await prisma.faq.create({ data: { ...faq, isVisible: true } });
    }
  }

  for (const page of pages) {
    const { slug, ...data } = page;
    await prisma.page.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
  }

  const settingsCount = await prisma.siteSetting.count();
  if (settingsCount === 0) {
    await prisma.siteSetting.create({
      data: {
        brandName: "MARINA Craft",
        tagline: "L’élégance au naturel",
        phone: "+229 00 00 00 00",
        whatsapp: "+229 00 00 00 00",
        momoInstructions: "Numéro Mobile Money : à renseigner dans l’administration (Paramètres).\nNom du titulaire : à renseigner.",
        cashOnDeliveryEnabled: true,
        heroImages: [],
        heroInterval: 6,
      },
    });
  }

  const homeSections = [
    {
      type: "hero",
      sortOrder: 1,
      isVisible: true,
      content: {
        eyebrow: "MARINA Craft",
        title: "L’élégance au naturel.",
        text: "Des créations artisanales pensées pour révéler votre style.",
        button_label: "Découvrir la collection",
      },
    },
    { type: "featured_products", sortOrder: 2, isVisible: true, content: { title: "Nos créations", subtitle: "Des pièces pensées avec soin." } },
    { type: "categories", sortOrder: 3, isVisible: true, content: { title: "Nos univers" } },
  ];

  for (const section of homeSections) {
    await prisma.homeSection.upsert({
      where: { type: section.type },
      update: section,
      create: section,
    });
  }

  console.log("Données de démonstration Marina Craft installées.");
  console.log("6 catégories, 4 produits, 4 zones, 3 FAQ, 4 pages et 3 sections d’accueil.");
  console.log("Les images produits et du carrousel restent à transférer dans Supabase Storage.");
}

main()
  .catch((error) => {
    console.error("Échec du seed Marina Craft :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
