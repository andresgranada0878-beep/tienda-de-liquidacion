import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatCOP } from "@/lib/format"
import type { Product } from "@/lib/catalog/types"

export function Hero({ products }: { products: Product[] }) {
  const visibleProducts = products.slice(0, 3)

  return (
    <section className="overflow-hidden border-b bg-background">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[0.9-full max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-6 md:py-14">
        <div className="flex max-w-xl flex-col gap-5">
          <span className="text-eyebrow text-muted-foreground">
            Prendas nuevas · Precios de liquidación · Unidades limitadas
          </span>

          <h1 className="font-serif text-4xl leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Encuentra tu próxima prenda antes de que se agote
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Tops, bodys, blusas y más a precios especiales. Elige tus prendas y confirma
            disponibilidad directamente por WhatsApp.
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
              Confirmamos disponibilidad y total antes del pago.
            </span>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
            <span>Envíos nacionales</span>
            <span>Recogida en Sabaneta</span>
            <span>Compra por WhatsApp</span>
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
            {visibleProducts.map((product, index) => (
              <Link
                key={product.slug}
                href={`/producto/${product.slug}`}
                className={
                  index === 0
                    ? "group relative col-span-2 aspect-[16/10] overflow-hidden bg-muted sm:col-span-1 sm:aspect-[4/5]"
                    : "group relative aspect-[4/5] overflow-hidden bg-muted"
                }
              >
                <Image
                  src={product.images[0]?.url || "/placeholder.svg"}
                  alt={product.images[0]?.alt || product.name}
                  fill
                  priority
                  sizes={
                    index === 0
                      ? "(max-width: 640px) 100vw, 25vw"
                      : "(max-width: 640px) 50vw, 25vw"
                  }
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-12 text-white">
                  <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
                  <p className="mt-1 text-xs">{formatCOP(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <Image
              src="/images/hero-boutique.png"
              alt="Prendas disponibles en Glamm Moda"
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
