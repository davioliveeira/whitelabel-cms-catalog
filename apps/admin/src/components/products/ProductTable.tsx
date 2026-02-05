// =============================================================================
// Product Table Component
// =============================================================================
// Displays products in a table with selection, actions, and bulk operations
// =============================================================================

'use client';

import * as React from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BulkActions } from './BulkActions';
import type { ProductPublicData } from '@cms/shared';

// =============================================================================
// Types
// =============================================================================

interface ProductTableProps {
  products: ProductPublicData[];
  onRefetch: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function ProductTable({ products, onRefetch }: ProductTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deleteProductId, setDeleteProductId] = React.useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);

  // Toggle single product selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle all products selection
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  // Handle bulk availability update
  const handleBulkUpdate = async (isAvailable: boolean) => {
    try {
      setIsBulkUpdating(true);

      const response = await fetch('/api/products/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedIds,
          isAvailable,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bulk update failed');
      }

      const data = await response.json();
      toast.success(`Updated ${data.updated} product(s) successfully`);
      setSelectedIds([]);
      onRefetch();
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update products');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Handle delete product
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }

      toast.success('Product deleted successfully');
      setDeleteProductId(null);
      onRefetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  // Format price to Brazilian Real
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const allSelected = selectedIds.length === products.length && products.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActions
          count={selectedIds.length}
          onSetAvailable={() => handleBulkUpdate(true)}
          onSetUnavailable={() => handleBulkUpdate(false)}
          onCancel={() => setSelectedIds([])}
          isLoading={isBulkUpdating}
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all products"
                  className={someSelected ? 'data-[state=checked]:bg-slate-400' : ''}
                />
              </TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                {/* Checkbox */}
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(product.id)}
                    onCheckedChange={() => toggleSelection(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </TableCell>

                {/* Image */}
                <TableCell>
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-slate-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Name */}
                <TableCell className="font-medium">{product.name}</TableCell>

                {/* Brand */}
                <TableCell className="text-slate-600">
                  {product.brand || '—'}
                </TableCell>

                {/* Price */}
                <TableCell>{formatPrice(product.salePrice)}</TableCell>

                {/* Availability */}
                <TableCell>
                  {product.isAvailable ? (
                    <Badge variant="default" className="bg-green-600">
                      Disponível
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Indisponível</Badge>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/products/${product.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteProductId(product.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDelete(deleteProductId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
