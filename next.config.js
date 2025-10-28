/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // desativa SWC
  compiler: {
    removeConsole: false,
  },
};

module.exports = nextConfig;
