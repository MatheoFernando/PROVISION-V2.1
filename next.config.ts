import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  eslint: {
    // Ignora o ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros de tipagem durante o build
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
