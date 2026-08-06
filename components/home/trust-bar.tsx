import {
  Camera,
  CreditCard,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { PendingValue } from "@/components/pending-value"
import { isPendiente, siteConfig } from "@/lib/site-config"

export function TrustBar() {
  const items = [
    {
      icon: Camera,
      title: "Imágenes ilustrativas",
      body: "Las imágenes son ilustrativas y pueden presentar ligeras variaciones de color, ajuste o detalles frente a la prenda física.",
    },
    {
      icon: MessageCircle,
      title: "Atención por WhatsApp",
      body: "Te acompañamos en la elección de talla y resolvemos dudas antes de comprar.",
    },
    {
      icon: Truck,
      title: "Envíos",
      body: isPendiente(siteConfig.shippingCoverage)
        ? "Cobertura de envíos pendiente por completar."
        : `${siteConfig.shippingCoverage}.`,
    },
    {
      icon: CreditCard,
      title: "Opciones de pago",
      body: isPendiente(siteConfig.paymentMethods)
        ? "Formas de pago pendientes por completar."
        : siteConfig.paymentMethods,
    },
    {
      icon: PackageCheck,
      title: "Inventario limitado",
      body: "No hay reposición: cuando una prenda se agota, desaparece del catálogo.",
    },
    {
      icon: ShieldCheck,
      title: "Compra sujeta a confirmación",
      body: "Verificamos la disponibilidad por WhatsApp antes de solicitar cualquier pago.",
    },
  ]

  return (
    <section
      aria-label="Información general de compra"
      className="border-y bg-card"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="max-w-2xl">
          <span className="text-eyebrow text-muted-foreground">
            Información general
          </span>

          <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance md:text-4xl">
            Todo claro antes de comprar
          </h2>
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />

              <div className="flex flex-col gap-1">
                <h3 className="font-sans text-sm font-medium">
                  {item.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t px-4 py-3 md:px-6">
        <p className="mx-auto max-w-7xl text-xs text-muted-foreground">
          Ciudad: <PendingValue value={siteConfig.city} /> · Recogida
          presencial: <PendingValue value={siteConfig.pickup} />
        </p>
      </div>
    </section>
  )
}
