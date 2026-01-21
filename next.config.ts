import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
   typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // If needed
  }
};

export default withNextIntl(nextConfig);
