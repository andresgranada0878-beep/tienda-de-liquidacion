import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import { MetaPixel } from "@/components/meta-pixel"
import { SelectionProvider } from "@/components/selection/selection-provider"
import { SelectionSheet } from "@/components/selection/selection-sheet"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { siteConfig } from "@/lib/site-config"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · Últimas prendas disponibles`,
    template: `%s · ${siteConfig.name}`,
  },
  description:
    "Liquidación del inventario restante. Explora el catálogo, arma tu pedido y confírmalo por WhatsApp. Prendas limitadas a precios especiales.",
  applicationName: siteConfig.name,
  generator: "v0.app",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: siteConfig.name,
    title: `${siteConfig.name} · Últimas prendas disponibles`,
    description:
      "Encuentra prendas a precios especiales y arma tu pedido antes de que se agoten. Confirmación por WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbfaf8",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`bg-background ${inter.variable} ${playfair.variable}`}>
      <body>
        <SelectionProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Ir al contenido
          </a>
          <SiteHeader />
          <main id="contenido">{children}</main>
          <SiteFooter />
          <SelectionSheet />
          <WhatsAppFloat />
        </SelectionProvider>
        <MetaPixel />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
