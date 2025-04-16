import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Create the next-intl plugin
const withNextIntl = createNextIntlPlugin();

// Define the Next.js configuration
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
    ],
  },
};

// Apply the plugins
const config = withNextIntl(nextConfig);

export default config;