import crisp from "../lib/crisp/client.js";
import { marked } from "marked";
import slugify from "slugify";

const WEBSITE_ID = process.env.CRISP_WEBSITE_ID!;
const CATEGORY_NAME = "Forklift Training Help";
const CATEGORY_LOCALE = "en";
const CATEGORY_ORDER = 1;

const articles = [
  {
    title: "How do I access my Forklift Certification course?",
    markdown: `
**Who's this for?**  
Anyone who has purchased the Forklift Operator Certification and wants to begin or resume their course.

### Steps to Access
1. Go to your Training Dashboard: <https://flatearthequipment.com/app/safety>
2. Log in using the email you used at checkout.
3. Click **"Forklift Operator Certification"**.
4. Pick up right where you left off — your progress is saved automatically.

### Mobile Access  
✅ Fully mobile-friendly.

### Trouble Logging In?
- Double-check your email
- Reset your password: <https://flatearthequipment.com/reset-password>
- Or email **support@flatearthequipment.com**
`
  },
  {
    title: "How do I download or email my forklift certificate?",
    markdown: `
**Who's this for?**  
Trainees who completed the course or supervisors needing proof of certification.

### Download your certificate
1. Open your Training Dashboard.
2. Click **"Download Certificate"** under your completed course.
3. The PDF opens for print or save.

### Email it to a supervisor
1. Click **"📤 Email to Supervisor"**
2. Enter their name & email.
3. Certificate *and* evaluation PDF go straight to their inbox.

Need to fix your name? Update it in **Edit Profile** and download again.
`
  },
  {
    title: "Can I buy forklift training for my team?",
    markdown: `
**Who's this for?**  
Fleet managers, safety directors, or anyone buying training for multiple operators.

### Group pricing
| Pack | Price |
|------|-------|
| 1 trainee | $59 |
| 5 trainees | $275 |
| 25 trainees | $1,375 |
| Unlimited / yr | $1,999 |

### How it works
1. Visit our Training Page.
2. Choose a pack & checkout.
3. You'll receive access links to distribute.

Email **training@flatearthequipment.com** to activate your supervisor dashboard.
`
  }
];

async function ensureCategory(): Promise<string> {
  // Try to find existing category
  const { data: list } = await crisp.website.kb.categories.list(WEBSITE_ID, 1, 50);
  const found = list.find((c: any) => c.name === CATEGORY_NAME && c.locale === CATEGORY_LOCALE);
  if (found) return found.id;

  // Otherwise create
  const { data: category } = await crisp.website.kb.categories.create(WEBSITE_ID, {
    name: CATEGORY_NAME,
    locale: CATEGORY_LOCALE,
    order: CATEGORY_ORDER,
    parent_id: null
  });
  return category.id;
}

async function upsertArticle(categoryId: string, art: {title:string; markdown:string}) {
  const html = marked.parse(art.markdown.trim());
  const slug = slugify(art.title, { lower: true, strict: true });

  // Check if article already exists (by slug)
  const { data: list } = await crisp.website.kb.articles.list(WEBSITE_ID, 1, 100, { category_id: categoryId });
  const existing = list.find((a: any) => a.slug === slug);

  if (existing) {
    await crisp.website.kb.articles.update(WEBSITE_ID, existing.id, {
      title: art.title,
      slug,
      content: html,
      description: art.title,
      keywords: art.title.toLowerCase().split(" "),
      order: existing.order,
      locale: CATEGORY_LOCALE,
      draft: false
    });
    return { action: "updated", id: existing.id };
  } else {
    const { data: created } = await crisp.website.kb.articles.create(WEBSITE_ID, {
      title: art.title,
      slug,
      content: html,
      description: art.title,
      keywords: art.title.toLowerCase().split(" "),
      category_id: categoryId,
      locale: CATEGORY_LOCALE,
      order: 0,
      draft: false
    });
    return { action: "created", id: created.id };
  }
}

(async () => {
  try {
    const categoryId = await ensureCategory();
    const results = [];
    for (const art of articles) results.push(await upsertArticle(categoryId, art));
    console.log("KB sync complete:", results);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})(); 