const steps = [
  {
    title: "Elige tus prendas",
    body: "Filtra por categoría, talla, color o precio y agrega a tu selección todo lo que te interese.",
  },
  {
    title: "Envía tu selección por WhatsApp",
    body: "Generamos automáticamente el mensaje con códigos, tallas, cantidades y total estimado.",
  },
  {
    title: "Confirma la disponibilidad, el pago y la entrega",
    body: "Verificamos que las prendas sigan disponibles y acordamos la forma de pago y de entrega.",
  },
]

export function HowToBuy() {
  return (
    <section className="border-y bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="flex flex-col gap-2">
          <span className="text-eyebrow text-muted-foreground">Cómo comprar</span>
          <h2 className="font-serif text-3xl tracking-tight text-balance md:text-4xl">
            Tres pasos y listo
          </h2>
        </div>

        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 border-t pt-5">
              <span className="font-serif text-3xl text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-sans text-base font-medium text-balance">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
