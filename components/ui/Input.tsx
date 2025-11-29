import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          'w-full px-4 py-3 border border-border rounded-input bg-bg text-textPrimary',
          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
          'placeholder:text-textTertiary',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input

