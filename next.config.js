/** @type {import('next').NextConfig} */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://b.tashkentlawschool.uz').replace(/\/+$/, '');
const api = new URL(API_URL);

/** Uploads may come from the current backend or from the older hosts. */
const uploadHosts = [
  { protocol: api.protocol.replace(':', ''), hostname: api.hostname, port: api.port },
  { protocol: 'https', hostname: 'b.tashkentlawschool.uz', port: '' },
  { protocol: 'https', hostname: 'tashkentlaw.itzonee.uz', port: '' },
  { protocol: 'https', hostname: 'tashkentlaw.ilmify-edu.uz', port: '' },
];

const nextConfig = {
  images: {
    remotePatterns: uploadHosts.map((h) => ({ ...h, pathname: '/uploads/**' })),
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
  transpilePackages: ['@tanstack/react-table'],
};

module.exports = nextConfig;
