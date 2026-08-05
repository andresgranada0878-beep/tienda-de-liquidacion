import Link from "next/link"

import { ProductCard } from "@/components/catalog/product-card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/catalog/types"

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-6 pt-10 md:px-6 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-2">
          <span className="text-eyebrow text-muted-foreground">
            Disponibles ahora
          </span>

          <h2 className="font-serif text-3xl tracking-tight text-balance md:text-4xl">
            Prendas listas para comprar
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Precios, tallas, colores y unidades actualizados según el inventario disponible.
          </p>
        </div>

        <Button
          nativeButton={false}
          variant="outline"
          size="lg"
          className="h-11 rounded-none"
          render={<Link href="/catalogo" />}
        >
          Ver todo el catálogo
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  )
}
