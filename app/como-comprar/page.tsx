import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, MessageCircle } from "lucide-react"

import { WhatsAppButton } from "@/components/whatsapp-button"
import { buttonVariants } from "@/components/ui/button"
import {
  generalWhatsAppMessage,
  siteConfig,
} from "@/lib/site-config"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: `Cómo comprar | ${siteConfig.name}`,
  description:
    "Conoce cómo elegir tus prendas, enviar tu selección por WhatsApp y confirmar el pago y la entrega.",
}

const steps = [
  {
    number: "01",
    title: "Explora el catálogo",
    description:
      "Filtra las prendas por categoría, talla, color o precio. Abre cada producto para revisar sus fotografías, características y unidades disponibles.",
  },
  {
    number: "02",
    title: "Elige la talla",
    description:
      "Selecciona la talla disponible y agrega a tu selección todas las prendas que te interesen.",
  },
  {
    number: "03",
    title: "Revisa tu selección",
    description:
      "Abre el ícono de la bolsa para revisar los códigos, tallas, cantidades y el valor estimado de tu pedido.",
  },
  {
    number: "04",
    title: "Envía el pedido por WhatsApp",
    description:
      "La página genera automáticamente un mensaje con tu selección para que podamos atenderte directamente.",
  },
  {
    number: "05",
    title: "Confirma antes de pagar",
    description:
      "Verificamos que las prendas sigan disponibles y confirmamos el valor total, el medio de pago y la forma de entrega.",
  },
]

const importantInformation = [
  {
    title: "Tallas y medidas",
    body: siteConfig.sizeGuide,
  },
  {
    title: "Confirmación del pedido",
    body: siteConfig.orderConfirmation,
  },
  {
    title: "Formas de pago",
    body: siteConfig.paymentMethods,
  },
  {
    title: "Envíos y recogida",
    body: `${siteConfig.shippingCoverage}. ${siteConfig.shippingCost}. ${siteConfig.pickup}`,
  },
]

export default function ComoComprarPage() {
  return (
    <main>
      <section className="border-b bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-eyebrow text-muted-foreground">
              Cómo comprar
            </span>

            <h1 className="font-serif text-4xl tracking-tight text-balance md:text-6xl">
              Elige tus prendas y confirma todo por WhatsApp
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              En Glamm Moda no tienes que pagar directamente en la página.
              Primero eliges tus prendas y después confirmamos contigo la
              disponibilidad, el pago y la entrega.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/catalogo"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-none px-6",
              )}
            >
              Ver catálogo
            </Link>

            <WhatsAppButton
              message={generalWhatsAppMessage()}
              source="pagina-como-comprar"
              variant="outline"
              className="h-11 rounded-none px-6"
            >
              <MessageCircle aria-hidden="true" />
              Pedir ayuda por WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <span className="text-eyebrow text-muted-foreground">
            Paso a paso
          </span>

          <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance md:text-4xl">
            Comprar es fácil
          </h2>
        </div>

        <ol className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex min-h-56 flex-col border bg-card p-5"
            >
              <span className="font-serif text-3xl text-muted-foreground tabular-nums">
                {step.number}
              </span>

              <h3 className="mt-6 text-base font-medium">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="max-w-2xl">
            <span className="text-eyebrow text-muted-foreground">
              Antes de confirmar
            </span>

            <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance md:text-4xl">
              Información importante
            </h2>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden border bg-border md:grid-cols-2">
            {importantInformation.map((item) => (
              <article
                key={item.title}
                className="bg-background p-5 md:p-6"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />

                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="border p-5 md:p-7">
            <span className="text-eyebrow text-muted-foreground">
              Liquidación
            </span>

            <h2 className="mt-2 font-serif text-2xl tracking-tight">
              Disponibilidad limitada
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.clearanceTerms}
            </p>
          </article>

          <article className="border p-5 md:p-7">
            <span className="text-eyebrow text-muted-foreground">
              Cambios y reclamaciones
            </span>

            <h2 className="mt-2 font-serif text-2xl tracking-tight">
              Revisa bien antes de comprar
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.exchangePolicy}
            </p>
          </article>
        </div>

        <div className="mt-6 border bg-card p-5 text-center md:p-8">
          <p className="text-sm text-muted-foreground">
            Horario de atención
          </p>

          <p className="mt-1 font-medium">
            {siteConfig.businessHours}
          </p>

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-none px-6",
              )}
            >
              Elegir mis prendas
            </Link>

            <WhatsAppButton
              message={generalWhatsAppMessage()}
              source="final-como-comprar"
              variant="outline"
              className="h-11 rounded-none px-6"
            >
              Hablar por WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </section>
    </main>
  )
}
