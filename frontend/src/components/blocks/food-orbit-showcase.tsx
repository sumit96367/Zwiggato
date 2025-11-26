import React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import {
  Flame,
  Pizza,
  Sandwich,
  Beef,
  Coffee,
  IceCream2,
  Soup,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type OrbitNode = {
  id: number
  title: string
  restaurant: string
  month: string
  status: "TRENDING" | "CHEF PICK" | "NEW"
  description: string
  energy: number
  eta: string
  price: string
  icon: React.ReactNode
  accent: string
  connected: string[]
  image: string
}

const nodes: OrbitNode[] = [
  {
    id: 1,
    title: "Smoked Paneer Royale",
    restaurant: "Bombay Burger Lab",
    month: "May · 2024",
    status: "TRENDING",
    description: "Charcoal grilled paneer, ghost pepper aioli and toasted brioche.",
    energy: 86,
    eta: "22 mins",
    price: "₹329",
    icon: <Flame className="w-5 h-5" />,
    accent: "from-[#f97316] to-[#fb923c]",
    connected: ["Truffle Fries", "Rosemary Lemonade"],
    image:
      "https://images.unsplash.com/photo-1723473620176-8d26dc6314cf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    title: "Midnight Pepperoni",
    restaurant: "Slice Society",
    month: "May · 2024",
    status: "CHEF PICK",
    description: "Cold fermented dough, double pepperoni and smoked provolone.",
    energy: 74,
    eta: "26 mins",
    price: "₹489",
    icon: <Pizza className="w-5 h-5" />,
    accent: "from-[#7c3aed] to-[#a855f7]",
    connected: ["Burnt Garlic Dip", "Draft Cola"],
    image:
      "https://plus.unsplash.com/premium_photo-1667682942148-a0c98d1d70db?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    title: "Garden Goddess Bowl",
    restaurant: "Salad Theory",
    month: "May · 2024",
    status: "NEW",
    description: "Sprouted greens, quinoa crunch and basil-tahini drizzle.",
    energy: 64,
    eta: "18 mins",
    price: "₹259",
    icon: <Leaf className="w-5 h-5" />,
    accent: "from-[#22c55e] to-[#4ade80]",
    connected: ["Kombucha", "Seeded Cracker"],
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Seoul Fire Chicken",
    restaurant: "Gangnam 88",
    month: "Jun · 2024",
    status: "TRENDING",
    description: "Buttermilk double-fried chicken lacquered with gochujang honey.",
    energy: 92,
    eta: "30 mins",
    price: "₹379",
    icon: <Beef className="w-5 h-5" />,
    accent: "from-[#ef4444] to-[#f97316]",
    connected: ["Pickled Radish", "Yuzu Soda"],
    image:
      "https://images.unsplash.com/photo-1753012247973-902b75a01da2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    title: "Nitro Vanilla Cold Brew",
    restaurant: "Bean Scene",
    month: "Jun · 2024",
    status: "CHEF PICK",
    description: "18-hour steeped beans infused with nitrogen and vanilla plume.",
    energy: 55,
    eta: "12 mins",
    price: "₹219",
    icon: <Coffee className="w-5 h-5" />,
    accent: "from-[#0ea5e9] to-[#38bdf8]",
    connected: ["Almond Biscotti"],
    image:
      "https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    title: "Brûlée Gelato Stack",
    restaurant: "Gelato Affair",
    month: "Jun · 2024",
    status: "NEW",
    description: "Layered Belgian chocolate gelato torched with demerara sugar.",
    energy: 61,
    eta: "16 mins",
    price: "₹249",
    icon: <IceCream2 className="w-5 h-5" />,
    accent: "from-[#fb7185] to-[#f472b6]",
    connected: ["Salted Caramel Shot"],
    image:
      "https://plus.unsplash.com/premium_photo-1722686470415-91462ee42388?q=80&w=1121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    title: "Sourdough Ritual",
    restaurant: "Sub Culture",
    month: "Jul · 2024",
    status: "TRENDING",
    description: "48-hour fermented sourdough, burrata and heirloom tomatoes.",
    energy: 70,
    eta: "21 mins",
    price: "₹299",
    icon: <Sandwich className="w-5 h-5" />,
    accent: "from-[#facc15] to-[#fbbf24]",
    connected: ["Pesto Mayo", "Celery Spritz"],
    image:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 8,
    title: "Porcini Velvet Soup",
    restaurant: "The Broth Co.",
    month: "Jul · 2024",
    status: "CHEF PICK",
    description: "Porcini duxelles folded into slow-reduced mushroom broth.",
    energy: 48,
    eta: "19 mins",
    price: "₹289",
    icon: <Soup className="w-5 h-5" />,
    accent: "from-[#14b8a6] to-[#2dd4bf]",
    connected: ["Charred Sourdough"],
    image:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80",
  },
]

export function FoodOrbitShowcase() {
  const [active, setActive] = React.useState(0)
  const activeItem = nodes[active]
  const orbit = useMotionValue(0)

  React.useEffect(() => {
    const controls = animate(orbit, 360, {
      repeat: Infinity,
      ease: "linear",
      duration: 65,
    })
    return () => controls.stop()
  }, [orbit])

  const getPosition = (index: number) => {
    const baseAngle = (index / nodes.length) * 360
    const rotation = useTransform(orbit, (value) => value + baseAngle)
    const counterRotation = useTransform(rotation, (value) => -value)
    const radius = index % 2 === 0 ? 225 : 185
    return { rotation, counterRotation, radius }
  }

  const cycle = (dir: number) => {
    setActive((prev) => (prev + dir + nodes.length) % nodes.length)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.2)_0%,_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(249,115,22,0.15)_0%,_transparent_60%)]" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Orbit */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 blur-3xl opacity-40 bg-[radial-gradient(circle,_rgba(14,165,233,0.35)_0%,_transparent_60%)]" />
            <div className="relative w-[18rem] h-[18rem] sm:w-[20rem] sm:h-[20rem] lg:w-[22rem] lg:h-[22rem]">
              <div className="absolute inset-0 rounded-full border border-white/30" />
              <div className="absolute inset-6 rounded-full border border-white/20" />
              <div className="absolute inset-12 rounded-full border border-white/10" />

              {nodes.map((item, index) => {
                const { rotation, counterRotation, radius } = getPosition(index)
                return (
                  <motion.div
                    key={item.id}
                    style={{
                      rotate: rotation,
                    }}
                    className="absolute left-1/2 top-1/2 origin-center"
                  >
                    <div
                      style={{ transform: `translateX(${radius}px) translate(-50%, -50%)` }}
                    >
                      <motion.button
                        style={{ rotate: counterRotation }}
                        onClick={() => setActive(index)}
                        className={`w-20 h-20 rounded-2xl border backdrop-blur-md px-3 flex flex-col items-center justify-center text-center shadow-[0_15px_35px_rgba(15,23,42,0.15)] transition-all duration-300 ${
                          active === index
                            ? "scale-110 border-white bg-white text-slate-900"
                            : "border-white/60 bg-white/70 text-slate-500 hover:scale-105"
                        }`}
                      >
                        <span className="mb-2 text-slate-700">{item.icon}</span>
                        <span className="text-sm font-semibold leading-tight">
                          {item.restaurant.split(" ")[0]}
                        </span>
                        <span className="text-[11px] mt-1 text-slate-400">{item.status}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Details */}
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-lg w-full mx-auto rounded-[32px] border border-slate-200/60 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl p-8 space-y-6"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {activeItem.status}
              </span>
              <span>{activeItem.month}</span>
            </div>

            <div className="space-y-5">
              <div className="h-56 w-full rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-sm text-primary-500">Chef Spotlight</p>
                <h3 className="text-3xl font-semibold mt-2 text-slate-900">{activeItem.title}</h3>
                <p className="text-slate-500">{activeItem.restaurant}</p>
              </div>
              <p className="text-slate-600 leading-relaxed">{activeItem.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase">
                <span className="flex items-center gap-2">
                  ⚡ Energy Level
                </span>
                <span>{activeItem.energy}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${activeItem.accent}`}
                  style={{ width: `${activeItem.energy}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border border-slate-200/80 rounded-2xl p-4">
              <div>
                <p className="text-xs text-slate-400 uppercase">Delivery</p>
                <p className="text-lg font-semibold text-slate-900">{activeItem.eta}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Starting at</p>
                <p className="text-lg font-semibold text-slate-900">{activeItem.price}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-3">
                Connected pairings
              </p>
              <div className="flex flex-wrap gap-2">
                {activeItem.connected.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-500"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => cycle(-1)}
                className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex gap-2">
                {nodes.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === active ? "w-6 bg-slate-800" : "w-3 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/restaurants/${encodeURIComponent(activeItem.restaurant)}`}
                  className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
                >
                  Buy Now
                </a>
                <button
                  onClick={() => cycle(1)}
                  className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
