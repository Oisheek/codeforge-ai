/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // In production, assets are served from a local server inside Electron.
  // In development, Next.js dev server handles everything.
};

module.exports = nextConfig;