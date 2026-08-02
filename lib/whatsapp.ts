import type { SelectionItem } from "@/components/selection/selection-provider"
import { formatCOP } from "@/lib/format"
import { siteConfig } from "@/lib/site-config"

export function productUrl(slug: string) {
  return `${siteConfig.url}/producto/${slug}`
}

/** Construye el mensaje del pedido completo. */
export function buildOrderMessage(items: SelectionItem[]) {
  const lines: string[] = ["Hola, quiero confirmar la disponibilidad de estas prendas:", ""]

  items.forEach((item, index) => {
    const subtotal = item.price * item.quantity
    lines.push(`${index + 1}. ${item.code} ${item.name}`)
    lines.push(`Talla: ${item.size}`)
    lines.push(`Cantidad: ${item.quantity}`)
    lines.push(`Precio: ${formatCOP(item.price)}`)
    lines.push(`Subtotal: ${formatCOP(subtotal)}`)
    lines.push(productUrl(item.slug))
    lines.push("")
  })

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  lines.push(`Total estimado: ${formatCOP(total)}`)
  lines.push("")
  lines.push("Mi nombre es:")
  lines.push("Ciudad:")
  lines.push("Forma de entrega:")
  lines.push("")
  lines.push("Entiendo que la disponibilidad debe confirmarse antes de realizar el pago.")

  return lines.join("\n")
}

/** Mensaje para una sola prenda desde la tarjeta o el detalle. */
export function buildSingleProductMessage(input: {
  code: string
  name: string
  slug: string
  size?: string
  price: number
}) {
  const lines = [
    "Hola, quiero confirmar la disponibilidad de esta prenda:",
    "",
    `${input.code} ${input.name}`,
  ]
  if (input.size) lines.push(`Talla: ${input.size}`)
  lines.push(`Precio: ${formatCOP(input.price)}`)
  lines.push(productUrl(input.slug))
  lines.push("")
  lines.push("Mi nombre es:")
  lines.push("Ciudad:")
  lines.push("Forma de entrega:")
  lines.push("")
  lines.push("Entiendo que la disponibilidad debe confirmarse antes de realizar el pago.")
  return lines.join("\n")
}
