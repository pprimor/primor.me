/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [
      "@react-email/components",
      "@react-email/render",
      "@react-email/tailwind",
    ],
  },
};

module.exports = nextConfig;
