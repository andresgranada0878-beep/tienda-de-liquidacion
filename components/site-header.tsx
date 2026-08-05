"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, ShoppingBag } from "lucide-react"

import { useSelection } from "@/components/selection/selection-provider"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { generalWhatsAppMessage, navLinks, siteConfig } from "@/lib/site-config"

export function SiteHeader() {
  const { count, setOpen } = useSelection()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleLinks = navLinks.filter((link) => link.href !== "/")

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_1px_0_0_var(--border)]",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 md:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menú"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>

          <SheetContent side="left" className="p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="font-serif text-lg">{siteConfig.name}</SheetTitle>
              <SheetDescription>{siteConfig.tagline}</SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col px-2 py-2" aria-label="Menú principal">
              {visibleLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-none px-3 py-3 text-sm hover:bg-muted"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>

            <Separator />

            <div className="p-4">
              <WhatsAppButton
                message={generalWhatsAppMessage()}
                source="menu-movil"
                className="w-full"
              />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex min-w-0 flex-col leading-none">
          <span className="truncate font-serif text-lg tracking-tight">
            {siteConfig.name}
          </span>
          <span className="hidden text-eyebrow text-muted-foreground sm:block">
            {siteConfig.tagline}
          </span>
        </Link>

        <nav
          className="ml-7 hidden items-center gap-6 lg:flex"
          aria-label="Navegación principal"
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <WhatsAppButton
            message={generalWhatsAppMessage()}
            source="encabezado"
            variant="default"
            className="hidden h-9 px-4 md:inline-flex"
          >
            Comprar por WhatsApp
          </WhatsAppButton>

          <Button
            variant="outline"
            size="icon"
            className="relative rounded-none"
            aria-label={`Mi selección, ${count} ${count === 1 ? "prenda" : "prendas"}`}
            onClick={() => setOpen(true)}
          >
            <ShoppingBag aria-hidden="true" />

            {count > 0 ? (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-medium text-primary-foreground tabular-nums">
                {count}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </header>
  )
}
