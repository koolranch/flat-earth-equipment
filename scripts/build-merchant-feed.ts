import { writeFileSync } from "fs";
import { prisma } from "../lib/prisma.js";

type Part = {
  id: string;
  name: string;
  slug: string;
  price_cents: number | null;
  image_url: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
  in_stock: boolean | null;
};

async function buildFeed() {
  const parts = await prisma.part.findMany();

  const feed = parts.map((p: Part) => ({
    id: p.id,
    title: p.name,
    description: p.description,
    link: `https://flatearthequipment.com/parts/${p.slug}`,
    image_link: `https://flatearthequipment.com/images/parts/${p.slug}.jpg`,
    price: `${p.price.toFixed(2)} USD`,
    brand: p.brand,
    condition: "new",
    availability: "in stock",
  }));

  // Ensure the directory exists
  const dir = "public/feed";
  if (!require("fs").existsSync(dir)) {
    require("fs").mkdirSync(dir, { recursive: true });
  }

  writeFileSync("public/feed/google-merchant.json", JSON.stringify(feed, null, 2));
  console.log("✅ Merchant feed built: public/feed/google-merchant.json");
}

buildFeed().catch(console.error); 