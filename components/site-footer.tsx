import Link from "next/link"
import { Camera, MapPin, MessageCircle } from "lucide-react"

import { PendingValue } from "@/components/pending-value"
import { isPendiente, siteConfig } from "@/lib/site-config"

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="flex flex-col gap-3">
          <p className="font-serif text-xl">{siteConfig.name}</p>
          <p className="text-sm text-muted-foreground text-pretty">
            Liquidación del inventario restante. Cada pedido se confirma por WhatsApp antes de
            realizar cualquier pago.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-eyebrow text-muted-foreground">Contacto</h3>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp +{siteConfig.whatsapp}
          </a>
          {!isPendiente(siteConfig.instagram) ? (
            <a
              href={`https://instagram.com/${siteConfig.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <Camera className="size-4" aria-hidden="true" />@{siteConfig.instagram}
            </a>
          ) : null}
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            <PendingValue value={siteConfig.city} />
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-eyebrow text-muted-foreground">Entrega y cambios</h3>
          <p className="text-sm text-muted-foreground">
            Cobertura: <PendingValue value={siteConfig.shippingCoverage} />
          </p>
          <p className="text-sm text-muted-foreground">
            Cambios: <PendingValue value={siteConfig.exchangePolicy} />
          </p>
          <Link
            href="/entregas-y-pagos"
            className="text-sm underline underline-offset-4 hover:no-underline"
          >
            Ver entregas y pagos
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-eyebrow text-muted-foreground">Información</h3>
          <Link href="/catalogo" className="text-sm text-muted-foreground hover:text-foreground">
            Catálogo
          </Link>
          <Link
            href="/como-comprar"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cómo comprar
          </Link>
          <Link href="/terminos" className="text-sm text-muted-foreground hover:text-foreground">
            Términos y condiciones
          </Link>
          <Link
            href="/tratamiento-de-datos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Política de tratamiento de datos
          </Link>
        </div>
      </div>

      <div className="border-t px-4 py-5 md:px-6">
        <p className="mx-auto max-w-7xl text-xs text-muted-foreground">
          © {year} {siteConfig.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
