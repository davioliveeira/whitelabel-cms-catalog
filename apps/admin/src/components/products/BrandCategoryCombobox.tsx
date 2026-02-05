// =============================================================================
// Brand/Category Combobox Component
// =============================================================================
// Searchable combobox with autocomplete for brand and category fields
// Allows selecting from existing values or typing new ones
// =============================================================================

'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// =============================================================================
// Types
// =============================================================================

export interface ComboboxProps {
  /** Current value */
  value?: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Type of combobox (brand or category) */
  type: 'brand' | 'category';
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
}

// =============================================================================
// Combobox Component
// =============================================================================

export function BrandCategoryCombobox({
  value = '',
  onValueChange,
  type,
  placeholder = `Select ${type}...`,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Fetch existing brands/categories from products
  const { data: products } = useQuery({
    queryKey: ['products', 'all-for-autocomplete'],
    queryFn: async () => {
      const response = await fetch('/api/products?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      return result.products || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once to avoid flooding
  });

  // Extract unique brands or categories
  const options = React.useMemo(() => {
    if (!products) return [];

    const values = products
      .map((p: any) => p[type])
      .filter((v: any) => v && typeof v === 'string' && v.trim() !== '');

    // Get unique values
    const uniqueValues = Array.from(new Set<string>(values));

    return uniqueValues.map((v) => ({
      value: v,
      label: v,
    }));
  }, [products, type]);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  // Check if search term is a new value (not in existing options)
  const isNewValue =
    search &&
    search.trim() !== '' &&
    !options.some((opt) => opt.value.toLowerCase() === search.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${type}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredOptions.length === 0 && !isNewValue && (
              <CommandEmpty>
                {search ? `No ${type} found. Type to add new.` : `No ${type} available.`}
              </CommandEmpty>
            )}

            {/* Show existing options */}
            {filteredOptions.length > 0 && (
              <CommandGroup heading={`Existing ${type}s`}>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Show option to add new value */}
            {isNewValue && (
              <CommandGroup heading="Add new">
                <CommandItem
                  value={search}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Create "{search}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
