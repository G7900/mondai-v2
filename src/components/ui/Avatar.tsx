'use client'

import { cn, getInitials, generateColor } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isOnline?: boolean
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function Avatar({ name, size = 'md', isOnline, className }: AvatarProps) {
  const color = generateColor(name)
  const initials = getInitials(name)

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold',
          sizes[size]
        )}
        style={{
          backgroundColor: `${color}22`,
          color: color,
          border: `1.5px solid ${color}44`,
        }}
      >
        {initials}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-bg-base',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
            isOnline ? 'bg-accent-green' : 'bg-text-muted'
          )}
        />
      )}
    </div>
  )
}
