/**
 * ÚNICO ARCHIVO QUE DEBES EDITAR PARA CAMBIAR LOS DATOS DEL NEGOCIO.
 *
 * Todo lo que aparezca como "PENDIENTE POR COMPLETAR" se muestra en la página
 * marcado claramente como pendiente. No se inventa ninguna política ni dato.
 */

export const PENDIENTE = "PENDIENTE POR COMPLETAR"

export const siteConfig = {
  /** Nombre comercial de la tienda. */
 name: "Glamm Moda",
tagline: "Últimas prendas, precios que enamoran",
whatsapp: "573011691705",
instagram: PENDIENTE,
city: "Sabaneta, Antioquia",
shippingCoverage: "Envíos disponibles en toda Colombia",
shippingCost: "El costo del domicilio o de la transportadora lo asume el comprador. Las entregas coordinadas en estaciones del Metro del Área Metropolitana no tienen costo.",
  /** Tiempo estimado de entrega. */
  shippingTime:
    "El tiempo de entrega depende de la ciudad de destino y de los tiempos establecidos por la transportadora seleccionada.",

  /** Recogida presencial: sí, no o condiciones. */
  pickup:
    "En Sabaneta puedes recoger tu pedido. En el Área Metropolitana también podemos coordinar entregas sin costo en estaciones del Metro o acordar un encuentro en un lugar público. Si prefieres domicilio, el costo lo asume el comprador.",

  /** Formas de pago. */
  paymentMethods:
    "Pago por transferencia mediante llave Bre-B, Nequi o Bancolombia. Los datos para realizar el pago se confirman únicamente por WhatsApp después de validar la disponibilidad del pedido.",

  /** Política de cambios. */
  exchangePolicy:
    "Por tratarse de prendas en liquidación, no realizamos cambios por talla, color o preferencia. Atendemos reclamaciones por defectos de fabricación. Las prendas tipo body no tienen cambio por razones de higiene, salvo que presenten un defecto de fabricación. La prenda debe conservarse sin uso, sin lavar y sin modificaciones. Esta política no limita los derechos legales del consumidor cuando resulten aplicables.",

  /** Condiciones de la liquidación. */
  clearanceTerms:
    "Los precios especiales estarán vigentes hasta agotar existencias. El inventario es limitado y la disponibilidad se confirma por WhatsApp antes de realizar el pago. Una prenda no se considera reservada hasta que el pedido y el pago hayan sido confirmados.",

  /** Estado general de las prendas. */
  itemsCondition:
    "Prendas nuevas provenientes del inventario restante de la tienda. El estado, talla, color y características particulares se indican en la ficha de cada producto.",

  /** Cómo confirmamos el pedido. */
  orderConfirmation:
    "Todo pedido se confirma por WhatsApp antes de realizar cualquier pago. Validamos la disponibilidad, las referencias, las tallas, el valor total, el medio de pago y la forma de entrega.",

  /** Cómo elegir la talla. */
  sizeGuide:
    "Revisa la talla y las medidas indicadas en la ficha de cada prenda. Si tienes dudas, escríbenos por WhatsApp antes de confirmar el pedido.",

  /** Horario de atención. */
  businessHours:
    "Lunes a domingo, de 8:00 a. m. a 7:00 p. m.",

  /** URL pública del sitio. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://glamm-moda.vercel.app",

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
