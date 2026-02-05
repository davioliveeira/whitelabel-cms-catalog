//@ts-check

 
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},

  // Use standalone output for better deployment
  output: 'standalone',

  // Skip type checking during build (handled by Nx)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Ensure we're using App Router only
  experimental: {
    // App Router is the default in Next.js 13+
  },

  // Image optimization configuration
  images: {
    // Modern formats for better performance
    formats: ['image/webp', 'image/avif'],

    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,

    // Configure allowed image domains/patterns if using external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Production optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable HTTP compression
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,
};

const plugins = [
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
