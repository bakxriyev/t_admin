/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tashkentlaw.ilmify-edu.uz',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://tashkentlaw.ilmify-edu.uz/uploads/:path*',
      },
    ];
  },
  transpilePackages: ['@tanstack/react-table'],
};

module.exports = nextConfig;
