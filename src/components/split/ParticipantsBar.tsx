'use client'

import { Users, Crown } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Participant } from '@/types'

interface ParticipantsBarProps {
  participants: Participant[]
  onlineIds: string[]
  currentParticipantId?: string
}

const statusLabel: Record<string, { label: string; variant: any }> = {
  pending: { label: 'Esperando', variant: 'default' },
  selecting: { label: 'Seleccionando', variant: 'blue' },
  done: { label: 'Listo ✓', variant: 'green' },
}

export function ParticipantsBar({ participants, onlineIds, currentParticipantId }: ParticipantsBarProps) {
  const online = participants.filter(p => onlineIds.includes(p.id))
  const offline = participants.filter(p => !onlineIds.includes(p.id))
  const doneCount = participants.filter(p => p.status === 'done').length

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-secondary">
            {participants.length} participantes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">
            {doneCount}/{participants.length} listos
          </span>
          {/* Progress bar */}
          <div className="w-16 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-green rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / Math.max(participants.length, 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {participants.map(p => {
          const isOnline = onlineIds.includes(p.id)
          const isCurrent = p.id === currentParticipantId
          const status = statusLabel[p.status]

          return (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 border transition-all',
                isCurrent
                  ? 'bg-accent-green/8 border-accent-green/25'
                  : 'bg-bg-elevated border-bg-border'
              )}
            >
              <Avatar name={p.name} size="xs" isOnline={isOnline} />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium leading-none truncate max-w-[80px]">
                    {p.name}
                  </span>
                  {p.is_host && (
                    <Crown className="w-3 h-3 text-status-warning flex-shrink-0" />
                  )}
                  {isCurrent && (
                    <span className="text-xs text-accent-green">(tú)</span>
                  )}
                </div>
                <Badge
                  variant={status.variant}
                  size="sm"
                  className="mt-0.5 text-[10px] px-1.5 py-0"
                >
                  {status.label}
                </Badge>
              </div>

              {/* Represents others */}
              {p.represents.length > 0 && (
                <div className="flex -space-x-1">
                  {p.represents.slice(0, 2).map(rid => {
                    const rep = participants.find(x => x.id === rid)
                    return rep ? (
                      <Avatar key={rid} name={rep.name} size="xs" />
                    ) : null
                  })}
                  {p.represents.length > 2 && (
                    <span className="text-[10px] text-text-muted">+{p.represents.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
