import Image from "next/image"
import Link from "next/link"

import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { generalWhatsAppMessage, siteConfig } from "@/lib/site-config"

export function Hero({ total }: { total: number }) {
  return (
    <section className="relative border-b">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-boutique.png"
          alt="Interior de la tienda con prendas organizadas en un perchero de madera"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/85 md:bg-gradient-to-r md:from-background md:via-background/85 md:to-background/30" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-16 md:px-6 md:py-28">
        <div className="flex max-w-xl flex-col gap-5">
          <span className="text-eyebrow text-muted-foreground">
            {siteConfig.tagline} · {total} prendas publicadas
          </span>
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-balance md:text-6xl">
            Últimas prendas disponibles
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Encuentra prendas a precios especiales y arma tu pedido antes de que se agoten.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
            nativeButton={false}
              size="lg"
              className="h-12 rounded-none px-6 text-sm"
              render={<Link href="/catalogo" />}
            >
              Ver catálogo
            </Button>
            <WhatsAppButton
              message={generalWhatsAppMessage()}
              source="banner"
              variant="outline"
              className="h-12 px-6"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Disponibilidad limitada. Confirmamos tu pedido por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  )
}
