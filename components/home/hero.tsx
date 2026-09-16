import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import type { Catalog, Product } from "@/lib/catalog/types"

type HeroProps = {
  products: Product[]
  categories: Catalog["categories"]
}

export function Hero({ products, categories }: HeroProps) {
  const visibleCollections = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((category) => ({
      ...category,
      product: products.find(
        (product) => product.category === category.name,
      ),
    }))

  return (
    <section className="overflow-hidden border-b bg-background">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-6 md:py-14">
        <div className="flex max-w-xl flex-col gap-5">
          <span className="text-eyebrow text-muted-foreground">
            Prendas nuevas · Precios de liquidación · Unidades limitadas
          </span>

          <h1 className="font-serif text-4xl leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Encuentra tu próxima prenda antes de que se agote
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Tops, bodys, blusas y más a precios especiales. Explora
            nuestras colecciones y confirma la disponibilidad directamente
            por WhatsApp.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              nativeButton={false}
              size="lg"
              className="h-12 rounded-none px-7 text-sm"
              render={<Link href="/catalogo" />}
            >
              Ver prendas disponibles
            </Button>

            <span className="text-xs leading-relaxed text-muted-foreground">
              Confirmamos la disponibilidad y el valor total antes del pago.
            </span>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
            <span>Envíos a toda Colombia</span>
            <span>Recogida en Sabaneta</span>
            <span>Compra por WhatsApp</span>
          </div>
        </div>

        {visibleCollections.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-eyebrow text-muted-foreground">
                  Colecciones
                </span>
                <p className="mt-1 font-serif text-2xl tracking-tight">
                  Explora por categoría
                </p>
              </div>

              <Link
                href="/catalogo"
                className="text-sm underline underline-offset-4"
              >
                Ver todas
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {visibleCollections.map((collection, index) => (
                <Link
                  key={collection.name}
                  href={`/catalogo?categoria=${encodeURIComponent(
                    collection.name,
                  )}`}
                  className="group relative aspect-[4/3] overflow-hidden bg-muted"
                >
                  <Image
                    src={
                      collection.product?.images[0]?.url ||
                      "/placeholder.svg"
                    }
                    alt={
                      collection.product?.images[0]?.alt ||
                      `Colección ${collection.name}`
                    }
                    fill
                    unoptimized={collection.product?.images[0]?.url.startsWith("/api/catalog/images/")}
                    priority={index === 0}
                    sizes="(max-width: 768px) 50vw, 28vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10 text-white break-words">
                    <p className="font-medium">{collection.name}</p>
                    <p className="mt-1 text-xs text-white/80">
                      {collection.count}{" "}
                      {collection.count === 1 ? "prenda" : "prendas"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <Image
              src="/images/hero-boutique.png"
              alt="Colecciones disponibles en Glamm Moda"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  )
}





