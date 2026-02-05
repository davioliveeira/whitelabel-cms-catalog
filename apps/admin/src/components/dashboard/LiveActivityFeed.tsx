// =============================================================================
// Live Activity Feed Component
// =============================================================================
// Real-time feed of product views and WhatsApp clicks
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, Clock } from 'lucide-react';
import { useRecentEvents } from '@/hooks/useAnalytics';
import type { RecentEvent } from '@cms/shared';

interface LiveActivityFeedProps {
  tenantId: string;
}

/**
 * Format relative timestamp ("2 minutes ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function LiveActivityFeed({ tenantId }: LiveActivityFeedProps) {
  // Load live mode state from localStorage
  const [isLiveMode, setIsLiveMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('analytics-live-mode');
      return saved === 'true';
    }
    return false;
  });

  // Persist live mode state
  useEffect(() => {
    localStorage.setItem('analytics-live-mode', String(isLiveMode));
  }, [isLiveMode]);

  // Fetch recent events with conditional polling
  const { data: events = [], isLoading, error, isFetching } = useRecentEvents(
    tenantId,
    isLiveMode,
    20
  );

  // Track previous events to detect new ones for animation
  const [previousEventIds, setPreviousEventIds] = useState<Set<string>>(new Set());
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (events.length > 0) {
      const currentIds = new Set<string>(events.map((e: any) => e.id as string));
      const newIds = new Set<string>();

      // Find truly new events (not in previous set)
      currentIds.forEach((id) => {
        if (!previousEventIds.has(id)) {
          newIds.add(id);
        }
      });

      if (newIds.size > 0) {
        setNewEventIds(newIds);
        // Clear new event highlighting after animation with proper cleanup
        const timeoutId = setTimeout(() => setNewEventIds(new Set()), 2000);

        // Cleanup function to prevent memory leaks and stacked timeouts
        return () => clearTimeout(timeoutId);
      }

      setPreviousEventIds(currentIds);
    }
    // Only depend on events, not previousEventIds to avoid unnecessary re-runs
  }, [events]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Live Activity
              {isFetching && isLiveMode && (
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </CardTitle>
            <CardDescription>Near-realtime product engagement (10s updates)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="live-mode" className="text-sm font-medium cursor-pointer">
              Live Mode
            </label>
            <Switch
              id="live-mode"
              checked={isLiveMode}
              onCheckedChange={setIsLiveMode}
              aria-label="Toggle live activity mode"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="text-center text-muted-foreground py-8">
            <p>Loading activity...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
            <p className="font-semibold">Error loading activity</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Empty State - Live Mode Off */}
        {!isLoading && !error && !isLiveMode && (
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold mb-1">Live Mode is Off</p>
            <p className="text-sm">Enable live mode to see real-time activity</p>
          </div>
        )}

        {/* Empty State - No Events */}
        {!isLoading && !error && isLiveMode && events.length === 0 && (
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
            <p className="font-semibold mb-1">No Activity Yet</p>
            <p className="text-sm">Waiting for customer engagement...</p>
          </div>
        )}

        {/* Event Feed */}
        {!isLoading && !error && isLiveMode && events.length > 0 && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {events.map((event: any) => {
                const isNew = newEventIds.has(event.id);
                const isView = event.eventType === 'VIEW';

                return (
                  <div
                    key={event.id}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border transition-all
                      ${isNew ? 'bg-primary/10 border-primary animate-in fade-in slide-in-from-top-2' : 'bg-muted/50'}
                    `}
                  >
                    {/* Event Icon */}
                    <div className={`p-2 rounded-full ${isView ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {isView ? (
                        <Eye className={`h-4 w-4 ${isView ? 'text-blue-600' : 'text-green-600'}`} />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isView ? 'secondary' : 'default'} className="text-xs">
                          {isView ? 'Viewed' : 'WhatsApp Click'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(new Date(event.createdAt))}
                        </span>
                      </div>
                    </div>

                    {/* Product Thumbnail */}
                    {event.productImageUrl && (
                      <img
                        src={event.productImageUrl}
                        alt={event.productName}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Live Mode Info */}
        {isLiveMode && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Updates every 10 seconds
          </p>
        )}
      </CardContent>
    </Card>
  );
}
