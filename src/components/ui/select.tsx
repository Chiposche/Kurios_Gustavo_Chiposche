import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// Select no padrão shadcn/ui com as cores KURIO
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4944C] appearance-none cursor-pointer',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)
Select.displayName = 'Select'
