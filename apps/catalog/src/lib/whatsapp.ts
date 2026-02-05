interface WhatsAppMessageParams {
  phoneNumber: string;
  productName: string;
  productPrice: number;
}

interface WhatsAppTrackingData {
  tenantId: string;
  productId: string;
}

/**
 * Generate WhatsApp URL with pre-filled message
 * @param params - WhatsApp message parameters
 * @param isMobile - Whether to use mobile app URL
 * @returns WhatsApp URL
 */
export function generateWhatsAppURL(
  params: WhatsAppMessageParams,
  isMobile = false
): string {
  // Remove all non-digit characters from phone number
  const cleanPhone = params.phoneNumber.replace(/\D/g, '');

  // Format price in Brazilian Real
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(params.productPrice);

  // Create message
  const message = `Olá! Tenho interesse no produto:
📦 ${params.productName}
💰 ${formattedPrice}`;

  // URL encode the message
  const encodedMessage = encodeURIComponent(message);

  // Generate URL based on device type
  if (isMobile) {
    return `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
  } else {
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
}

/**
 * Detect if device is mobile
 * @returns true if mobile device
 */
export function isMobileDevice(): boolean {
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Mobile device patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(userAgent.toLowerCase());
}

/**
 * Track WhatsApp click event
 * @param trackingData - Tenant and product IDs for tracking
 */
async function trackWhatsAppClick(
  trackingData: WhatsAppTrackingData
): Promise<void> {
  try {
    // Use Promise.race with timeout to avoid blocking WhatsApp open
    await Promise.race([
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: trackingData.tenantId,
          productId: trackingData.productId,
          eventType: 'whatsapp_click',
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        }),
      }),
      // Timeout after 500ms
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 500)
      ),
    ]);
  } catch (error) {
    // Fire-and-forget: don't block user experience on tracking errors
    console.error('Error tracking WhatsApp click:', error);
  }
}

/**
 * Open WhatsApp with pre-filled message and optional tracking
 * @param params - WhatsApp message parameters
 * @param trackingData - Optional tracking data for analytics
 */
export async function openWhatsApp(
  params: WhatsAppMessageParams,
  trackingData?: WhatsAppTrackingData
): Promise<void> {
  const isMobile = isMobileDevice();
  const url = generateWhatsAppURL(params, isMobile);

  // Track click event if tracking data is provided (fire-and-forget)
  if (trackingData) {
    trackWhatsAppClick(trackingData).catch(() => {
      // Ignore errors - tracking should not block WhatsApp open
    });
  }

  // Open in new window/tab (don't await tracking)
  window.open(url, '_blank', 'noopener,noreferrer');
}
