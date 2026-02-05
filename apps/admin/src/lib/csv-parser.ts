// =============================================================================
// CSV/Excel Parser Utility
// =============================================================================
// Handles parsing of CSV and Excel files for product imports
// Validates file format and extracts rows
// =============================================================================

import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

// =============================================================================
// Types
// =============================================================================

export interface ParsedRow {
  name: string;
  brand?: string;
  category?: string;
  originalPrice?: string;
  salePrice: string;
  imageUrl?: string;
  isAvailable?: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  totalRows: number;
}

// =============================================================================
// File Type Detection
// =============================================================================

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isSupportedFileType(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['csv', 'xlsx', 'xls'].includes(ext);
}

// =============================================================================
// CSV Parsing
// =============================================================================

export function parseCSV(fileContent: string): ParseResult {
  try {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
    }) as ParsedRow[];

    return {
      rows: records,
      totalRows: records.length,
    };
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// =============================================================================
// Excel Parsing
// =============================================================================

export function parseExcel(fileBuffer: Buffer): ParseResult {
  try {
    // Read workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Excel file has no sheets');
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with headers
    const rows = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, {
      raw: false, // Convert all values to strings
      defval: '', // Default value for empty cells
    });

    return {
      rows,
      totalRows: rows.length,
    };
  } catch (error) {
    throw new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// =============================================================================
// Main Parser Function
// =============================================================================

export async function parseProductFile(file: File): Promise<ParseResult> {
  const filename = file.name;

  // Check file type
  if (!isSupportedFileType(filename)) {
    throw new Error('Unsupported file format. Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
  }

  const ext = getFileExtension(filename);

  if (ext === 'csv') {
    // Parse CSV
    const text = await file.text();
    return parseCSV(text);
  } else {
    // Parse Excel
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return parseExcel(buffer);
  }
}

// =============================================================================
// Row Normalization
// =============================================================================

/**
 * Normalizes a parsed row to ensure consistent data types
 */
export function normalizeRow(row: ParsedRow): {
  name: string;
  brand?: string;
  category?: string;
  originalPrice?: number;
  salePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
} {
  return {
    name: row.name?.trim() || '',
    brand: row.brand?.trim() || undefined,
    category: row.category?.trim() || undefined,
    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
    salePrice: parseFloat(row.salePrice || '0'),
    imageUrl: row.imageUrl?.trim() || undefined,
    isAvailable: row.isAvailable?.toLowerCase() === 'false' ? false : true,
  };
}
