import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTokenValid } from '@/lib/token'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const accessToken = await prisma.accessToken.findUnique({ where: { token } })
    if (!accessToken || !isTokenValid(accessToken)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const printUrl = `${appUrl}/deck/print?token=${token}`

    if (process.env.VERCEL && !process.env.PUPPETEER_EXECUTABLE_PATH) {
      return NextResponse.json(
        { error: 'PDF export is not enabled on this Vercel deployment' },
        { status: 501 }
      )
    }

    // Dynamically import puppeteer to avoid issues during build
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 60000 })

    // Wait for fonts and charts
    await new Promise((r) => setTimeout(r, 2000))

    const pdf = await page.pdf({
      width: '297mm',
      height: '210mm',
      printBackground: true,
      pageRanges: '',
    })

    await browser.close()

    const date = new Date().toISOString().slice(0, 10)
    const pdfBuffer = Buffer.from(pdf)
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PANOPTES_Blink_Pharma_${date}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
