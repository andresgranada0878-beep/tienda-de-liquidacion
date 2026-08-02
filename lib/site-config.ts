/**
 * ÚNICO ARCHIVO QUE DEBES EDITAR PARA CAMBIAR LOS DATOS DEL NEGOCIO.
 *
 * Todo lo que aparezca como "PENDIENTE POR COMPLETAR" se muestra en la página
 * marcado claramente como pendiente. No se inventa ninguna política ni dato.
 */

export const PENDIENTE = "PENDIENTE POR COMPLETAR"

export const siteConfig = {
  /** Nombre comercial de la tienda. */
  name: "NOMBRE DE LA TIENDA",
  /** Frase corta de apoyo. */
  tagline: "Liquidación de inventario",
  /** Número de WhatsApp con código de país, sin espacios ni signos. Ej: 573001234567 */
  whatsapp: "573000000000",
  /** Usuario de Instagram sin @. */
  instagram: "usuario_instagram",
  /** Ciudad de la tienda. */
  city: PENDIENTE,
  /** Cobertura de envíos. */
  shippingCoverage: PENDIENTE,
  /** Costos de envío. */
  shippingCost: PENDIENTE,
  /** Tiempos de entrega. */
  shippingTime: PENDIENTE,
  /** Recogida presencial: sí, no o condiciones. */
  pickup: PENDIENTE,
  /** Formas de pago. */
  paymentMethods: PENDIENTE,
  /** Política de cambios. */
  exchangePolicy: PENDIENTE,
  /** Condiciones de la liquidación. */
  clearanceTerms: PENDIENTE,
  /** Estado general de las prendas. */
  itemsCondition: PENDIENTE,
  /** Cómo confirmamos el pedido. */
  orderConfirmation:
    "Todo pedido se confirma por WhatsApp antes de realizar cualquier pago. Confirmamos disponibilidad, total y forma de entrega.",
  /** Cómo elegir la talla. */
  sizeGuide:
    "Cada prenda incluye sus medidas en la ficha del producto. Si tienes dudas, escríbenos por WhatsApp y te ayudamos a elegir.",
  /** URL pública del sitio (usada para SEO, Open Graph y enlaces compartidos). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://liquidacion.example.com",
  currency: "COP",
} as const

export function isPendiente(value: string) {
  return value.trim() === PENDIENTE
}

export const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/como-comprar", label: "Cómo comprar" },
  { href: "/entregas-y-pagos", label: "Entregas y pagos" },
]

/** Mensaje del botón flotante / ayuda general. */
export function generalWhatsAppMessage() {
  return `Hola, vi el catálogo de ${siteConfig.name} y necesito ayuda para elegir una prenda.`
}

export function whatsappUrl(message: string, utm?: Record<string, string>) {
  const utmLine =
    utm && Object.keys(utm).length > 0
      ? `\n\n(Origen: ${Object.entries(utm)
          .map(([k, v]) => `${k}=${v}`)
          .join(", ")})`
      : ""
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message + utmLine)}`
}
