import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

// Type for webhook body from Sanity
type WebhookBody = {
  _type?: string;
  slug?: {
    current?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    // Parse and validate webhook signature
    const { isValidSignature, body } = await parseBody<WebhookBody>(
      req,
      process.env.SANITY_WEBHOOK_SECRET
    );

    // Reject invalid signatures for security
    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check if body exists and has required fields
    if (!body) {
      return NextResponse.json(
        { message: 'No body received' },
        { status: 400 }
      );
    }

    // Only revalidate for blogPost document types
    if (body._type !== 'blogPost') {
      return NextResponse.json(
        { message: 'No revalidation needed' },
        { status: 200 }
      );
    }

    // Revalidate blog listing page (always)
    await revalidatePath('/blog');

    // Revalidate specific post detail page if slug exists
    if (body.slug?.current) {
      await revalidatePath(`/blog/${body.slug.current}`);
    }

    return NextResponse.json(
      {
        revalidated: true,
        now: Date.now(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { message: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
