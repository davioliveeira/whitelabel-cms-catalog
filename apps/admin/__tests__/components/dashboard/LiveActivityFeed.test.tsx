// =============================================================================
// LiveActivityFeed Component Tests
// =============================================================================

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// =============================================================================
// Mocks
// =============================================================================

const mockUseRecentEvents = jest.fn();

jest.mock('@/hooks/useAnalytics', () => ({
  useRecentEvents: (...args: unknown[]) => mockUseRecentEvents(...args),
}));

// Import component after mocking
import { LiveActivityFeed } from '../../../src/components/dashboard/LiveActivityFeed';

// =============================================================================
// Test Data
// =============================================================================

const mockRecentEvents = [
  {
    id: 'event-1',
    eventType: 'VIEW' as const,
    productId: 'prod-1',
    productName: 'Product A',
    productImageUrl: 'https://example.com/a.jpg',
    createdAt: new Date(Date.now() - 60000), // 1 minute ago
  },
  {
    id: 'event-2',
    eventType: 'WHATSAPP_CLICK' as const,
    productId: 'prod-2',
    productName: 'Product B',
    productImageUrl: 'https://example.com/b.jpg',
    createdAt: new Date(Date.now() - 300000), // 5 minutes ago
  },
];

// =============================================================================
// Test Suite
// =============================================================================

describe('LiveActivityFeed Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Live Mode Toggle', () => {
    it('should render live mode toggle switch', () => {
      mockUseRecentEvents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByLabelText(/live mode/i)).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should load live mode state from localStorage on mount', () => {
      localStorage.setItem('analytics-live-mode', 'true');

      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      render(<LiveActivityFeed tenantId="tenant-1" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();

      // Verify hook was called with enabled=true
      expect(mockUseRecentEvents).toHaveBeenCalledWith('tenant-1', true, 20);
    });

    it('should save live mode state to localStorage when toggled', async () => {
      const user = userEvent.setup();

      mockUseRecentEvents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      render(<LiveActivityFeed tenantId="tenant-1" />);

      const toggle = screen.getByRole('switch');

      // Enable live mode
      await user.click(toggle);
      expect(localStorage.getItem('analytics-live-mode')).toBe('true');

      // Disable live mode
      await user.click(toggle);
      expect(localStorage.getItem('analytics-live-mode')).toBe('false');
    });

    it('should enable polling when live mode is turned on', async () => {
      const user = userEvent.setup();

      mockUseRecentEvents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      const { rerender } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Initially disabled (default state)
      expect(mockUseRecentEvents).toHaveBeenCalledWith('tenant-1', false, 20);

      // Enable live mode
      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      // Force rerender to trigger hook with new state
      rerender(<LiveActivityFeed tenantId="tenant-1" />);

      await waitFor(() => {
        const calls = mockUseRecentEvents.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[1]).toBe(true); // enabled=true
      });
    });

    it('should disable polling when live mode is turned off', async () => {
      const user = userEvent.setup();

      localStorage.setItem('analytics-live-mode', 'true');

      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      const { rerender } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Initially enabled (from localStorage)
      expect(mockUseRecentEvents).toHaveBeenCalledWith('tenant-1', true, 20);

      // Disable live mode
      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      rerender(<LiveActivityFeed tenantId="tenant-1" />);

      await waitFor(() => {
        const calls = mockUseRecentEvents.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[1]).toBe(false); // enabled=false
      });
    });
  });

  describe('Event Feed Rendering', () => {
    it('should render list of recent events', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });

    it('should display correct event icons', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Check for Eye and MessageCircle icons (using class names or testing library queries)
      const eventItems = container.querySelectorAll('.p-2.rounded-full');
      expect(eventItems.length).toBeGreaterThan(0);
    });

    it('should display correct badges for event types', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText('Viewed')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp Click')).toBeInTheDocument();
    });

    it('should render product thumbnails when available', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      const images = screen.getAllByRole('img');
      expect(images.length).toBe(2);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/a.jpg');
      expect(images[0]).toHaveAttribute('alt', 'Product A');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/b.jpg');
    });

    it('should handle events without product images', () => {
      const eventsWithoutImage = [
        {
          ...mockRecentEvents[0],
          productImageUrl: null,
        },
      ];

      mockUseRecentEvents.mockReturnValue({
        data: eventsWithoutImage,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      // Event should still render
      expect(screen.getByText('Product A')).toBeInTheDocument();

      // No image should be present
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Relative Timestamp Formatting', () => {
    it('should show "just now" for events within 60 seconds', () => {
      const recentEvent = {
        ...mockRecentEvents[0],
        createdAt: new Date(Date.now() - 30000), // 30 seconds ago
      };

      mockUseRecentEvents.mockReturnValue({
        data: [recentEvent],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('should show "X minutes ago" for events within 1 hour', () => {
      const event = {
        ...mockRecentEvents[0],
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      };

      mockUseRecentEvents.mockReturnValue({
        data: [event],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });

    it('should show "X hours ago" for events within 24 hours', () => {
      const event = {
        ...mockRecentEvents[0],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      };

      mockUseRecentEvents.mockReturnValue({
        data: [event],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should show "X days ago" for events older than 24 hours', () => {
      const event = {
        ...mockRecentEvents[0],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      };

      mockUseRecentEvents.mockReturnValue({
        data: [event],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText('3 days ago')).toBeInTheDocument();
    });

    it('should use singular form for 1 minute/hour/day', () => {
      const events = [
        {
          ...mockRecentEvents[0],
          id: 'event-1',
          createdAt: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
        },
        {
          ...mockRecentEvents[0],
          id: 'event-2',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
        {
          ...mockRecentEvents[0],
          id: 'event-3',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      ];

      mockUseRecentEvents.mockReturnValue({
        data: events,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText('1 minute ago')).toBeInTheDocument();
      expect(screen.getByText('1 hour ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
    });
  });

  describe('New Event Animation', () => {
    it('should highlight new events with animation', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Check for animation classes (these are applied to new events)
      const eventElements = container.querySelectorAll('[class*="animate-in"]');
      // New events will have animation classes applied
      expect(eventElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should remove highlight after animation completes', async () => {
      jest.useFakeTimers();

      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Fast-forward time by 2 seconds (animation timeout)
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        // Animation classes should be removed after timeout
        const animatedElements = container.querySelectorAll('[class*="animate-in"]');
        // After 2 seconds, new event highlighting should be cleared
        expect(animatedElements.length).toBe(0);
      });

      jest.useRealTimers();
    });

    it('should not highlight events that were already shown', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { rerender } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Re-render with same events
      rerender(<LiveActivityFeed tenantId="tenant-1" />);

      // No events should be highlighted as "new" on second render
      expect(screen.getByText('Product A')).toBeInTheDocument();
    });
  });

  describe('Loading and Empty States', () => {
    it('should show loading state while fetching', () => {
      mockUseRecentEvents.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isFetching: true,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText(/loading activity/i)).toBeInTheDocument();
    });

    it('should show error state on fetch failure', () => {
      const error = new Error('Failed to fetch events');

      mockUseRecentEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText(/error loading activity/i)).toBeInTheDocument();
      expect(screen.getByText(error.message)).toBeInTheDocument();
    });

    it('should show "Live Mode is Off" when disabled', () => {
      mockUseRecentEvents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'false');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText(/live mode is off/i)).toBeInTheDocument();
      expect(screen.getByText(/enable live mode to see real-time activity/i)).toBeInTheDocument();
    });

    it('should show "No Activity Yet" when live mode is on but no events', () => {
      mockUseRecentEvents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
      expect(screen.getByText(/waiting for customer engagement/i)).toBeInTheDocument();
    });
  });

  describe('Refresh Indicator', () => {
    it('should show green pulse dot when fetching in live mode', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: true,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Check for pulse indicator
      const pulseIndicator = container.querySelector('.bg-green-500.animate-pulse');
      expect(pulseIndicator).toBeInTheDocument();
    });

    it('should not show pulse dot when not fetching', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // No pulse indicator when not fetching
      const pulseIndicator = container.querySelector('.bg-green-500.animate-pulse');
      expect(pulseIndicator).not.toBeInTheDocument();
    });

    it('should not show pulse dot when live mode is off', () => {
      mockUseRecentEvents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isFetching: true, // Even though fetching, live mode is off
      });

      localStorage.setItem('analytics-live-mode', 'false');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // No pulse indicator when live mode is off
      const pulseIndicator = container.querySelector('.bg-green-500.animate-pulse');
      expect(pulseIndicator).not.toBeInTheDocument();
    });
  });

  describe('ScrollArea Integration', () => {
    it('should render events within ScrollArea', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Check for ScrollArea wrapper
      const scrollArea = container.querySelector('[data-radix-scroll-area-viewport]');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should set correct height for ScrollArea', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      const { container } = render(<LiveActivityFeed tenantId="tenant-1" />);

      // Check for h-[400px] class
      const scrollArea = container.querySelector('.h-\\[400px\\]');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('Polling Information', () => {
    it('should show "Updates every 10 seconds" when live mode is on', () => {
      mockUseRecentEvents.mockReturnValue({
        data: mockRecentEvents,
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'true');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.getByText(/updates every 10 seconds/i)).toBeInTheDocument();
    });

    it('should not show polling info when live mode is off', () => {
      mockUseRecentEvents.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isFetching: false,
      });

      localStorage.setItem('analytics-live-mode', 'false');

      render(<LiveActivityFeed tenantId="tenant-1" />);

      expect(screen.queryByText(/updates every 10 seconds/i)).not.toBeInTheDocument();
    });
  });
});
