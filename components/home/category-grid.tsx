import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { Catalog } from "@/lib/catalog/types"

export function CategoryGrid({ categories }: { categories: Catalog["categories"] }) {
  if (categories.length === 0) return null

  return (
    <section id="categorias" className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
      <div className="flex flex-col gap-2">
        <span className="text-eyebrow text-muted-foreground">Categorías</span>
        <h2 className="font-serif text-3xl tracking-tight text-balance md:text-4xl">
          Explora por tipo de prenda
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty">
          Las categorías se generan a partir del inventario publicado, así que siempre reflejan lo
          que realmente queda disponible.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <li key={category.name}>
            <Link
              href={`/catalogo?categoria=${encodeURIComponent(category.name)}`}
              className="group flex items-center justify-between border border-border bg-card px-4 py-5 transition-colors hover:border-foreground"
            >
              <span className="flex flex-col gap-1">
                <span className="font-serif text-lg leading-none">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.count} {category.count === 1 ? "prenda" : "prendas"}
                </span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
