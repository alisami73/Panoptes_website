/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', '@prisma/client'],
  },
  images: {
    domains: ['panoptes.blinkpharmacie.ma'],
  },
}

module.exports = nextConfig
