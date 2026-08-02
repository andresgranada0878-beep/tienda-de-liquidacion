export type ProductImage = {
  /** URL lista para usar en <Image>. Para Drive apunta a /api/catalog/images/[fileId]. */
  url: string
  alt: string
}

export type Product = {
  /** Código / referencia. Ej: REF-101 */
  code: string
  name: string
  slug: string
  category: string
  description: string
  /** Tallas disponibles. Una prenda única puede tener una sola talla. */
  sizes: string[]
  color: string
  material: string
  measurements: string
  price: number
  /** Precio anterior, solo cuando es mayor al precio actual. */
  previousPrice: number | null
  stock: number
  condition: string
  featured: boolean
  order: number
  /** Fecha ISO o cadena vacía. */
  date: string
  images: ProductImage[]
}

export type Catalog = {
  products: Product[]
  categories: { name: string; count: number }[]
  sizes: string[]
  colors: string[]
  priceRange: { min: number; max: number }
  /** true cuando los datos vienen de data/products-fallback.ts */
  isDemo: boolean
}

export type SortKey =
  | "recomendadas"
  | "precio-asc"
  | "precio-desc"
  | "recientes"
  | "descuento"
  | "disponibles"

export function savings(product: Product) {
  if (!product.previousPrice || product.previousPrice <= product.price) return null
  const amount = product.previousPrice - product.price
  const percent = Math.round((amount / product.previousPrice) * 100)
  return { amount, percent }
}

export function isSoldOut(product: Product) {
  return product.stock <= 0
}

export function isLastUnit(product: Product) {
  return product.stock === 1
}
