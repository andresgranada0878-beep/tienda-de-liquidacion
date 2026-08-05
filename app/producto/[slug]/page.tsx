import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetail } from "@/components/catalog/product-detail"
import { getProductBySlug } from "@/lib/catalog/get-products"

export const revalidate = 300

type ProductPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const { product } = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Prenda no encontrada | Glamm Moda",
    }
  }

  return {
    title: `${product.name} | Glamm Moda`,
    description:
      product.description ||
      `${product.name}, referencia ${product.code}, disponible en Glamm Moda.`,
  }
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params
  const { product } = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}
