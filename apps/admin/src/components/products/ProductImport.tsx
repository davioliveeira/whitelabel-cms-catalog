// =============================================================================
// Product Import Component
// =============================================================================
// Bulk import products from CSV/Excel files
// Features: Template download, file upload, progress tracking, error reporting
// =============================================================================

'use client';

import * as React from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  totalRows: number;
  errors: ImportError[];
  message?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ProductImport() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();

    // Validate file type
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      toast.error('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
    setResult(null); // Clear previous results
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    handleFileChange(e.dataTransfer.files);
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/products/import/template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products-import-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!file) return;

    try {
      setIsImporting(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Import failed');
        return;
      }

      setResult(data);

      if (data.failed === 0) {
        toast.success(`Successfully imported ${data.imported} products`);
      } else {
        toast.warning(
          `Imported ${data.imported} products. ${data.failed} rows failed.`
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('An unexpected error occurred during import');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Products</CardTitle>
          <CardDescription>
            Import multiple products at once from a CSV or Excel file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Template Button */}
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-slate-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Step 1: Download Template</p>
              <p className="text-xs text-slate-500">
                Get the CSV template with required columns
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload Area */}
          <div className="flex items-start gap-2">
            <Upload className="h-5 w-5 text-slate-500 mt-1" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium">Step 2: Upload File</p>
                <p className="text-xs text-slate-500">
                  Fill the template and upload your CSV or Excel file
                </p>
              </div>

              {!file ? (
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors',
                    isDragging
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-300 hover:border-slate-400'
                  )}
                >
                  <FileSpreadsheet className="h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {isDragging
                      ? 'Drop file here'
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-500">
                    CSV or Excel (.csv, .xlsx, .xls) - Max 10MB
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileChange(e.target.files)}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-4">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    disabled={isImporting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Import Button */}
          {file && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? 'Importing...' : 'Import Products'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <Alert variant={result.failed === 0 ? 'default' : 'destructive'}>
            {result.failed === 0 ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>Import Complete</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <strong>{result.imported}</strong> of{' '}
                  <strong>{result.totalRows}</strong> products imported
                  successfully
                </p>
                {result.failed > 0 && (
                  <p className="text-red-600">
                    <strong>{result.failed}</strong> rows failed validation
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Error Table */}
          {result.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Import Errors</CardTitle>
                <CardDescription>
                  The following rows could not be imported
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Row</TableHead>
                        <TableHead>Errors</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {error.row}
                          </TableCell>
                          <TableCell>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {error.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {JSON.stringify(error.data).substring(0, 100)}
                              {JSON.stringify(error.data).length > 100 && '...'}
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
