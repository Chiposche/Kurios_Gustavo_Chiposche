import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

// Badge no padrão shadcn/ui para tags e labels
const badgeVariants = cva(
  'inline-flex items-center rounded text-xs font-bold px-2 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-[#D4944C] text-black',
        rare: 'bg-[#D4944C] text-black',
        legendary: 'bg-[#D4944C] text-black',
        epic: 'bg-purple-500 text-white',
        outline: 'border border-[#3A2A20] text-[#C4956A]',
        primary: 'bg-[#D4944C]/20 text-[#D4944C]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
