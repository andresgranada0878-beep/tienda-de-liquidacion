import Link from "next/link"

import { ProductCard } from "@/components/catalog/product-card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/catalog/types"

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-14 md:px-6 md:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-eyebrow text-muted-foreground">Selección destacada</span>
          <h2 className="font-serif text-3xl tracking-tight text-balance md:text-4xl">
            Prendas que están saliendo primero
          </h2>
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

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.slug} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  )
}
