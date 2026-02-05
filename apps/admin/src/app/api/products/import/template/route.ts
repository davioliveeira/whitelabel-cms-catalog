// =============================================================================
// Product Import Template API Endpoint
// =============================================================================
// GET /api/products/import/template
// Returns a CSV template file for bulk product imports
// =============================================================================

import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';

// =============================================================================
// Template Data
// =============================================================================

const TEMPLATE_HEADERS = [
  'name',
  'brand',
  'category',
  'originalPrice',
  'salePrice',
  'imageUrl',
  'isAvailable',
];

const TEMPLATE_EXAMPLE_ROW = {
  name: 'Example Product Name',
  brand: 'Example Brand',
  category: 'Example Category',
  originalPrice: '150.00',
  salePrice: '99.90',
  imageUrl: 'https://example.com/image.jpg',
  isAvailable: 'true',
};

// =============================================================================
// Route Handler
// =============================================================================

export async function GET() {
  try {
    // Generate CSV with headers and example row
    const csvData = stringify([TEMPLATE_HEADERS, Object.values(TEMPLATE_EXAMPLE_ROW)]);

    // Return CSV file with proper headers
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products-import-template.csv"',
      },
    });
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate template',
        message: 'An error occurred while generating the template file',
      },
      { status: 500 }
    );
  }
}
