import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.VITE_SUPABASE_ANON_KEY as string
)

const BASE_URL = 'https://darni.app'

const STATIC_PAGES = [
  { loc: '/',          priority: '1.0', changefreq: 'daily'   },
  { loc: '/recherche', priority: '0.8', changefreq: 'daily'   },
  { loc: '/publier',   priority: '0.7', changefreq: 'monthly' },
  { loc: '/a-propos',  priority: '0.5', changefreq: 'monthly' },
]

export default async function handler(req: Request): Promise<Response> {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, updated_at, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const urls: string[] = []

  for (const page of STATIC_PAGES) {
    urls.push(`
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  }

  for (const listing of listings ?? []) {
    const lastmod = (listing.updated_at ?? listing.created_at ?? '').slice(0, 10)
    urls.push(`
  <url>
    <loc>${BASE_URL}/listing/${listing.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}