import { Camera, CreditCard, MessageCircle, PackageCheck, ShieldCheck, Truck } from "lucide-react"

import { PendingValue } from "@/components/pending-value"
import { isPendiente, siteConfig } from "@/lib/site-config"

export function TrustBar() {
  const items = [
    {
      icon: Camera,
      title: "Fotografías reales",
      body: "Cada prenda se muestra con sus propias fotografías, tal como está.",
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
        : `Enviamos a ${siteConfig.shippingCoverage}.`,
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
      body: "Verificamos disponibilidad por WhatsApp antes de solicitar cualquier pago.",
    },
  ]

  return (
    <section aria-label="Por qué comprar con nosotros" className="border-b bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-x-8 gap-y-6 px-4 py-10 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <item.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <h3 className="font-sans text-sm font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t px-4 py-3 md:px-6">
        <p className="mx-auto max-w-7xl text-xs text-muted-foreground">
          Ciudad: <PendingValue value={siteConfig.city} /> · Recogida presencial:{" "}
          <PendingValue value={siteConfig.pickup} />
        </p>
      </div>
    </section>
  )
}
