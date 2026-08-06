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

  const available = catalog.products.filter((product) => product.stock > 0)

  const featured = [
    ...available.filter((product) => product.featured),
    ...available.filter((product) => !product.featured),
  ].slice(0, 8)

  return (
    <>
      <DemoNotice isDemo={catalog.isDemo} />

      <Hero
        products={available}
        categories={catalog.categories}
      />

      <FeaturedProducts products={featured} />

      <TrustBar />

      <HowToBuy />

      <DeliveryInfo />

      <Faq />
    </>
  )
}
