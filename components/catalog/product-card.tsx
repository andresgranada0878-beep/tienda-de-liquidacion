"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Plus } from "lucide-react"

import { ShareButton } from "@/components/catalog/share-button"
import { useSelection } from "@/components/selection/selection-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { formatCOP } from "@/lib/format"
import { cn } from "@/lib/utils"
import { isLastUnit, isSoldOut, savings, type Product } from "@/lib/catalog/types"

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add, setOpen } = useSelection()
  const soldOut = isSoldOut(product)
  const discount = savings(product)
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "")
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (soldOut) return
    if (!size) return
    add({
      code: product.code,
      slug: product.slug,
      name: product.name,
      color: product.color,
      size,
      price: product.price,
      stock: product.stock,
      image: product.images[0]?.url ?? "/placeholder.svg",
    })
    setAdded(true)
    setOpen(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article
      className={cn(
        "group flex flex-col border border-border bg-card transition-colors",
        soldOut && "opacity-70",
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Link prefetch={false} href={`/producto/${product.slug}`} aria-label={`Ver detalles de ${product.name}`}>
          <Image
            src={product.images[0]?.url || "/placeholder.svg"}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="absolute left-0 top-0 flex flex-col items-start gap-1 p-2">
          {soldOut ? (
            <span className="bg-foreground px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-background">
              Agotada
            </span>
          ) : isLastUnit(product) ? (
            <span className="bg-sale px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-sale-foreground">
              Última unidad
            </span>
          ) : null}
          {discount && !soldOut ? (
            <span className="bg-card px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-sale">
              -{discount.percent}%
            </span>
          ) : null}
        </div>

        <div className="absolute right-1 top-1">
          <ShareButton
            slug={product.slug}
            name={product.name}
            code={product.code}
            className="bg-card/90 hover:bg-card"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          <span className="text-[0.65rem] text-muted-foreground">{product.code}</span>
        </div>

        <h3 className="font-serif text-sm leading-snug text-pretty break-words line-clamp-2">
          <Link prefetch={false} href={`/producto/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-medium tabular-nums whitespace-nowrap">{formatCOP(product.price)}</span>
          {product.previousPrice ? (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {formatCOP(product.previousPrice)}
            </span>
          ) : null}
          {discount ? (
            <span className="text-xs text-sale">Ahorras {formatCOP(discount.amount)}</span>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          {product.color ? `${product.color} · ` : ""}
          {soldOut
            ? "Sin unidades"
            : `${product.stock} ${product.stock === 1 ? "unidad" : "unidades"}`}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          {!soldOut && product.sizes.length > 1 ? (
            <div className="flex flex-wrap gap-1" role="group" aria-label="Elegir talla">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s)
                    track("SelectSize", { code: product.code, size: s })
                  }}
                  aria-pressed={size === s}
                  className={cn(
                    "min-w-8 border px-2 py-1 text-xs transition-colors",
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : !soldOut ? (
            <p className="text-xs text-muted-foreground">Talla {product.sizes[0]}</p>
          ) : null}

          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-9 flex-1 rounded-none text-xs"
              disabled={soldOut || !size}
              onClick={handleAdd}
            >
              {added ? (
                <Check data-icon="inline-start" aria-hidden="true" />
              ) : (
                <Plus data-icon="inline-start" aria-hidden="true" />
              )}
              {soldOut
                ? "Agotada"
                : added
                  ? "Agregada"
                  : !size
                    ? "Elige talla"
                    : "Agregar a mi selección"}
            </Button>
            <Link prefetch={false}
              href={`/producto/${product.slug}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-9 rounded-none",
              )}
            >
              Ver detalles
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}










