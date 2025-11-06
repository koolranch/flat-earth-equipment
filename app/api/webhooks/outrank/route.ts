import { NextRequest, NextResponse } from 'next/server';
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

    // TODO: Implement your article processing logic here
    // For example:
    // - Save to database
    // - Generate pages
    // - Send notifications
    // - Trigger revalidation
    
    // Example: You might want to save to Supabase
    // const supabase = supabaseServer();
    // await supabase.from('articles').insert({
    //   outrank_id: article.id,
    //   title: article.title,
    //   slug: article.slug,
    //   content_html: article.content_html,
    //   content_markdown: article.content_markdown,
    //   meta_description: article.meta_description,
    //   image_url: article.image_url,
    //   tags: article.tags,
    //   created_at: article.created_at
    // });
  }
}

