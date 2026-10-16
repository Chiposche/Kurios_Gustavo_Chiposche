import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// Input no padrão shadcn/ui, com as cores da identidade KURIO
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C]',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
