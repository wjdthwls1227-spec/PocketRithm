import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'rounded-button font-medium transition',
          {
            'h-12': size === 'md',
            'h-10': size === 'sm',
            'h-14': size === 'lg',
            'bg-accent text-white hover:opacity-90': variant === 'primary',
            'bg-surface text-textPrimary border border-border hover:bg-surface/80': variant === 'secondary',
            'bg-bg text-textPrimary border border-border hover:bg-surface': variant === 'outline',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button

