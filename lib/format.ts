const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

/** Formatea un valor en pesos colombianos: $49.900 */
export function formatCOP(value: number) {
  return cop.format(Math.round(value || 0)).replace(/\u00a0/g, " ")
}
