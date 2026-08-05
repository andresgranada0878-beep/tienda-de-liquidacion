"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { WhatsAppButton } from "@/components/whatsapp-button"
import { formatCOP } from "@/lib/format"
import type { Product } from "@/lib/catalog/types"

export function ProductDetail({ product }: { product: Product }) {
  const colors = product.color
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean)

  const [selectedImage, setSelectedImage] = useState(0)

  const [selectedColor, setSelectedColor] = useState(
    colors.length === 1 ? colors[0] : "",
  )

  const [selectedSize, setSelectedSize] = useState(
    product.sizes.length === 1 ? product.sizes[0] : "",
  )

  const selectionComplete =
    selectedSize !== "" &&
    (colors.length === 0 || selectedColor !== "")

  const message = [
    "Hola, estoy interesada en esta prenda de Glamm Moda:",
    "",
    `Prenda: ${product.name}`,
    `Referencia: ${product.code}`,
    selectedColor
      ? `Color: ${selectedColor}`
      : product.color
        ? `Color por confirmar: ${product.color}`
        : "",
    selectedSize
      ? `Talla: ${selectedSize}`
      : "Talla: por confirmar",
    `Precio: ${formatCOP(product.price)}`,
    "",
    "¿Me confirmas disponibilidad?",
  ]
    .filter(Boolean)
    .join("\n")

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <section>
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={
                product.images[selectedImage]?.url ||
                product.images[0]?.url ||
                "/placeholder.svg"
              }
              alt={
                product.images[selectedImage]?.alt ||
                product.name
              }
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
            />
          </div>

          {product.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-[4/5] overflow-hidden border bg-muted ${
                    selectedImage === index
                      ? "border-foreground"
                      : "border-border"
                  }`}
                  aria-label={`Ver fotografía ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="flex flex-col">
          <span className="text-eyebrow text-muted-foreground">
            {product.category}
          </span>

          <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Referencia {product.code}
          </p>

          <p className="mt-5 text-3xl font-medium tabular-nums">
            {formatCOP(product.price)}
          </p>

          <div className="mt-6 border-y py-5">
            <p className="text-sm">
              {product.stock}{" "}
              {product.stock === 1
                ? "unidad disponible"
                : "unidades disponibles"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Confirmamos disponibilidad antes del pago.
            </p>
          </div>

          {colors.length > 0 ? (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">
                Selecciona el color
              </p>

              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`border px-4 py-2 text-sm transition-colors ${
                      selectedColor === color
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium">
              Selecciona la talla
            </p>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 border px-4 py-2 text-sm transition-colors ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {selectionComplete ? (
              <WhatsAppButton
                message={message}
                source="detalle-producto"
                className="h-12 w-full"
              >
                Consultar esta prenda por WhatsApp
              </WhatsAppButton>
            ) : (
              <button
                type="button"
                disabled
                className="h-12 w-full cursor-not-allowed bg-muted px-5 text-sm text-muted-foreground"
              >
                Selecciona color y talla
              </button>
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            El pedido, el valor total y la forma de entrega se confirman por WhatsApp antes de realizar el pago.
          </p>

          {product.description ? (
            <div className="mt-8 border-t pt-6">
              <h2 className="font-serif text-xl">
                Información de la prenda
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
