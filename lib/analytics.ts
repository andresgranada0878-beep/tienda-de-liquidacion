"use client"

/**
 * Capa de medición comercial.
 *
 * No instala ningún pixel ficticio: si NEXT_PUBLIC_META_PIXEL_ID está vacío,
 * los eventos solo quedan disponibles en consola durante el desarrollo.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ""

export type CatalogEvent =
  | "ViewCatalog"
  | "Search"
  | "ViewProduct"
  | "SelectSize"
  | "AddItem"
  | "RemoveItem"
  | "StartOrder"
  | "WhatsAppClick"
  | "ShareProduct"

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const
const UTM_STORAGE_KEY = "tienda:utm"

export type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>

/** Guarda los parámetros UTM de la primera visita para conservarlos al navegar. */
export function captureUtm(): Utm {
  if (typeof window === "undefined") return {}
  try {
    const params = new URLSearchParams(window.location.search)
    const incoming: Utm = {}
    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) incoming[key] = value
    }
    if (Object.keys(incoming).length > 0) {
      window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(incoming))
      return incoming
    }
    return getUtm()
  } catch {
    return {}
  }
}

export function getUtm(): Utm {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(UTM_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Utm) : {}
  } catch {
    return {}
  }
}

type Fbq = (...args: unknown[]) => void

export function track(event: CatalogEvent, data: Record<string, unknown> = {}) {
  const payload = { ...data, ...getUtm() }

  if (typeof window !== "undefined") {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq
    if (META_PIXEL_ID && typeof fbq === "function") {
      fbq("trackCustom", event, payload)
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[v0] evento: ${event}`, payload)
  }
}
