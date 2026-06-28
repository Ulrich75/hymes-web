/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Render exposes the port via $PORT; `next start` reads it automatically.
  async redirects() {
    return [
      { source: '/admin/login', destination: '/login', permanent: true },
    ];
  },
};

export default nextConfig;
