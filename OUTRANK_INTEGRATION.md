# Outrank Webhook Integration

Automated article publishing from Outrank to Flat Earth Equipment Insights.

## Overview

When Outrank publishes articles, they're automatically saved as MDX files and appear on `https://flatearthequipment.com/insights`.

## How It Works

### 1. Outrank Configuration
- **Webhook Name**: FEE Production
- **Endpoint**: `https://flatearthequipment.com/api/webhooks/outrank`
- **Token**: Stored in `OUTRANK_WEBHOOK_TOKEN` environment variable

### 2. Article Publishing Flow
1. Outrank publishes an article
2. Sends POST request to webhook endpoint
3. Webhook verifies HMAC signature
4. Saves article as MDX file in `content/insights/`
5. Triggers page revalidation
6. Article appears on insights page immediately

### 3. Article Structure

Articles are saved with the following frontmatter:
```yaml
---
title: 'Article Title'
description: 'SEO meta description'
slug: article-slug
date: '2025-11-07'
keywords: ["forklift", "safety", "training"]
image: 'https://example.com/image.jpg'
---
```

### 4. Automatic Categorization

Articles are automatically categorized based on keywords and title content:

- **Forklift Parts**: Contains "forklift" in title or keywords
- **Battery Chargers**: Contains "charger" or "battery"
- **Maintenance**: Contains "maintenance" or "repair"
- **Safety**: Contains "safety" in title or keywords

### 5. Featured Articles

- Featured articles = **3 most recent** posts (by date)
- New articles automatically become featured if they're among the 3 newest
- No manual "featured" flag needed

### 6. SEO Optimization

Each article automatically gets:
- ✅ Proper meta title and description
- ✅ Schema.org markup
- ✅ Optimized URL structure (`/insights/slug`)
- ✅ Tags/keywords for categorization
- ✅ Featured images (if provided by Outrank)

## Testing

To test the webhook:
1. Go to Outrank dashboard → Integrations → Webhooks
2. Click "Test Webhook"
3. Check Vercel logs for confirmation
4. Visit `/insights` to see the article

## Logs

View webhook activity in Vercel:
- **Vercel Dashboard** → Your Project → **Logs**
- Filter by: `/api/webhooks/outrank`

Look for:
- ✅ `Article published: { id, title, slug }`
- ✅ `Saved article: slug-name`
- ✅ `Revalidated insights pages`

## Environment Variables

Required in Vercel:
```
OUTRANK_WEBHOOK_TOKEN=aa0f61d5d7749bc8862d5cfffc90d196461e2aa071b8f206c1a375a668ee0a6c
```

## File Locations

- **Webhook Code**: `app/api/webhooks/outrank/route.ts`
- **Articles**: `content/insights/*.mdx`
- **Insights Page**: `app/insights/page.tsx`
- **Article Template**: `app/insights/[slug]/page.tsx`

## Troubleshooting

### Webhook Returns 500 Error
- Check that `OUTRANK_WEBHOOK_TOKEN` is set in Vercel
- Redeploy after adding environment variable

### Article Not Appearing
- Check Vercel logs for save confirmation
- Verify MDX file exists in `content/insights/`
- Wait ~30 seconds for revalidation
- Hard refresh browser (Cmd+Shift+R)

### Wrong Category
- Add relevant keywords to article in Outrank
- Keywords trigger auto-categorization
- Update keywords in MDX frontmatter manually if needed

## Manual Article Management

To edit an article:
1. Find the MDX file in `content/insights/`
2. Edit frontmatter or content
3. Commit and push to trigger deployment
4. Page automatically revalidates

To delete an article:
1. Delete the MDX file
2. Commit and push
3. Article removed on next deployment

