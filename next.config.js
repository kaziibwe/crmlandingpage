/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Isolated build dir for automated verification servers (ECRM_ISOLATED=1)
  // so they never share .next with the developer's dev server.
  ...(process.env.ECRM_ISOLATED ? { distDir: ".next-verify" } : {}),
  async redirects() {
    return [
      // Common mistyped portal URLs — land on the dashboard
      { source: "/eternitycrmadmin/admin", destination: "/eternitycrmadmin", permanent: false },
      { source: "/eternitycrmadmin/admin/:path*", destination: "/eternitycrmadmin", permanent: false },
    ];
  },
};

module.exports = nextConfig;
