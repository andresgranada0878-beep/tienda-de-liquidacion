import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PendingValue } from "@/components/pending-value"
import { siteConfig } from "@/lib/site-config"

export function Faq() {
  const items: { q: string; a: React.ReactNode }[] = [
    {
      q: "¿Las prendas siguen disponibles?",
      a: "El catálogo muestra el inventario publicado y las unidades restantes de cada prenda. Como es una liquidación sin reposición, la disponibilidad final siempre se confirma por WhatsApp antes del pago.",
    },
    {
      q: "¿Cómo selecciono mi talla?",
      a: <PendingValue value={siteConfig.sizeGuide} />,
    },
    {
      q: "¿Puedo elegir varias prendas?",
      a: "Sí. Puedes agregar todas las prendas que quieras a tu selección y enviarlas en un solo mensaje de WhatsApp con códigos, tallas, cantidades y total estimado.",
    },
    {
      q: "¿Cómo confirmo el pedido?",
      a: <PendingValue value={siteConfig.orderConfirmation} />,
    },
    {
      q: "¿Cómo puedo pagar?",
      a: <PendingValue value={siteConfig.paymentMethods} />,
    },
    {
      q: "¿Realizan envíos?",
      a: <PendingValue value={siteConfig.shippingCoverage} />,
    },
    {
      q: "¿Puedo recoger el pedido?",
      a: <PendingValue value={siteConfig.pickup} />,
    },
    {
      q: "¿Las prendas tienen cambio?",
      a: <PendingValue value={siteConfig.exchangePolicy} />,
    },
    {
      q: "¿Qué pasa si otra persona compra primero?",
      a: "Las prendas se asignan en el orden en que se confirman por WhatsApp. Si una prenda ya fue vendida, te avisamos de inmediato y te ayudamos a buscar una alternativa disponible.",
    },
  ]

  return (
    <section
      id="preguntas"
      className="mx-auto w-full max-w-3xl px-4 py-14 md:px-6 md:py-20"
      aria-label="Preguntas frecuentes"
    >
      <div className="flex flex-col gap-2">
        <span className="text-eyebrow text-muted-foreground">Preguntas frecuentes</span>
        <h2 className="font-serif text-3xl tracking-tight text-balance md:text-4xl">
          Antes de escribirnos
        </h2>
      </div>

      <Accordion className="mt-8">
        {items.map((item) => (
          <AccordionItem key={item.q}>
            <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
            <AccordionContent>
              <p className="pb-4 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.a}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
