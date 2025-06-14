import crisp from "../lib/crisp/client";
import { marked } from "marked";

const WEBSITE_ID = process.env.CRISP_WEBSITE_ID!;
const LOCALE = "en";

// ------------- diagnostic: list existing categories -------------
async function listEverything() {
  const catsRes = await crisp.website.kb.categories.list(WEBSITE_ID, 1, 50);
  console.log("\n=== Categories ===");
  console.table(catsRes.data.map((c: any) => ({
    id: c.id, name: c.name, locale: c.locale, articles: c.articles
  })));

  for (const cat of catsRes.data) {
    const artsRes = await crisp.website.kb.articles.list(
      WEBSITE_ID, 1, 100, { category_id: cat.id }
    );
    console.log(`\n--- Articles in ${cat.name} ---`);
    console.table(artsRes.data.map((a: any) => ({
      id: a.id, title: a.title, slug: a.slug, draft: a.draft
    })));
  }
}

// ------------- create test category & article -------------
async function createTest() {
  const { data: testCat } = await crisp.website.kb.categories.create(WEBSITE_ID, {
    name: "KB Test",
    locale: LOCALE,
    order: 99,
    parent_id: null
  });

  await crisp.website.kb.articles.create(WEBSITE_ID, {
    category_id: testCat.id,
    locale: LOCALE,
    title: "Is this thing on?",
    slug: "is-this-thing-on",
    description: "Simple visibility test article.",
    keywords: ["test", "kb"],
    content: marked.parse(`
### Hello!

If you can read this inside your Crisp Knowledge Base, the API is working and your plan supports KB articles.
`),
    order: 0,
    draft: false
  });

  console.log("\n✅ Created category & article. Check Crisp UI now.");
}

(async () => {
  try {
    await listEverything();
    await createTest();
    process.exit(0);
  } catch (e) {
    console.error("❌ Error:", e);
    process.exit(1);
  }
})(); 