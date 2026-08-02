"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"

import { getUtm, track, type Utm } from "@/lib/analytics"
import { generalWhatsAppMessage, whatsappUrl } from "@/lib/site-config"

export function WhatsAppFloat() {
  const [utm, setUtm] = useState<Utm>({})

  useEffect(() => {
    setUtm(getUtm())
  }, [])

  return (
    <a
      href={whatsappUrl(generalWhatsAppMessage(), utm as Record<string, string>)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("WhatsAppClick", { source: "flotante" })}
      aria-label="Escribirnos por WhatsApp"
      className="fixed bottom-5 right-4 z-30 flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:bottom-6 md:right-6"
    >
      <MessageCircle className="size-5" aria-hidden="true" />
    </a>
  )
}
