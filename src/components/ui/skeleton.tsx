import { cn } from '../../utils/cn'

// Skeleton no padrão shadcn/ui para loading states
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-[#3A2A20]',
        className,
      )}
      {...props}
    />
  )
}
