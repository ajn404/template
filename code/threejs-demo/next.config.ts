import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,//https://nextjs.org/docs/app/api-reference/config/next-config-js/reactStrictMode
  /* config options here */
  experimental: {
    
    useCache: true,
    turbo: {

      rules: {
        '*.wgsl': {
          loaders: ['raw-loader'],
          as: '*.ts',
        },
      },
    },
  },
};

export default nextConfig;
