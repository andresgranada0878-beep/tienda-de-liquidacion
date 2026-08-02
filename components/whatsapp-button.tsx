"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getUtm, track, type Utm } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/site-config"

type Props = {
  message: string
  /** Origen del clic para la medición. Ej: "encabezado", "detalle-producto". */
  source: string
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
}

export function WhatsAppButton({
  message,
  source,
  children = "Comprar por WhatsApp",
  className,
  variant = "default",
  size = "lg",
  showIcon = true,
}: Props) {
  const [utm, setUtm] = useState<Utm>({})

  useEffect(() => {
    setUtm(getUtm())
  }, [])

  function handleClick() {
    track("WhatsAppClick", { source })
  }

  return (
    <Button
      nativeButton={false}
      variant={variant}
      size={size}
      className={cn("h-11 rounded-none px-5 text-sm", className)}
      render={
        <a
          href={whatsappUrl(message, utm as Record<string, string>)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        />
      }
    >
      {showIcon ? <MessageCircle data-icon="inline-start" aria-hidden="true" /> : null}
      {children}
    </Button>
  )
}
