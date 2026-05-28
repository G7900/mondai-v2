import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'default'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  blue: 'bg-accent-blue/10 text-accent-blue-bright border-accent-blue/20',
  purple: 'bg-accent-purple/10 text-accent-purple-soft border-accent-purple/20',
  yellow: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  red: 'bg-status-error/10 text-status-error border-status-error/20',
  default: 'bg-bg-elevated text-text-secondary border-bg-border',
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
