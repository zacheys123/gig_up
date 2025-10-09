import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

// Enhanced PWA Config Type with all available options
type PWACustomConfig = {
  dest: string;
  register: boolean;
  skipWaiting: boolean;
  disable: boolean;
  cacheOnFrontEndNav?: boolean;
  aggressiveFrontEndNavCaching?: boolean;
  reloadOnOnline?: boolean;
  swcMinify?: boolean;
  workboxOptions?: object;
  runtimeCaching?: Array<{
    urlPattern: RegExp | string;
    handler:
      | "NetworkFirst"
      | "CacheFirst"
      | "NetworkOnly"
      | "CacheOnly"
      | "StaleWhileRevalidate";
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      backgroundSync?: {
        name: string;
        options?: {
          maxRetentionTime?: number;
        };
      };
      broadcastUpdate?: {
        channelName?: string;
        options?: object;
      };
      cacheableResponse?: {
        statuses?: number[];
        headers?: object;
      };
    };
  }>;
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com", // Specific hostname for Clerk images
      },
      {
        protocol: "https",
        hostname: "**.clerk.com", // Wildcard for all subdomains
      },
      {
        protocol: "https",
        hostname: "**.clerk.dev", // Wildcard for all subdomains
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // Recommended for Next.js 15+
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  // Optional: Next.js 15+ performance optimizations
  experimental: {
    optimizePackageImports: ["@clerk/nextjs"],
  },
};

const pwaConfig: PWACustomConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-images",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
};

// Type assertion for the merged config
const configWithPWA: NextConfig & PWACustomConfig = {
  ...nextConfig,
  ...pwaConfig,
};

export default withPWA(configWithPWA);
