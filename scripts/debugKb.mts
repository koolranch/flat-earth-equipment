import crisp from "../lib/crisp/client.ts";
import { marked } from "marked";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID!;
const LOCALE = "en";

// ------------- diagnostic: check environment and API structure -------------
async function checkBasics() {
  console.log("=== Environment Check ===");
  console.log("NEXT_PUBLIC_CRISP_WEBSITE_ID:", WEBSITE_ID ? "✅ Set" : "❌ Missing");
  console.log("CRISP_TOKEN_IDENTIFIER:", process.env.CRISP_TOKEN_IDENTIFIER ? "✅ Set" : "❌ Missing");
  console.log("CRISP_TOKEN_KEY:", process.env.CRISP_TOKEN_KEY ? "✅ Set" : "❌ Missing");
  
  console.log("\n=== Crisp Object Structure ===");
  console.log("crisp:", typeof crisp);
  console.log("crisp.website:", typeof crisp.website);
  console.log("crisp.website.kb:", typeof crisp.website?.kb);
  console.log("crisp.website.helpdesk:", typeof crisp.website?.helpdesk);
  console.log("crisp.website.helpdesk.articles:", typeof crisp.website?.helpdesk?.articles);
  
  if (!WEBSITE_ID) {
    throw new Error("NEXT_PUBLIC_CRISP_WEBSITE_ID environment variable is not set");
  }
  
  // Test basic authentication first
  console.log("\n=== Testing Authentication ===");
  try {
    const testCall = await crisp.website.conversations.list(WEBSITE_ID, 1);
    console.log("✅ Basic API authentication working");
  } catch (apiError: any) {
    console.log("❌ API authentication failed:", apiError.message);
    console.log("\n💡 This usually means:");
    console.log("   • Your Crisp API token is not activated");
    console.log("   • Your token credentials are incorrect");
    console.log("   • Your plan doesn't include API access");
    console.log("   → Go to Crisp Dashboard: Settings → API");
    console.log("   → Activate your API token");
    console.log("   → Make sure your plan supports API access");
    throw apiError;
  }
}

// ------------- diagnostic: list existing helpdesk articles -------------
async function listEverything() {
  try {
    // Try the new helpdesk API structure
    const articlesRes = await crisp.website.helpdesk.articles.list(WEBSITE_ID, 1, 50);
    console.log("\n=== Helpdesk Articles ===");
    console.table(articlesRes.data.map((a: any) => ({
      id: a.id, title: a.title, slug: a.slug, draft: a.draft, locale: a.locale
    })));
  } catch (error) {
    console.error("❌ Error listing helpdesk articles:", error);
    throw error;
  }
}

// ------------- create test helpdesk article -------------
async function createTest() {
  try {
    const testArticle = await crisp.website.helpdesk.articles.create(WEBSITE_ID, {
      locale: LOCALE,
      title: "Is this thing on?",
      slug: "is-this-thing-on",
      description: "Simple visibility test article.",
      keywords: ["test", "helpdesk"],
      content: marked.parse(`
### Hello!

If you can read this inside your Crisp Helpdesk, the API is working and your plan supports helpdesk articles.
`),
      draft: false
    });

    console.log("\n✅ Created test helpdesk article. Check Crisp UI now.");
    console.log("Article ID:", testArticle.data?.id);
  } catch (error) {
    console.error("❌ Error creating test content:", error);
    throw error;
  }
}

(async () => {
  try {
    await checkBasics();
    await listEverything();
    await createTest();
    process.exit(0);
  } catch (e) {
    console.error("❌ Error:", e);
    process.exit(1);
  }
})(); 