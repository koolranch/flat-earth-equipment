import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

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
      console.error(`   Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
}

async function saveArticleAsMDX(article: any) {
  // Use Outrank's SEO-optimized tags/keywords
  const keywords = article.tags || [];
  
  // Format the date (YYYY-MM-DD)
  const publishDate = article.created_at 
    ? new Date(article.created_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Escape single quotes in strings for YAML frontmatter
  const escapeYaml = (str: string) => str.replace(/'/g, "''");
  
  // Use Outrank's SEO-optimized meta_description (already optimized for search engines)
  const description = article.meta_description || article.title;
  
  // Ensure description is within SEO best practices (150-160 chars)
  const seoDescription = description.length > 160 
    ? description.substring(0, 157) + '...'
    : description;

  // Create MDX frontmatter with Outrank's SEO data
  const frontmatter = `---
title: '${escapeYaml(article.title)}'
description: '${escapeYaml(seoDescription)}'
slug: ${article.slug}
date: '${publishDate}'
keywords: ${JSON.stringify(keywords)}
${article.image_url ? `image: '${article.image_url}'` : ''}
---
`;

  // Use HTML content from Outrank (more reliable than markdown for MDX parsing)
  // Outrank's markdown sometimes has syntax that breaks next-mdx-remote
  const content = article.content_html || article.content_markdown || '';
  
  // Combine frontmatter + content
  const mdxContent = frontmatter + '\n' + content;

  // Save to GitHub via API (Vercel filesystem is read-only)
  await saveToGitHub(article.slug, mdxContent);

  console.log(`📝 Article saved to GitHub: ${article.slug}.mdx`);
  console.log(`   Title: ${article.title}`);
  console.log(`   Description: ${seoDescription.substring(0, 80)}...`);
  console.log(`   Keywords: ${keywords.join(', ')}`);
  console.log(`   Image: ${article.image_url ? 'Yes' : 'No'}`);
}

function sanitizeMarkdownForMDX(content: string): string {
  // Fix common MDX parsing issues from Outrank content
  
  // 1. Escape curly braces that aren't part of JSX
  content = content.replace(/\{(?![a-zA-Z\s])/g, '\\{');
  content = content.replace(/(?<![a-zA-Z\s])\}/g, '\\}');
  
  // 2. Fix markdown tables - ensure proper spacing
  content = content.replace(/\n\|/g, '\n\n|');
  content = content.replace(/\|\n/g, '|\n\n');
  
  // 3. Ensure code blocks are properly closed
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    content += '\n```'; // Close unclosed code block
  }
  
  return content;
}

async function saveToGitHub(slug: string, content: string) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = 'koolranch/flat-earth-equipment';
  const filePath = `content/insights/${slug}.mdx`;
  
  console.log(`🔑 GitHub token present: ${!!githubToken}`);
  console.log(`📁 Target file: ${filePath}`);
  
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN environment variable not set');
  }

  // Check if file already exists (to get SHA for update)
  let sha: string | undefined;
  try {
    const checkResponse = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (checkResponse.ok) {
      const data: any = await checkResponse.json();
      sha = data.sha as string;
      console.log(`   Updating existing article (SHA: ${sha.substring(0, 7)})`);
    }
  } catch (error) {
    console.log(`   Creating new article`);
  }

  // Create or update file via GitHub API
  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add/Update article: ${slug}`,
        content: Buffer.from(content).toString('base64'),
        ...(sha && { sha }), // Required for updates, omitted for new files
        branch: 'main',
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ GitHub API Error:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`   ✅ Committed to GitHub: ${result.commit.sha.substring(0, 7)}`);
  console.log(`   🚀 Vercel will auto-deploy in ~1-3 minutes`);
}

