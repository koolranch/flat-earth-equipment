import { prisma } from "../lib/prisma.js";

async function main() {
  const parts = await prisma.part.findMany();
  console.log(`✅ Found ${parts.length} parts`);
}

main().catch(console.error); 