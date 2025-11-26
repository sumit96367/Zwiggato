import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModernCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function ModernCard({ children, className, hover = true, delay = 0 }: ModernCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden",
        hover && "hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

