import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const BASE_URL = 'https://darni.app'

const STATIC_PAGES = [
  { loc: '/',          priority: '1.0', changefreq: 'daily'  },
  { loc: '/recherche', priority: '0.8', changefreq: 'daily'  },
  { loc: '/publier',   priority: '0.7', changefreq: 'monthly' },
  { loc: '/a-propos',  priority: '0.5', changefreq: 'monthly' },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Récupère toutes les annonces actives
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, updated_at, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const urls: string[] = []

  // Pages statiques
  for (const page of STATIC_PAGES) {
    urls.push(`
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`)
  }

  // Pages dynamiques (annonces)
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

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate') // cache 1h sur Vercel
  return res.status(200).send(xml)
}