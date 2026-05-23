/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', '@prisma/client', 'pg'],
  },
  images: {
    domains: ['panoptes.blinkpharmacie.ma'],
  },
}

module.exports = nextConfig
