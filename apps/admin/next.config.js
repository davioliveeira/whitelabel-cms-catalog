//@ts-check


const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },

  // Use standalone output for better deployment
  output: 'standalone',

  // Output to current directory for Vercel
  distDir: '.next',

  // Skip type checking during build (handled by Nx)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Ensure we're using App Router only
  // App Router is the default in Next.js 13+
  experimental: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

const plugins = [
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
