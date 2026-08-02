import { PendingValue } from "@/components/pending-value"
import { siteConfig } from "@/lib/site-config"

const blocks = [
  { title: "Cobertura de envíos", value: siteConfig.shippingCoverage },
  { title: "Costos de envío", value: siteConfig.shippingCost },
  { title: "Tiempos de entrega", value: siteConfig.shippingTime },
  { title: "Recogida presencial", value: siteConfig.pickup },
  { title: "Formas de pago", value: siteConfig.paymentMethods },
  { title: "Confirmación del pedido", value: siteConfig.orderConfirmation },
  { title: "Cambios", value: siteConfig.exchangePolicy },
  { title: "Condiciones de liquidación", value: siteConfig.clearanceTerms },
  { title: "Selección de talla", value: siteConfig.sizeGuide },
  { title: "Estado de las prendas", value: siteConfig.itemsCondition },
]

export function DeliveryInfo({ heading = true }: { heading?: boolean }) {
  return (
    <section
      id="entregas"
      className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20"
      aria-label="Entrega, pago y cambios"
    >
      {heading ? (
        <div className="flex flex-col gap-2">
          <span className="text-eyebrow text-muted-foreground">Entrega, pago y cambios</span>
          <h2 className="font-serif text-3xl tracking-tight text-balance md:text-4xl">
            Todo claro antes de comprar
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty">
            Solo publicamos información confirmada. Los campos marcados como pendientes se
            completan desde el archivo de configuración de la tienda.
          </p>
        </div>
      ) : null}

      <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <div key={block.title} className="flex flex-col gap-1.5 border-t pt-4">
            <dt className="text-eyebrow text-muted-foreground">{block.title}</dt>
            <dd className="text-sm leading-relaxed text-pretty">
              <PendingValue value={block.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
