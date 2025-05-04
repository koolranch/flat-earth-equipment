import { readdirSync, readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function importProducts() {
  try {
    const rows = [];
    for (const f of readdirSync("ingest/json").filter(x => x.endsWith(".json"))) {
      rows.push(JSON.parse(readFileSync(`ingest/json/${f}`, "utf8")));
    }
    
    console.log(`Found ${rows.length} products to import`);
    
    for (const p of rows) {
      const brand = await prisma.brand.upsert({
        where: { name: p.brand },
        update: {},
        create: { name: p.brand }
      });
      
      const system = await prisma.system.upsert({
        where: { name: p.system },
        update: {},
        create: { name: p.system }
      });
      
      const category = await prisma.category.upsert({
        where: { name: p.category },
        update: {},
        create: { name: p.category }
      });
      
      await prisma.part.upsert({
        where: { sku: p.sku },
        update: {
          name: p.name,
          description: p.description_html,
          price: p.price,
          brandId: brand.id,
          systemId: system.id,
          categoryId: category.id,
          slug: p.slug
        },
        create: {
          sku: p.sku,
          name: p.name,
          description: p.description_html,
          price: p.price,
          brandId: brand.id,
          systemId: system.id,
          categoryId: category.id,
          slug: p.slug
        }
      });
      
      console.log(`✅ Imported/updated product: ${p.name}`);
    }
    
    console.log(`✅ Imported/updated ${rows.length} parts into Supabase`);
  } catch (error) {
    console.error("Error importing products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importProducts(); 