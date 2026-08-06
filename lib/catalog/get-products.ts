import "server-only"

import { fallbackProducts } from "@/data/products-fallback"
import { getGoogleEnv } from "@/lib/google/auth"
import { listImages, type DriveFile } from "@/lib/google/drive"
import { readSheetRows } from "@/lib/google/sheets"
import type { Catalog, Product, ProductImage } from "./types"

/**
 * Estructura real del Google Sheets:
 *
 * A: Referencia
 * B: Nombre
 * C: Color
 * D: Talla
 * E: Unidades
 * F: Precio expresado en miles
 * G: Total
 * H: Categoría
 */
const COL = {
  code: 0,
  name: 1,
  color: 2,
  sizes: 3,
  stock: 4,
  price: 5,
  category: 7,
} as const

type InventoryVariant = {
  color: string
  sizes: string[]
  stock: number
  price: number
}

type InventoryGroup = {
  code: string
  name: string
  category: string
  variants: InventoryVariant[]
}

function cell(row: string[], index: number) {
  return (row[index] ?? "").toString().trim()
}

function parseNumber(value: string): number {
  if (!value) return 0

  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/,/g, ".")

  const parsed = Number.parseFloat(cleaned)

  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * En la hoja:
 * 85 o $85.00 representa $85.000 COP.
 *
 * También permite ingresar directamente 85000 en el futuro.
 */
function parsePrice(value: string): number {
  const raw = parseNumber(value)

  if (raw <= 0) return 0
  if (raw < 1000) return Math.round(raw * 1000)

  return Math.round(raw)
}

function parseStock(value: string): number {
  return Math.max(0, Math.round(parseNumber(value)))
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function normalizeSize(value: string) {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/\s*\/\s*/g, "/")

  if (["U", "UNICA", "ÚNICA"].includes(normalized)) {
    return "Única"
  }

  return normalized
}

function parseSizes(value: string): string[] {
  if (!value.trim()) return []

  const sizes: string[] = []

  for (const segment of value.split(/[,;|]/)) {
    const normalized = normalizeSize(segment)

    if (!normalized) continue

    // S-M-L significa tres tallas separadas.
    if (/^(XS|S|M|L|XL|XXL)(-(XS|S|M|L|XL|XXL))+$/.test(normalized)) {
      sizes.push(...normalized.split("-"))
      continue
    }

    // S/M y M/L se conservan como rangos de talla.
    sizes.push(normalized)
  }

  return unique(sizes)
}

function categoryForName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

  if (normalized.includes("body")) return "Body"
  if (normalized.includes("corset")) return "Corsets"

  if (
    normalized.includes("camisa") ||
    normalized.includes("blusa") ||
    normalized.includes("bluson") ||
    normalized.includes("camibuso") ||
    normalized.includes("cami buso") ||
    normalized.includes("buso")
  ) {
    return "Blusas y camisas"
  }

  if (
    normalized.includes("crop") ||
    normalized.includes("top") ||
    normalized.includes("straple") ||
    normalized.includes("estraple") ||
    normalized.includes("basica") ||
    normalized.includes("básica") ||
    normalized.includes("camiseta")
  ) {
    return "Tops y camisetas"
  }

  return "Otros"
}

/**
 * Relaciona las imágenes de Drive con el código.
 *
 * Ejemplos válidos:
 * 1.png
 * 1-2.png
 * 1_2.png
 *
 * Los nombres descriptivos antiguos se ignoran.
 */
function imagesForCode(code: string, files: DriveFile[]): ProductImage[] {
  const normalizedCode = code.toLowerCase()

  const matched = files
    .filter((file) => {
      const base = file.name
        .toLowerCase()
        .replace(/\.[a-z0-9]+$/, "")
        .trim()

      if (!/^\d+(?:[-_].*)?$/.test(base)) return false

      return (
        base === normalizedCode ||
        base.startsWith(`${normalizedCode}-`) ||
        base.startsWith(`${normalizedCode}_`)
      )
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    )

  return matched.map((file, index) => ({
    url: `/api/catalog/images/${file.id}`,
    alt: `Referencia ${code}, fotografía ${index + 1}`,
  }))
}

function groupInventoryRows(rows: string[][]): InventoryGroup[] {
  const groups = new Map<string, InventoryGroup>()

  for (const row of rows) {
    const code = cell(row, COL.code)
    const name = cell(row, COL.name)
    const stock = parseStock(cell(row, COL.stock))
    const price = parsePrice(cell(row, COL.price))
    const category = cell(row, COL.category)

    if (!/^\d+$/.test(code)) continue
    if (!name) continue
    if (stock <= 0) continue
    if (price <= 0) continue

    const variant: InventoryVariant = {
      color: cell(row, COL.color),
      sizes: parseSizes(cell(row, COL.sizes)),
      stock,
      price,
    }

    const existing = groups.get(code)

    if (existing) {
      existing.variants.push(variant)

      if (!existing.category && category) {
        existing.category = category
      } else if (
        category &&
        existing.category &&
        category !== existing.category
      ) {
        console.warn(
          `[Glamm Moda] La referencia ${code} tiene categorías distintas: ` +
            `"${existing.category}" y "${category}". Se conserva la primera.`,
        )
      }
    } else {
      groups.set(code, {
        code,
        name,
        category,
        variants: [variant],
      })
    }
  }

  return [...groups.values()]
}

function groupToProduct(
  group: InventoryGroup,
  files: DriveFile[],
): Product | null {
  const images = imagesForCode(group.code, files)

  // Solo se publican referencias con fotografía numérica.
  if (images.length === 0) return null

  const colors = unique(
    group.variants
      .map((variant) => variant.color.trim())
      .filter(Boolean),
  )

  const sizes = unique(
    group.variants.flatMap((variant) => variant.sizes),
  )

  const stock = group.variants.reduce(
    (total, variant) => total + variant.stock,
    0,
  )

  const prices = group.variants
    .map((variant) => variant.price)
    .filter((price) => price > 0)

  const price = prices.length > 0 ? Math.min(...prices) : 0

  if (stock <= 0 || price <= 0) return null

  const numericCode = Number.parseInt(group.code, 10)
  const colorText = colors.join(", ")
  const sizeText = sizes.join(", ")

  const descriptionParts = [
    colorText ? `Colores disponibles: ${colorText}.` : "",
    sizeText ? `Tallas disponibles: ${sizeText}.` : "",
    `Inventario disponible: ${stock} ${stock === 1 ? "unidad" : "unidades"}.`,
  ].filter(Boolean)

  return {
    code: group.code,
    name: group.name,
    slug: slugify(`${group.code}-${group.name}`),
    category: group.category || categoryForName(group.name),
    description: descriptionParts.join(" "),
    sizes: sizes.length > 0 ? sizes : ["Única"],
    color: colorText,
    material: "",
    measurements: "",
    price,
    previousPrice: null,
    stock,
    condition: "Nueva",
    featured: Number.isFinite(numericCode) && numericCode <= 8,
    order: Number.isFinite(numericCode) ? numericCode : 9999,
    date: "",
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

  for (const product of sorted) {
    categoryMap.set(
      product.category,
      (categoryMap.get(product.category) ?? 0) + 1,
    )

    product.sizes.forEach((size) => sizeSet.add(size))

    product.color
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean)
      .forEach((color) => colorSet.add(color))

    min = Math.min(min, product.price)
    max = Math.max(max, product.price)
  }

  return {
    products: sorted,
    categories: [...categoryMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.name.localeCompare(b.name, "es"),
      ),
    sizes: [...sizeSet].sort((a, b) =>
      a.localeCompare(b, "es", { numeric: true }),
    ),
    colors: [...colorSet].sort((a, b) =>
      a.localeCompare(b, "es"),
    ),
    priceRange: {
      min: Number.isFinite(min) ? min : 0,
      max: max || 0,
    },
    isDemo,
  }
}

/**
 * Fuente única del catálogo.
 *
 * Si Google no está configurado o falla completamente,
 * se mantienen los productos de demostración como respaldo.
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
        console.log(
          "[Glamm Moda] No se pudieron listar las imágenes:",
          (error as Error).message,
        )

        return [] as DriveFile[]
      }),
    ])

    const groups = groupInventoryRows(rows)

    const products = groups
      .map((group) => groupToProduct(group, files))
      .filter((product): product is Product => product !== null)

    if (products.length === 0) {
      console.log(
        "[Glamm Moda] No se encontraron productos con inventario y fotografía.",
      )

      return buildCatalog(fallbackProducts, true)
    }

    console.log(
      `[Glamm Moda] Catálogo cargado: ${products.length} referencias publicadas.`,
    )

    return buildCatalog(products, false)
  } catch (error) {
    console.log(
      "[Glamm Moda] Error leyendo el catálogo:",
      (error as Error).message,
    )

    return buildCatalog(fallbackProducts, true)
  }
}

export async function getProductBySlug(slug: string) {
  const catalog = await getProducts()

  const product =
    catalog.products.find((item) => item.slug === slug) ?? null

  const related = product
    ? catalog.products
        .filter(
          (item) =>
            item.slug !== slug &&
            item.category === product.category,
        )
        .slice(0, 4)
    : []

  return {
    product,
    related,
    catalog,
  }
}
