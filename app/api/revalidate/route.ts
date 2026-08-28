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

/**
 * Which paths to rebuild when a document type changes.
 *
 * The homepage renders logos, past-event photos and testimonials, so any of
 * those three invalidate it. `upcomingPost` has no display yet — it is listed
 * with an empty path set deliberately, so that adding one later is a one-line
 * change rather than a debugging session.
 */
const PATHS_BY_TYPE: Record<string, string[]> = {
  logo: ['/'],
  pastEvent: ['/'],
  testimonial: ['/'],
  upcomingPost: [],
  member: ['/members'],
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

    const paths = body._type ? PATHS_BY_TYPE[body._type] : undefined;

    if (!paths) {
      return NextResponse.json(
        { message: `No revalidation configured for type "${body._type}"` },
        { status: 200 }
      );
    }

    for (const path of paths) {
      await revalidatePath(path);
    }

    return NextResponse.json(
      {
        revalidated: paths.length > 0,
        paths,
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
