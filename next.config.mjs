import { imageHosts } from './image-hosts.config.mjs';
import withPWAInit from '@ducanh2912/next-pwa';

// Konfigurasi PWA
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // PWA mati di mode dev agar coding tidak terganggu cache
  register: true,
  skipWaiting: true, // Otomatis aktifkan versi PWA baru tanpa menunda
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  },
  webpack(
    config,
    {
      dev: dev
    }
  ) {
    if (dev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });
      const ignoredPaths = (process.env.WATCH_IGNORED_PATHS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      config.watchOptions = {
        ignored: ignoredPaths.length
          ? ignoredPaths.map((p) => `**/${p.replace(/^\/+|\/+$/g, '')}/**`)
          : undefined,
      };
    }
    return config;
  },
};

// Bungkus nextConfig dengan withPWA
export default withPWA(nextConfig);