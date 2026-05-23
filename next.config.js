/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', '@prisma/client'],
  },
  images: {
    domains: ['panoptes.blinkpharmacie.ma'],
  },
  async rewrites() {
    const medindexUrl = process.env.MEDINDEX_API_URL || 'http://localhost:8080'
    return [
      {
        source: '/api/medindex/:path*',
        destination: `${medindexUrl}/api/medindex/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
