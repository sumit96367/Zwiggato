import { motion } from 'framer-motion'
import { Plus, Minus, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface MenuItemCardProps {
  item: {
    _id: string
    name: string
    description?: string
    price: number
    image?: string
    isAvailable: boolean
    dietaryTags?: string[]
  }
  quantity: number
  onAdd: () => void
  onRemove: () => void
  index?: number
}

export function MenuItemCard({ item, quantity, onAdd, onRemove, index = 0 }: MenuItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex gap-4 p-5">
        {/* Image */}
        {item.image ? (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
              {item.name}
            </h3>
            {!item.isAvailable && (
              <Badge variant="error" className="flex-shrink-0">
                <AlertCircle size={12} className="mr-1" />
                Unavailable
              </Badge>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          )}

          {/* Dietary Tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.dietaryTags.map((tag, idx) => (
                <Badge key={idx} variant="default" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-primary-600">₹{item.price.toFixed(2)}</p>
            </div>

            {item.isAvailable ? (
              quantity > 0 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="font-semibold text-gray-900 min-w-[24px] text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={onAdd}
                  className="rounded-full"
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </Button>
              )
            ) : (
              <span className="text-sm text-gray-400">Currently unavailable</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

