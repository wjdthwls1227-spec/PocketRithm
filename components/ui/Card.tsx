import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'border'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'surface', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-block',
          {
            'bg-surface border border-border': variant === 'surface',
            'bg-bg border border-border': variant === 'border',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card


