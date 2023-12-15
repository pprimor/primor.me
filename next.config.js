/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@react-email/components",
      "@react-email/render",
      "@react-email/tailwind",
    ],
  },
  reactStrictMode: true,
  env: {
    RESEND_API_KEY: "re_2tFD3HHv_KpME2s1J8JgjxFZLW5x72NL4",
  },
};

module.exports = nextConfig;
