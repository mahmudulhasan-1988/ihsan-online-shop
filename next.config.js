/** @type {import('next').NextConfig} */
const backendServerUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'ghorerbazar.com',
      'ghorerbazarbd.com',
      'cdn.shopify.com',
      'res.cloudinary.com',
      'i.ibb.co',
      'ibb.co',
      'api.imgbb.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Proxy backend API requests to express backend without CORS issues
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendServerUrl}/api/:path*`,
      },
      {
        source: '/api/server/:path*',
        destination: `${backendServerUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
