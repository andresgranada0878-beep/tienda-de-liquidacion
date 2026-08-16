import type { Metadata } from "next"

import { CatalogBrowser } from "@/components/catalog/catalog-browser"
import { DemoNotice } from "@/components/demo-notice"
import { getProducts } from "@/lib/catalog/get-products"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Catálogo | Glamm Moda",
  description:
    "Consulta las prendas, tallas, colores y precios disponibles en Glamm Moda.",
}

export default async function CatalogPage() {
  const catalog = await getProducts()

  return (
    <>
      <DemoNotice isDemo={catalog.isDemo} />
      <CatalogBrowser catalog={catalog} />
    </>
  )
}