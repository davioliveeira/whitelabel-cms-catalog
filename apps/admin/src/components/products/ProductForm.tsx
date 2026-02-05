// =============================================================================
// Product Form Component
// =============================================================================
// Form for creating and editing products with React Hook Form + Zod validation
// =============================================================================

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductCreateSchema, type ProductCreateInput } from '@cms/shared';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { BrandCategoryCombobox } from './BrandCategoryCombobox';
import { ImageUpload } from './ImageUpload';

// =============================================================================
// Types
// =============================================================================

export interface ProductFormProps {
  /** Product ID for edit mode (undefined for create mode) */
  productId?: string;
  /** Callback when form is successfully submitted */
  onSuccess?: (productId: string) => void;
  /** Callback when user cancels the form */
  onCancel?: () => void;
}

// =============================================================================
// Product Form Component
// =============================================================================

export function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = React.useState(false);
  const isEditMode = !!productId;

  // Initialize form with React Hook Form + Zod validation
  const form = useForm<ProductCreateInput>({
    resolver: zodResolver(ProductCreateSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      category: '',
      originalPrice: undefined,
      salePrice: 0,
      imageUrl: '',
      isAvailable: true,
      stockQuantity: 0,
    } as any,
  });

  // =============================================================================
  // Load product data for edit mode
  // =============================================================================

  React.useEffect(() => {
    if (isEditMode) {
      setIsLoadingProduct(true);
      fetch(`/api/products/${productId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to load product');
          }
          return res.json();
        })
        .then((product) => {
          form.reset({
            name: product.name || '',
            description: product.description || '',
            brand: product.brand || '',
            category: product.category || '',
            originalPrice: product.originalPrice || undefined,
            salePrice: product.salePrice || 0,
            imageUrl: product.imageUrl || '',
            isAvailable: product.isAvailable ?? true,
            stockQuantity: product.stockQuantity || 0,
          });
        })
        .catch((error) => {
          console.error('Error loading product:', error);
          toast.error('Failed to load product data');
        })
        .finally(() => {
          setIsLoadingProduct(false);
        });
    }
  }, [isEditMode, productId, form]);

  // =============================================================================
  // Form submission handler
  // =============================================================================

  const onSubmit = async (data: ProductCreateInput) => {
    try {
      setIsLoading(true);

      const url = isEditMode ? `/api/products/${productId}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} product`);
        return;
      }

      const product = await response.json();

      toast.success(
        isEditMode
          ? 'Product updated successfully!'
          : 'Product created successfully!'
      );

      if (onSuccess) {
        onSuccess(product.id);
      } else {
        // Reset form for create mode
        if (!isEditMode) {
          form.reset();
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // Render
  // =============================================================================

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">Loading product data...</div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Product Information Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Product Information</h3>
            <p className="text-sm text-slate-500">
              Basic details about your product
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Product name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Field */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <BrandCategoryCombobox
                      type="brand"
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder="Select or type brand..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <BrandCategoryCombobox
                      type="category"
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder="Select or type category..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description"
                      className="min-h-[100px] resize-none"
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of your product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Pricing</h3>
            <p className="text-sm text-slate-500">
              Set the prices for your product
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Original Price Field */}
            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Price (De)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseFloat(value));
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Original price before discount (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sale Price Field */}
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price (Por) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Current selling price (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Media</h3>
            <p className="text-sm text-slate-500">
              Add images for your product
            </p>
          </div>

          {/* Image Upload Field */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Upload a product image (JPG, PNG, or WebP, max 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Inventory Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Estoque</h3>
            <p className="text-sm text-slate-500">
              Gerencie a quantidade disponível
            </p>
          </div>

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem className="max-w-[50%]">
                <FormLabel>Quantidade em Estoque</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? 0 : parseInt(value));
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Quantidade atual do produto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Availability Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Availability</h3>
            <p className="text-sm text-slate-500">
              Manage product availability status
            </p>
          </div>

          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Product Available
                  </FormLabel>
                  <FormDescription>
                    Show this product in the catalog
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading
              ? 'Saving...'
              : isEditMode
              ? 'Update Product'
              : 'Create Product'}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
