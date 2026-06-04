/**
 * Hook SEO — génère les meta tags pour chaque page Darni
 * Usage : useSEO({ title, description, image, url })
 */
import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

const DEFAULT = {
  title: 'Darni — Immobilier en Algérie',
  description: 'Trouvez votre bien immobilier en Algérie : appartements, villas, terrains à vendre ou à louer dans les 48 wilayas. Annonces vérifiées, contact direct.',
  image: 'https://darni.app/og-image.jpg',
  url: 'https://darni.app',
}

export function useSEO({ title, description, image, url, type = 'website' }: SEOProps = {}) {
  const fullTitle = title ? `${title} | Darni` : DEFAULT.title
  const finalDesc = description ?? DEFAULT.description
  const finalImg  = image ?? DEFAULT.image
  const finalUrl  = url ?? DEFAULT.url

  useEffect(() => {
    // Title
    document.title = fullTitle

    // Meta description
    setMeta('name', 'description', finalDesc)

    // Open Graph
    setMeta('property', 'og:title',       fullTitle)
    setMeta('property', 'og:description', finalDesc)
    setMeta('property', 'og:image',       finalImg)
    setMeta('property', 'og:url',         finalUrl)
    setMeta('property', 'og:type',        type)
    setMeta('property', 'og:site_name',   'Darni')
    setMeta('property', 'og:locale',      'fr_DZ')

    // Twitter Card
    setMeta('name', 'twitter:card',        'summary_large_image')
    setMeta('name', 'twitter:title',       fullTitle)
    setMeta('name', 'twitter:description', finalDesc)
    setMeta('name', 'twitter:image',       finalImg)

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = finalUrl
  }, [fullTitle, finalDesc, finalImg, finalUrl, type])
}

function setMeta(attr: string, name: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}