import { readFile } from 'fs/promises'
import { join } from 'path'

const mapHtmlPath = join(process.cwd(), 'public', '_map-source', 'panoptes-map.html')
const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'public, max-age=0, must-revalidate',
}

export const runtime = 'nodejs'

export async function GET() {
  const html = await readFile(mapHtmlPath, 'utf8')
  return new Response(html, { headers: htmlHeaders })
}

export async function HEAD() {
  return new Response(null, { headers: htmlHeaders })
}
