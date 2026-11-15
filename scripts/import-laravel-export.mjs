import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
const prisma = new PrismaClient();
const file = path.resolve(process.argv[2] || "marina-next-export/database.json");
const payload = JSON.parse(fs.readFileSync(file, "utf8"));
const plan = [
  ["categories","category"],["products","product"],["product_media","productMedia"],
  ["site_settings","siteSetting"],["delivery_zones","deliveryZone"],["orders","order"],
  ["order_items","orderItem"],["order_payments","orderPayment"],
  ["order_status_histories","orderStatusHistory"],["stock_movements","stockMovement"],
  ["notification_logs","notificationLog"],["home_sections","homeSection"],["pages","page"],["faqs","faq"]
];
const dates = new Set(["createdAt","updatedAt","placedAt","receivedAt","publishedAt","emailVerifiedAt"]);
const booleans = new Set(["isVisible","isActive","isPickup","isPrimary","isFeatured","cashOnDeliveryEnabled","isPublished","needsReview"]);
const jsonFields = new Set(["heroImages","content","draftContent"]);
const camel = s => s.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
function convert(row, table) {
  const out = {};
  for (const [key, original] of Object.entries(row)) {
    const name = camel(key);
    let value = original;
    if (dates.has(name) && value != null) value = new Date(value);
    if (booleans.has(name) && value != null) value = Boolean(Number(value));
    if (jsonFields.has(name) && typeof value === "string") { try { value = JSON.parse(value); } catch {} }
    out[name] = value;
  }
  if (table === "order_payments") out.recordedById = null;
  if (table === "order_status_histories") out.changedById = null;
  if (table === "stock_movements") out.createdById = null;
  return out;
}
try {
  for (const [table, model] of plan) {
    const rows = payload.tables?.[table] || [];
    if (!rows.length) { console.log(table + ": 0 ligne"); continue; }
    const result = await prisma[model].createMany({data:rows.map(row=>convert(row,table)),skipDuplicates:true});
    console.log(table + ": " + result.count + " ligne(s) importée(s)");
    const sql = "SELECT setval(pg_get_serial_sequence('\"" + table + "\"','id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM \"" + table + "\"";
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("Import des données terminé.");
} catch (error) {
  console.error("Import interrompu :", error);
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
