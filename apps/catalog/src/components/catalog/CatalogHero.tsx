'use client';

import * as React from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

export function CatalogHero() {
  const { config } = useTheme();
  const { banner } = config;

  // Don't render if banner is not active or no image
  if (!banner.isActive || !banner.images?.[0]) {
    return null;
  }

  // Height mapping
  const heightMap = {
    small: '300px',
    medium: '500px',
    large: '700px',
    full: '100vh'
  };

  const height = heightMap[banner.height] || heightMap.medium;

  // Text alignment
  const textAlignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }[banner.textPosition] || 'text-center items-center';

  const justifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[banner.textPosition] || 'justify-center';

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${banner.images[0]})`,
        }}
      />

      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black transition-opacity"
        style={{ opacity: banner.overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className={`relative h-full flex flex-col ${justifyClass} ${textAlignClass} px-4 md:px-8 container mx-auto`}>
        <div className="max-w-3xl space-y-4 md:space-y-6">
          
          {/* Title */}
          {banner.title && (
            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              style={{ 
                color: banner.textColor,
                fontFamily: `var(--font-heading)`
              }}
            >
              {banner.title}
            </h1>
          )}

          {/* Subtitle */}
          {banner.subtitle && (
            <p 
              className="text-base md:text-xl lg:text-2xl opacity-90"
              style={{ color: banner.textColor }}
            >
              {banner.subtitle}
            </p>
          )}

          {/* CTA Button */}
          {banner.ctaText && (
            <div>
              <button 
                className="px-8 py-3 font-semibold transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: config.colors.primary,
                  color: '#ffffff',
                  borderRadius: config.typography.borderRadius
                }}
                onClick={() => {
                  // Scroll to products section
                  const productsSection = document.querySelector('[data-products-grid]');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {banner.ctaText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
