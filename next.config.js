/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', '@prisma/client'],
  },
  images: {
    domains: ['panoptes.blinkpharmacie.ma'],
  },
}

module.exports = nextConfig
