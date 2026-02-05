// =============================================================================
// Analytics API Route
// =============================================================================
// POST /api/analytics - Record analytics events (view, whatsapp_click)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { recordEvent, RecordEventInput } from '@cms/shared';

// =============================================================================
// Types
// =============================================================================

interface RequestBody {
  tenantId: string;
  productId: string;
  eventType: 'view' | 'whatsapp_click';
  userAgent?: string;
  referrer?: string;
}

// =============================================================================
// POST /api/analytics
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await request.json();

    // Validate required fields
    if (!body.tenantId || !body.productId || !body.eventType) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'tenantId, productId, and eventType are required',
        },
        { status: 400 }
      );
    }

    // Validate event type
    if (body.eventType !== 'view' && body.eventType !== 'whatsapp_click') {
      return NextResponse.json(
        {
          error: 'Invalid event type',
          message: 'eventType must be "view" or "whatsapp_click"',
        },
        { status: 400 }
      );
    }

    // Extract user agent and referrer from headers if not provided
    const userAgent = body.userAgent || request.headers.get('user-agent') || undefined;
    const referrer = body.referrer || request.headers.get('referer') || undefined;

    // Record event using analytics service
    const eventData: RecordEventInput = {
      tenantId: body.tenantId,
      productId: body.productId,
      eventType: body.eventType,
      userAgent,
      referrer,
    };

    const event = await recordEvent(eventData);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: event.id,
          eventType: event.eventType,
          createdAt: event.createdAt,
        },
      },
      {
        status: 201,
        headers: {
          // CORS headers for public catalog
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      // Tenant or product not found
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            error: 'Resource not found',
            message: error.message,
          },
          { status: 404 }
        );
      }

      // Validation errors
      if (error.message.includes('required') || error.message.includes('must be')) {
        return NextResponse.json(
          {
            error: 'Validation error',
            message: error.message,
          },
          { status: 400 }
        );
      }
    }

    // Generic error response (don't expose internal details)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to record analytics event',
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// OPTIONS /api/analytics (CORS preflight)
// =============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
