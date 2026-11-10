import { useState } from 'react'
import { Intro } from '../sections/Intro'
import { HeroCabinet } from '../sections/HeroCabinet'
import { TodaysFavourites, ShopByCategory, FeaturedRow, PosterBand, FullMenuPreview, ValueStrip, OutletsSection } from '../sections/HomeSections'
import { Instagram } from '../sections/Instagram'
import { productsIn, bestSellers } from '../content/products'

export function Home() {
  const [ready, setReady] = useState(false)
  return (
    <>
      <Intro onDone={() => setReady(true)} />
      <HeroCabinet ready={ready} />
      <TodaysFavourites />
      <ShopByCategory />
      <FeaturedRow title="Celebration cakes" lede="Rosettes, gateaux and rainbow layers. Made to order, with your message on top." items={productsIn('celebration-cakes')} to="/menu/celebration-cakes" tone="icing" />
      <FeaturedRow title="Top selling" lede="What the cabinet runs out of first." items={bestSellers} to="/menu" />
      <PosterBand />
      <FullMenuPreview />
      <ValueStrip />
      <Instagram />
      <OutletsSection />
    </>
  )
}
