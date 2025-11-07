import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.OUTRANK_WEBHOOK_TOKEN;
    
    if (!accessToken) {
      console.error('OUTRANK_WEBHOOK_TOKEN not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'Webhook not configured',
          message: 'OUTRANK_WEBHOOK_TOKEN environment variable is missing'
        },
        { status: 500 }
      );
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('x-outrank-signature') || '';

    console.log('Webhook received:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      signatureLength: signature.length
    });

    // Verify the webhook signature if present
    if (signature) {
      try {
        if (!verifyWebhookSignature(body, signature, accessToken)) {
          console.error('Invalid webhook signature');
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          );
        }
      } catch (verifyError) {
        console.error('Signature verification error:', verifyError);
        return NextResponse.json(
          { error: 'Signature verification failed' },
          { status: 401 }
        );
      }
    } else {
      console.warn('No signature provided - this may be a test webhook');
    }

    // Parse the payload
    const payload = JSON.parse(body);
    const { event_type, timestamp, data } = payload;

    console.log('Received Outrank webhook:', {
      event_type,
      timestamp,
      article_count: data?.articles?.length || 0
    });

    // Handle different event types
    switch (event_type) {
      case 'publish_articles':
        await handlePublishArticles(data);
        break;
      
      default:
        console.warn(`Unknown event type: ${event_type}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

async function handlePublishArticles(data: any) {
  const articles = data?.articles || [];
  
  console.log(`Processing ${articles.length} published articles`);
  
  for (const article of articles) {
    console.log('Article published:', {
      id: article.id,
      title: article.title,
      slug: article.slug,
      created_at: article.created_at
    });

    try {
      // Save article as MDX file
      await saveArticleAsMDX(article);
      console.log(`✅ Saved article: ${article.slug}`);
    } catch (error) {
      console.error(`❌ Error saving article ${article.slug}:`, error);
    }
  }
}

async function saveArticleAsMDX(article: any) {
  const insightsDir = path.join(process.cwd(), 'content', 'insights');
  
  // Ensure directory exists
  if (!fs.existsSync(insightsDir)) {
    fs.mkdirSync(insightsDir, { recursive: true });
  }

  // Determine keywords/tags for categorization
  const keywords = article.tags || [];
  
  // Format the date (YYYY-MM-DD)
  const publishDate = article.created_at 
    ? new Date(article.created_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Create MDX frontmatter
  const frontmatter = `---
title: '${article.title.replace(/'/g, "''")}'
description: '${(article.meta_description || article.title).replace(/'/g, "''")}'
slug: ${article.slug}
date: '${publishDate}'
keywords: ${JSON.stringify(keywords)}
${article.image_url ? `image: '${article.image_url}'` : ''}
---
`;

  // Use markdown content from Outrank
  const content = article.content_markdown || article.content_html || '';
  
  // Combine frontmatter + content
  const mdxContent = frontmatter + '\n' + content;

  // Save to file
  const filePath = path.join(insightsDir, `${article.slug}.mdx`);
  fs.writeFileSync(filePath, mdxContent, 'utf8');

  console.log(`📝 Article saved to: ${filePath}`);
  
  // Trigger revalidation of insights pages
  try {
    revalidatePath('/insights');
    revalidatePath(`/insights/${article.slug}`);
    console.log('🔄 Revalidated insights pages');
  } catch (revalidateError) {
    console.warn('⚠️ Could not trigger revalidation:', revalidateError);
  }
}

