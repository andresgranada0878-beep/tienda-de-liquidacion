import "server-only"

import { fallbackProducts } from "@/data/products-fallback"
import { getGoogleEnv } from "@/lib/google/auth"
import { listImages, type DriveFile } from "@/lib/google/drive"
import { readSheetRows } from "@/lib/google/sheets"
import type { Catalog, Product, ProductImage } from "./types"

const PLACEHOLDER = "/placeholder.svg?height=1200&width=900"

/** Columnas A..R del Google Sheets, en orden. */
const COL = {
  code: 0,
  name: 1,
  slug: 2,
  category: 3,
  description: 4,
  sizes: 5,
  color: 6,
  material: 7,
  measurements: 8,
  price: 9,
  previousPrice: 10,
  stock: 11,
  condition: 12,
  featured: 13,
  publish: 14,
  order: 15,
  date: 16,
  mainImage: 17,
} as const

function cell(row: string[], index: number) {
  return (row[index] ?? "").toString().trim()
}

function parseNumber(value: string): number {
  if (!value) return 0
  // Acepta "49.900", "49900", "$49.900", "49,900"
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(/,/g, ".")
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? Math.round(n) : 0
}

function parseBool(value: string) {
  const v = value.toLowerCase()
  return ["si", "sí", "true", "1", "x", "yes"].includes(v)
}

function isNo(value: string) {
  const v = value.toLowerCase()
  return ["no", "false", "0", "oculto"].includes(v)
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function splitList(value: string) {
  return value
    .split(/[,/|;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Relaciona las imágenes de Drive con el producto por su código: REF-101-1.jpg */
function imagesForCode(code: string, files: DriveFile[]): ProductImage[] {
  const prefix = code.toLowerCase()
  const matched = files
    .filter((f) => {
      const base = f.name.toLowerCase().replace(/\.[a-z0-9]+$/, "")
      return base === prefix || base.startsWith(`${prefix}-`) || base.startsWith(`${prefix}_`)
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }))

  return matched.map((f, i) => ({
    url: `/api/catalog/images/${f.id}`,
    alt: `${code} fotografía ${i + 1}`,
  }))
}

function rowToProduct(row: string[], files: DriveFile[]): Product | null {
  const code = cell(row, COL.code)
  const name = cell(row, COL.name)
  if (!code && !name) return null
  if (isNo(cell(row, COL.publish))) return null

  const price = parseNumber(cell(row, COL.price))
  if (price <= 0) return null

  const previousRaw = parseNumber(cell(row, COL.previousPrice))
  const previousPrice = previousRaw > price ? previousRaw : null

  const stockRaw = cell(row, COL.stock)
  const stock = stockRaw === "" ? 0 : Math.max(0, parseNumber(stockRaw))

  const sizes = splitList(cell(row, COL.sizes))
  const safeName = name || code
  const slug = slugify(cell(row, COL.slug) || `${code}-${safeName}`)

  let images = imagesForCode(code, files)
  const mainImage = cell(row, COL.mainImage)
  if (images.length === 0 && /^https?:\/\//.test(mainImage)) {
    images = [{ url: mainImage, alt: `${safeName} fotografía 1` }]
  }
  if (images.length === 0) {
    images = [{ url: PLACEHOLDER, alt: `${safeName} sin fotografía disponible` }]
  }

  return {
    code: code || slug.toUpperCase(),
    name: safeName,
    slug,
    category: cell(row, COL.category) || "Otros",
    description: cell(row, COL.description),
    sizes: sizes.length > 0 ? sizes : ["Única"],
    color: cell(row, COL.color),
    material: cell(row, COL.material),
    measurements: cell(row, COL.measurements),
    price,
    previousPrice,
    stock,
    condition: cell(row, COL.condition),
    featured: parseBool(cell(row, COL.featured)),
    order: parseNumber(cell(row, COL.order)) || 9999,
    date: cell(row, COL.date),
    images,
  }
}

function sortProducts(products: Product[]) {
  return [...products].sort((a, b) => {
    const aOut = a.stock <= 0 ? 1 : 0
    const bOut = b.stock <= 0 ? 1 : 0
    if (aOut !== bOut) return aOut - bOut
    if (a.order !== b.order) return a.order - b.order
    return a.name.localeCompare(b.name, "es")
  })
}

function buildCatalog(products: Product[], isDemo: boolean): Catalog {
  const sorted = sortProducts(products)

  const categoryMap = new Map<string, number>()
  const sizeSet = new Set<string>()
  const colorSet = new Set<string>()
  let min = Number.POSITIVE_INFINITY
  let max = 0

  for (const p of sorted) {
    categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1)
    p.sizes.forEach((s) => sizeSet.add(s))
    if (p.color) colorSet.add(p.color)
    min = Math.min(min, p.price)
    max = Math.max(max, p.price)
  }

  return {
    products: sorted,
    categories: [...categoryMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es")),
    sizes: [...sizeSet].sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    colors: [...colorSet].sort((a, b) => a.localeCompare(b, "es")),
    priceRange: {
      min: Number.isFinite(min) ? min : 0,
      max: max || 0,
    },
    isDemo,
  }
}

/**
 * Fuente única del catálogo.
 * Si Google no está configurado o falla, usa los datos de demostración.
 */
export async function getProducts(): Promise<Catalog> {
  const env = getGoogleEnv()
  if (!env) {
    return buildCatalog(fallbackProducts, true)
  }

  try {
    const [rows, files] = await Promise.all([
      readSheetRows(env),
      listImages(env).catch((error) => {
        console.log("[v0] No se pudieron listar las imágenes de Drive:", (error as Error).message)
        return [] as DriveFile[]
      }),
    ])

    const products: Product[] = []
    for (const [index, row] of rows.entries()) {
      // Una fila incorrecta no debe dañar todo el catálogo.
      try {
        const product = rowToProduct(row, files)
        if (product) products.push(product)
      } catch (error) {
        console.log(`[v0] Fila ${index + 2} del catálogo ignorada:`, (error as Error).message)
      }
    }

    if (products.length === 0) {
      console.log("[v0] El Google Sheets no devolvió productos publicados. Se usan datos demo.")
      return buildCatalog(fallbackProducts, true)
    }

    return buildCatalog(products, false)
  } catch (error) {
    // Se registra el mensaje sin exponer credenciales ni datos sensibles.
    console.log("[v0] Error leyendo el catálogo de Google:", (error as Error).message)
    return buildCatalog(fallbackProducts, true)
  }
}

export async function getProductBySlug(slug: string) {
  const catalog = await getProducts()
  const product = catalog.products.find((p) => p.slug === slug) ?? null
  const related = product
    ? catalog.products.filter((p) => p.slug !== slug && p.category === product.category).slice(0, 4)
    : []
  return { product, related, catalog }
}
