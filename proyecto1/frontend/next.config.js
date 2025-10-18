/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/payment-success',
        destination: '/payment-success-page',
      },
      {
        source: '/payment-failure', 
        destination: '/payment-failure-page',
      },
      {
        source: '/payment-pending',
        destination: '/payment-pending-page',
      },
    ];
  },
};

module.exports = nextConfig;