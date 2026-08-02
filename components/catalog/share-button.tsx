"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

type Props = {
  slug: string
  name: string
  code: string
  className?: string
  withLabel?: boolean
  size?: "icon" | "icon-sm" | "icon-lg" | "sm" | "default" | "lg"
  variant?: "outline" | "ghost" | "secondary" | "default"
}

export function ShareButton({
  slug,
  name,
  code,
  className,
  withLabel = false,
  size = "icon-sm",
  variant = "ghost",
}: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/producto/${slug}`
    track("ShareProduct", { code })

    const shareData = { title: name, text: `${code} ${name}`, url }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // El usuario canceló: se intenta copiar el enlace.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt("Copia el enlace de la prenda:", url)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-none", className)}
      onClick={handleShare}
      aria-label={`Compartir ${name}`}
    >
      {copied ? (
        <Check data-icon={withLabel ? "inline-start" : undefined} aria-hidden="true" />
      ) : (
        <Share2 data-icon={withLabel ? "inline-start" : undefined} aria-hidden="true" />
      )}
      {withLabel ? (copied ? "Enlace copiado" : "Compartir") : null}
    </Button>
  )
}
