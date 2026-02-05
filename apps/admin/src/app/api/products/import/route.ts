// =============================================================================
// Product Import API Endpoint
// =============================================================================
// POST /api/products/import
// Handles bulk product imports from CSV/Excel files
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ProductCreateSchema } from '@cms/shared';
import { createProduct } from '@cms/shared';
import { parseProductFile, normalizeRow } from '@/lib/csv-parser';

// =============================================================================
// Constants
// =============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const LARGE_FILE_THRESHOLD = 100; // rows

// =============================================================================
// Types
// =============================================================================

interface ImportError {
  row: number;
  data: Record<string, unknown>;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportError[];
  totalRows: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((err) => {
    const field = err.path.join('.');
    return `${field}: ${err.message}`;
  });
}

// =============================================================================
// Route Handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get tenant ID from header (set by middleware)
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Tenant ID not found',
        },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          error: 'No file provided',
          message: 'Please upload a CSV or Excel file',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          message: 'Maximum file size is 10MB',
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size,
        },
        { status: 400 }
      );
    }

    // Parse file
    let parseResult;
    try {
      parseResult = await parseProductFile(file);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid file format',
          message: error instanceof Error ? error.message : 'Failed to parse file',
        },
        { status: 400 }
      );
    }

    const { rows, totalRows } = parseResult;

    if (totalRows === 0) {
      return NextResponse.json(
        {
          error: 'Empty file',
          message: 'The uploaded file contains no data rows',
        },
        { status: 400 }
      );
    }

    // Check if we should process in background
    // For MVP, we'll process synchronously even for large files
    // In production, use background queue for files > LARGE_FILE_THRESHOLD
    if (totalRows > LARGE_FILE_THRESHOLD) {
      console.warn(
        `Large file detected (${totalRows} rows). Consider implementing background processing.`
      );
    }

    // Process rows
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
      totalRows,
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 for header row and 1-indexed

      try {
        // Normalize row data
        const normalizedRow = normalizeRow(row);

        // Validate with Zod schema
        const validData = ProductCreateSchema.parse(normalizedRow);

        // Create product
        await createProduct(tenantId, validData);
        result.imported++;
      } catch (error) {
        result.failed++;

        // Handle validation errors
        if (error instanceof ZodError) {
          result.errors.push({
            row: rowNumber,
            data: row as unknown as Record<string, unknown>,
            errors: formatZodErrors(error),
          });
        } else {
          // Handle other errors (DB, etc.)
          result.errors.push({
            row: rowNumber,
            data: row as unknown as Record<string, unknown>,
            errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
          });
        }
      }
    }

    // Return results
    return NextResponse.json(
      {
        success: true,
        imported: result.imported,
        failed: result.failed,
        totalRows: result.totalRows,
        errors: result.errors,
        message: `Successfully imported ${result.imported} of ${result.totalRows} products`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: 'Import failed',
        message: 'An unexpected error occurred during import',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
