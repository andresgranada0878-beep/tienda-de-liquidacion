"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { captureUtm, track } from "@/lib/analytics"

export type SelectionItem = {
  code: string
  slug: string
  name: string
  size: string
  quantity: number
  price: number
  stock: number
  image: string
}

type SelectionContextValue = {
  items: SelectionItem[]
  count: number
  total: number
  ready: boolean
  add: (item: Omit<SelectionItem, "quantity">, quantity?: number) => void
  remove: (code: string, size: string) => void
  setQuantity: (code: string, size: string, quantity: number) => void
  clear: () => void
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const STORAGE_KEY = "tienda:seleccion"

const SelectionContext = createContext<SelectionContextValue | null>(null)

function keyOf(code: string, size: string) {
  return `${code}__${size}`
}

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SelectionItem[]>([])
  const [ready, setReady] = useState(false)
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed as SelectionItem[])
      }
    } catch {
      // Selección corrupta: se ignora y se empieza vacía.
    }
    captureUtm()
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Sin almacenamiento disponible: la selección solo vive en memoria.
    }
  }, [items, ready])

  const add = useCallback((item: Omit<SelectionItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const index = current.findIndex((i) => keyOf(i.code, i.size) === keyOf(item.code, item.size))
      if (index >= 0) {
        const next = [...current]
        const merged = Math.min(next[index].quantity + quantity, Math.max(1, item.stock))
        next[index] = { ...next[index], ...item, quantity: merged }
        return next
      }
      return [...current, { ...item, quantity: Math.min(quantity, Math.max(1, item.stock)) }]
    })
    track("AddItem", { code: item.code, size: item.size, price: item.price })
  }, [])

  const remove = useCallback((code: string, size: string) => {
    setItems((current) => current.filter((i) => keyOf(i.code, i.size) !== keyOf(code, size)))
    track("RemoveItem", { code, size })
  }, [])

  const setQuantity = useCallback((code: string, size: string, quantity: number) => {
    setItems((current) =>
      current.map((i) =>
        keyOf(i.code, i.size) === keyOf(code, size)
          ? { ...i, quantity: Math.max(1, Math.min(quantity, Math.max(1, i.stock))) }
          : i,
      ),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<SelectionContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0)
    return { items, count, total, ready, add, remove, setQuantity, clear, isOpen, setOpen }
  }, [items, ready, add, remove, setQuantity, clear, isOpen])

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (!context) throw new Error("useSelection debe usarse dentro de SelectionProvider")
  return context
}
