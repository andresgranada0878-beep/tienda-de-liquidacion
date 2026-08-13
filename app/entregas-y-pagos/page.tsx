import type { Metadata } from "next"
import Link from "next/link"
import { CreditCard, MapPin, Package, TrainFront } from "lucide-react"

import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Entregas y pagos | Glamm Moda",
  description:
    "Conoce las opciones de entrega, envío y pago disponibles en Glamm Moda.",
}

export default function EntregasYPagosPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-16">
      <div className="max-w-2xl">
        <p className="text-eyebrow text-muted-foreground">Glamm Moda</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
          Entregas y pagos
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Antes de realizar cualquier pago confirmamos por WhatsApp que las
          prendas de tu selección continúen disponibles.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="border p-6">
          <TrainFront className="size-6" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-2xl">Área Metropolitana</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Podemos coordinar la entrega de tu pedido en una estación del
            Metro sin cobro de domicilio. También podemos acordar un
            encuentro en un lugar público, sujeto a coordinación previa.
          </p>
        </section>

        <section className="border p-6">
          <MapPin className="size-6" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-2xl">Recogida en Sabaneta</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Puedes recoger tu pedido en Sabaneta coordinando previamente por
            WhatsApp el lugar y la hora de entrega.
          </p>
        </section>

        <section className="border p-6">
          <Package className="size-6" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-2xl">Domicilios y envíos</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Realizamos envíos a toda Colombia. Si deseas domicilio en el
            Área Metropolitana o envío mediante transportadora a otra
            ciudad, el costo correspondiente lo asume el comprador.
          </p>
        </section>

        <section className="border p-6">
          <CreditCard className="size-6" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-2xl">Formas de pago</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Puedes pagar mediante transferencia por llave Bre-B, Nequi o
            Bancolombia. Los datos de pago se entregan por WhatsApp una vez
            confirmemos la disponibilidad de las prendas.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {siteConfig.orderConfirmation}
        </p>

        <Link
          href="/catalogo"
          className="mt-6 inline-flex text-sm font-medium underline underline-offset-4"
        >
          Ver catálogo
        </Link>
      </div>
    </main>
  )
}
