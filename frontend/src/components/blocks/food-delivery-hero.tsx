import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { ChevronRight, Search, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface FoodDeliveryHeroProps {
  onSearch?: (searchTerm: string) => void
  videoUrl?: string // Optional: Custom video URL
}

export function FoodDeliveryHero({ onSearch, videoUrl }: FoodDeliveryHeroProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  
  // Default video URL - you can change this or pass a custom one via props
  const defaultVideoUrl = "/videos/hero-video.mp4"
  const backgroundVideoUrl = videoUrl || defaultVideoUrl

  const partnerLogos = [
    { name: "McDonald's", tagline: "Worldwide Favourites", logo: "/brands/mcdonalds.png" },
    { name: "Domino's Pizza", tagline: "30-Min Delivery", logo: "/brands/dominos.png" },
    { name: "Subway", tagline: "Fresh & Healthy", logo: "/brands/subway.png" },
    { name: "Starbucks", tagline: "Coffee Culture", logo: "/brands/starbucks.png" },
    { name: "Pizza Hut", tagline: "Pan Crust Classics", logo: "/brands/pizzahut.png" },
    { name: "Burger King", tagline: "Flame-Grilled", logo: "/brands/burgerking.png" },
    { name: "KFC", tagline: "Original Recipe", logo: "/brands/kfc.png" },
    { name: "Dunkin'", tagline: "Coffee & Donuts", logo: "/brands/dunkin.png" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim())
    }
  }

  return (
    <div className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px]">
      <main className="overflow-x-hidden">
        <section className="relative">
          {/* Video Background with Better Clarity */}
          {backgroundVideoUrl && (
            <div className="absolute inset-0 w-full h-full">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src={backgroundVideoUrl}>
                Your browser does not support the video tag.
              </video>
              {/* Gradient Overlay for Better Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            </div>
          )}

          {/* Content Overlay */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center min-h-[600px] md:min-h-[700px] lg:min-h-[800px] py-24 md:py-32">
              <div className="max-w-3xl">
                {/* Main Heading - More Prominent */}
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-2xl"
                >
                  Hungry? You're<br />
                  <span className="text-primary-400">in the right place!</span>
                </motion.h1>
                
                {/* Subtitle - Clearer */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl drop-shadow-lg"
                >
                  Order delicious food from your favorite restaurants and get it delivered to your doorstep in minutes.
                </motion.p>

                {/* Search Bar - More Prominent */}
                <motion.form 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  onSubmit={handleSearch} 
                  className="mb-8 max-w-2xl"
                >
                  <div className="flex gap-3 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
                      <input
                        type="text"
                        placeholder="Search restaurants, cuisines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-base bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-500 font-medium"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-auto px-8 py-4 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <span className="text-nowrap">Search</span>
                    </Button>
                  </div>
                </motion.form>

                {/* Action Buttons - Stunning Design */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <Button
                    asChild
                    size="lg"
                    className="group h-14 rounded-xl px-8 text-base font-semibold shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:scale-105 border-0"
                  >
                    <Link to="/restaurants">
                      <span className="text-nowrap">Browse Restaurants</span>
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="group h-14 rounded-xl px-8 text-base font-semibold border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-md bg-white/10 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Link to="/recommendations">
                      <Sparkles className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span className="text-nowrap">Get Recommendations</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Logos Section - Cleaner */}
        <section className="relative z-10 bg-white/95 backdrop-blur-sm border-t border-gray-200">
          <div className="group relative m-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:pr-6 mb-4 md:mb-0">
                <p className="text-center md:text-end text-sm font-medium text-gray-600">Trusted by top restaurants</p>
              </div>
              <div className="relative py-4 md:py-0 md:w-[calc(100%-11rem)]">
                <InfiniteSlider
                  speedOnHover={20}
                  speed={40}
                  gap={112}
                >
                  {partnerLogos.map((brand) => (
                    <div
                      key={brand.name}
                      className="flex flex-col items-center text-center px-6"
                    >
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-10 w-auto object-contain mb-2 opacity-90"
                        loading="lazy"
                      />
                      <span className="font-semibold text-base text-gray-800">
                        {brand.name}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {brand.tagline}
                      </p>
                    </div>
                  ))}
                </InfiniteSlider>

                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
