"use client"

import { useEffect, useState } from "react"

import { ProductCard } from "@/components/catalog/product-card"
import type { Catalog } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

type CatalogBrowserProps = {
  catalog: Catalog
}

export function CatalogBrowser({ catalog }: CatalogBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search)
      const requestedCategory = params.get("categoria") ?? ""

      const categoryExists = catalog.categories.some(
        (category) => category.name === requestedCategory,
      )

      setSelectedCategory(
        requestedCategory && categoryExists ? requestedCategory : "",
      )
    }

    syncFromUrl()

    window.addEventListener("popstate", syncFromUrl)

    return () => {
      window.removeEventListener("popstate", syncFromUrl)
    }
  }, [catalog.categories])

  function changeCategory(category: string) {
    setSelectedCategory(category)

    const url = new URL(window.location.href)

    if (category) {
      url.searchParams.set("categoria", category)
    } else {
      url.searchParams.delete("categoria")
    }

    window.history.pushState({}, "", url)
  }

  const availableProducts = catalog.products.filter(
    (product) => product.stock > 0,
  )

  const visibleProducts = selectedCategory
    ? availableProducts.filter(
        (product) => product.category === selectedCategory,
      )
    : availableProducts

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-8 md:px-6 md:py-12">
      <header className="max-w-2xl">
        <span className="text-eyebrow text-muted-foreground">
          Prendas disponibles
        </span>

        <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
          CatÃ¡logo Glamm Moda
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Revisa precios, tallas, colores y unidades disponibles. La compra
          se confirma por WhatsApp antes de realizar el pago.
        </p>
      </header>

      <nav
        className="mt-8 flex gap-2 overflow-x-auto pb-2"
        aria-label="Filtrar productos por categorÃ­a"
      >
        <button
          type="button"
          onClick={() => changeCategory("")}
          className={cn(
            "shrink-0 border px-4 py-2 text-sm transition-colors",
            !selectedCategory
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background hover:border-foreground",
          )}
        >
          Todas
        </button>

        {catalog.categories.map((category) => {
          const active = category.name === selectedCategory

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => changeCategory(category.name)}
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
            </button>
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
          <button
            type="button"
            onClick={() => changeCategory("")}
            className="text-sm underline underline-offset-4"
          >
            Limpiar filtro
          </button>
        ) : null}
      </div>

      {visibleProducts.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 border px-5 py-12 text-center">
          <h2 className="font-serif text-2xl">
            No hay prendas disponibles
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Esta categorÃ­a no tiene inventario disponible actualmente.
          </p>

          <button
            type="button"
            onClick={() => changeCategory("")}
            className="mt-5 inline-block border border-foreground px-5 py-3 text-sm"
          >
            Ver todas las prendas
          </button>
        </div>
      )}
    </main>
  )
}

