"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"

import { useSelection } from "@/components/selection/selection-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getUtm, track } from "@/lib/analytics"
import { formatCOP } from "@/lib/format"
import { siteConfig, whatsappUrl } from "@/lib/site-config"
import { buildOrderMessage } from "@/lib/whatsapp"

export function SelectionSheet() {
  const { items, count, total, isOpen, setOpen, remove, setQuantity, clear } = useSelection()

  function handleSend() {
    track("StartOrder", { items: items.length, total })
    track("WhatsAppClick", { source: "seleccion" })
    const url = whatsappUrl(buildOrderMessage(items), getUtm() as Record<string, string>)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-serif text-xl">Mi selección</SheetTitle>
          <SheetDescription>
            {count > 0
              ? `${count} ${count === 1 ? "prenda" : "prendas"} · total estimado ${formatCOP(total)}`
              : "Aún no has agregado prendas."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground text-pretty">
              Agrega las prendas que te interesen y envíanos tu selección por WhatsApp para
              confirmar disponibilidad.
            </p>
            <Link
              href="/catalogo"
              onClick={() => setOpen(false)}
              className="text-sm font-medium underline underline-offset-4"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li
                    key={`${item.slug}-${item.size}`}
                    className="flex gap-3 border-b border-border/60 px-5 py-4"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium leading-tight">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Ref. {item.code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.color ? item.color + " · " : ""}Talla {item.size}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Quitar ${item.name} talla ${item.size}`}
                          onClick={() => remove(item.slug, item.size)}
                        >
                          <X aria-hidden="true" />
                        </Button>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        {item.stock > 1 ? (
                          <div className="flex items-center border">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-none"
                              aria-label="Disminuir cantidad"
                              disabled={item.quantity <= 1}
                              onClick={() =>
                                setQuantity(item.slug, item.size, item.quantity - 1)
                              }
                            >
                              <Minus aria-hidden="true" />
                            </Button>
                            <span className="w-8 text-center text-sm tabular-nums">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-none"
                              aria-label="Aumentar cantidad"
                              disabled={item.quantity >= item.stock}
                              onClick={() =>
                                setQuantity(item.slug, item.size, item.quantity + 1)
                              }
                            >
                              <Plus aria-hidden="true" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unidad única</span>
                        )}

                        <div className="text-right">
                          <p className="text-sm font-medium tabular-nums">
                            {formatCOP(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 ? (
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {formatCOP(item.price)} c/u
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t bg-card px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-eyebrow text-muted-foreground">Total estimado</span>
                <span className="font-serif text-2xl tabular-nums">{formatCOP(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-pretty">
                El valor total es estimado. Confirmamos la disponibilidad, el envío y la forma de pago por
                WhatsApp antes de cualquier pago.
              </p>
              <Button
                size="lg"
                className="h-12 rounded-none text-sm"
                onClick={handleSend}
              >
                Enviar selección por WhatsApp
              </Button>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="self-start text-muted-foreground"
                onClick={clear}
              >
                <Trash2 data-icon="inline-start" aria-hidden="true" />
                Vaciar la selección
              </Button>
              <p className="text-xs text-muted-foreground">
                Atención de {siteConfig.name} por WhatsApp.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
