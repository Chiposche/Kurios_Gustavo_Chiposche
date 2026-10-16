import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// Botão no padrão shadcn/ui, com as cores da identidade KURIO
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4944C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1412]',
  {
    variants: {
      variant: {
        default: 'bg-[#D4944C] text-black hover:bg-[#E0A55D]',
        outline: 'border border-[#3A2A20] text-[#C4956A] hover:border-[#D4944C]',
        ghost: 'text-[#C4956A] hover:text-[#D4944C]',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'w-full py-3 text-base',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  },
)
Button.displayName = 'Button'
