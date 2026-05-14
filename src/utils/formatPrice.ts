// utils/formatPrice.ts
// ✅ Formatage prix intelligent pour l'Algérie
export function formatPrice(price: number, transaction?: string): string {
  if (!price) return '—'
  let str: string
  if (price >= 1_000_000_000) {
    const v = price / 1_000_000_000
    str = `${v % 1 === 0 ? v : v.toFixed(1)} Mds DA`
  } else if (price >= 1_000_000) {
    const v = price / 1_000_000
    str = `${v % 1 === 0 ? v : v.toFixed(1)} M DA`
  } else {
    str = `${price.toLocaleString('fr-DZ')} DA`
  }
  return transaction === 'location' ? `${str}/mois` : str
}