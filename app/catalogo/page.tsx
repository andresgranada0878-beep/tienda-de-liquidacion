import type { Metadata } from "next"
import Link from "next/link"

import { ProductCard } from "@/components/catalog/product-card"
import { DemoNotice } from "@/components/demo-notice"
import { getProducts } from "@/lib/catalog/get-products"
import { cn } from "@/lib/utils"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Catálogo | Glamm Moda",
  description:
    "Consulta las prendas, tallas, colores y precios disponibles en Glamm Moda.",
}

type CatalogPageProps = {
  searchParams: Promise<{
    categoria?: string | string[]
  }>
}

export default async function CatalogPage({
  searchParams,
}: CatalogPageProps) {
  const catalog = await getProducts()
  const params = await searchParams

  const requestedCategory = Array.isArray(params.categoria)
    ? params.categoria[0]
    : params.categoria

  const categoryExists = catalog.categories.some(
    (category) => category.name === requestedCategory,
  )

  const selectedCategory =
    requestedCategory && categoryExists ? requestedCategory : ""

  const availableProducts = catalog.products.filter(
    (product) => product.stock > 0,
  )

  const visibleProducts = selectedCategory
    ? availableProducts.filter(
        (product) => product.category === selectedCategory,
      )
    : availableProducts

  return (
    <>
      <DemoNotice isDemo={catalog.isDemo} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <header className="max-w-2xl">
          <span className="text-eyebrow text-muted-foreground">
            Prendas disponibles
          </span>

          <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
            Catálogo Glamm Moda
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Revisa precios, tallas, colores y unidades disponibles. La compra
            se confirma por WhatsApp antes de realizar el pago.
          </p>
        </header>

        <nav
          className="mt-8 flex gap-2 overflow-x-auto pb-2"
          aria-label="Filtrar productos por categoría"
        >
          <Link
            href="/catalogo"
            className={cn(
              "shrink-0 border px-4 py-2 text-sm transition-colors",
              !selectedCategory
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:border-foreground",
            )}
          >
            Todas
          </Link>

          {catalog.categories.map((category) => {
            const active = category.name === selectedCategory

            return (
              <Link
                key={category.name}
                href={`/catalogo?categoria=${encodeURIComponent(
                  category.name,
                )}`}
                className={cn(
                  "shrink-0 border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground",
                )}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-70">
                  {category.count}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 flex items-end justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="font-serif text-2xl">
              {selectedCategory || "Todas las prendas"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {visibleProducts.length}{" "}
              {visibleProducts.length === 1
                ? "referencia disponible"
                : "referencias disponibles"}
            </p>
          </div>

          {selectedCategory ? (
            <Link
              href="/catalogo"
              className="text-sm underline underline-offset-4"
            >
              Limpiar filtro
            </Link>
          ) : null}
        </div>

        {visibleProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 border px-5 py-12 text-center">
            <h2 className="font-serif text-2xl">
              No hay prendas disponibles
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Esta categoría no tiene inventario disponible actualmente.
            </p>

            <Link
              href="/catalogo"
              className="mt-5 inline-block border border-foreground px-5 py-3 text-sm"
            >
              Ver todas las prendas
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
