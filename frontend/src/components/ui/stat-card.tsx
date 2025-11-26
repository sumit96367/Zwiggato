import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'bg-blue-500',
  trend,
  description,
  className
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-xl text-white transition-transform duration-300 group-hover:scale-110",
          color
        )}>
          <Icon size={24} />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
}

