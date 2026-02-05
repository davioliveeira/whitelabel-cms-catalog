// =============================================================================
// Date Range Picker Component
// =============================================================================
// Calendar-based date range picker with preset options for analytics filtering
// =============================================================================

'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DateRangeValue {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (dateRange: DateRangeValue) => void;
  className?: string;
}

const PRESETS = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 7)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: 'Last 90 days',
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 90)),
      end: endOfDay(new Date()),
    }),
  },
] as const;

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dateRange.start,
    to: dateRange.end,
  });

  // Update internal state when prop changes
  React.useEffect(() => {
    setDate({
      from: dateRange.start,
      to: dateRange.end,
    });
  }, [dateRange.start, dateRange.end]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onDateRangeChange({
        start: startOfDay(range.from),
        end: endOfDay(range.to),
      });
    }
  };

  const handlePresetClick = (preset: typeof PRESETS[number]) => {
    const newRange = preset.getValue();
    setDate({
      from: newRange.start,
      to: newRange.end,
    });
    onDateRangeChange(newRange);
  };

  // Check if current date range matches a preset
  const getActivePreset = () => {
    const currentStart = dateRange.start.getTime();
    const currentEnd = dateRange.end.getTime();

    return PRESETS.find((preset) => {
      const presetRange = preset.getValue();
      const timeDiff = 5 * 60 * 1000; // 5 minutes tolerance for "now"
      return (
        Math.abs(presetRange.start.getTime() - currentStart) < timeDiff &&
        Math.abs(presetRange.end.getTime() - currentEnd) < timeDiff
      );
    });
  };

  const activePreset = getActivePreset();

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            {/* Preset buttons */}
            {/* Preset buttons */}
            <div className="flex flex-col gap-2 border-r p-4 w-[160px] bg-muted/30">
              <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                Período
              </div>
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant={activePreset?.label === preset.label ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "justify-start font-medium w-full",
                    activePreset?.label === preset.label 
                      ? "shadow-md" 
                      : "hover:bg-background hover:shadow-sm"
                  )}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
