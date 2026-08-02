import { CategoryGrid } from "@/components/home/category-grid"
import { DeliveryInfo } from "@/components/home/delivery-info"
import { Faq } from "@/components/home/faq"
import { FeaturedProducts } from "@/components/home/featured-products"
import { Hero } from "@/components/home/hero"
import { HowToBuy } from "@/components/home/how-to-buy"
import { TrustBar } from "@/components/home/trust-bar"
import { DemoNotice } from "@/components/demo-notice"
import { getProducts } from "@/lib/catalog/get-products"

export const revalidate = 300

export default async function HomePage() {
  const catalog = await getProducts()

  const available = catalog.products.filter((p) => p.stock > 0)
  const featured = [
    ...available.filter((p) => p.featured),
    ...available.filter((p) => !p.featured),
  ].slice(0, 8)

  return (
    <>
      <DemoNotice isDemo={catalog.isDemo} />
      <Hero total={catalog.products.length} />
      <TrustBar />
      <FeaturedProducts products={featured} />
      <CategoryGrid categories={catalog.categories} />
      <HowToBuy />
      <DeliveryInfo />
      <Faq />
    </>
  )
}
