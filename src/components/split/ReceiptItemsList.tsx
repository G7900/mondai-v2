'use client'

import { useState } from 'react'
import { Users, User, Check, Minus, Plus, Utensils, Coffee, ShoppingBag, Car, MoreHorizontal } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { cn, formatCurrency, generateColor } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { ReceiptItem, Participant } from '@/types'

interface ReceiptItemsProps {
  items: ReceiptItem[]
  participants: Participant[]
  currentParticipantId?: string
  divisionMode: 'exact' | 'equal' | 'hybrid'
  currency?: string
  onItemUpdate?: (itemId: string, assignedTo: string[]) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  drinks: <Coffee className="w-3.5 h-3.5" />,
  food: <Utensils className="w-3.5 h-3.5" />,
  transport: <Car className="w-3.5 h-3.5" />,
  shopping: <ShoppingBag className="w-3.5 h-3.5" />,
}

export function ReceiptItemsList({
  items,
  participants,
  currentParticipantId,
  divisionMode,
  currency = 'COP',
  onItemUpdate,
}: ReceiptItemsProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const toggleAssignment = async (item: ReceiptItem, participantId: string) => {
    if (updating) return

    let newAssigned: string[]
    if (item.assigned_to.includes(participantId)) {
      newAssigned = item.assigned_to.filter(id => id !== participantId)
    } else {
      newAssigned = [...item.assigned_to, participantId]
    }

    setUpdating(item.id)
    try {
      await supabase
        .from('receipt_items')
        .update({ assigned_to: newAssigned })
        .eq('id', item.id)
      onItemUpdate?.(item.id, newAssigned)
    } finally {
      setUpdating(null)
    }
  }

  const toggleShared = async (item: ReceiptItem) => {
    if (divisionMode !== 'hybrid') return
    setUpdating(item.id)
    try {
      const allIds = participants.map(p => p.id)
      await supabase
        .from('receipt_items')
        .update({
          is_shared: !item.is_shared,
          assigned_to: !item.is_shared ? allIds : item.assigned_to,
        })
        .eq('id', item.id)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const isExpanded = expandedItem === item.id
        const isAssignedToMe = currentParticipantId ? item.assigned_to.includes(currentParticipantId) : false
        const assignedParticipants = participants.filter(p => item.assigned_to.includes(p.id))
        const perPerson = item.assigned_to.length > 0
          ? item.total_price / item.assigned_to.length
          : item.total_price

        return (
          <div
            key={item.id}
            className={cn(
              'rounded-2xl border transition-all duration-200 overflow-hidden',
              isAssignedToMe
                ? 'bg-accent-green/5 border-accent-green/20'
                : 'bg-bg-card border-bg-border',
              `animate-slide-up stagger-${Math.min(idx + 1, 6)}`
            )}
          >
            {/* Item row */}
            <button
              className="w-full flex items-center gap-3 p-3.5 text-left"
              onClick={() => setExpandedItem(isExpanded ? null : item.id)}
            >
              {/* Category icon */}
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                  isAssignedToMe ? 'bg-accent-green/15 text-accent-green' : 'bg-bg-elevated text-text-muted'
                )}
              >
                {categoryIcons[item.category ?? ''] ?? <Utensils className="w-3.5 h-3.5" />}
              </div>

              {/* Item info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  {item.qty > 1 && (
                    <span className="text-xs text-text-muted">×{item.qty}</span>
                  )}
                  {item.is_shared && (
                    <Badge variant="blue" size="sm">compartido</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {assignedParticipants.length > 0 ? (
                    <div className="flex -space-x-1">
                      {assignedParticipants.slice(0, 3).map(p => (
                        <Avatar key={p.id} name={p.name} size="xs" />
                      ))}
                      {assignedParticipants.length > 3 && (
                        <span className="text-[10px] text-text-muted ml-1">
                          +{assignedParticipants.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-status-warning">Sin asignar</span>
                  )}
                  {assignedParticipants.length > 1 && (
                    <span className="text-xs text-text-muted font-mono">
                      {formatCurrency(perPerson, currency)}/c.u.
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className={cn(
                  'text-sm font-semibold font-mono amount-text',
                  isAssignedToMe ? 'text-accent-green' : 'text-text-primary'
                )}>
                  {formatCurrency(item.total_price, currency)}
                </p>
                {isAssignedToMe && assignedParticipants.length > 1 && (
                  <p className="text-xs text-accent-green/60 font-mono">
                    {formatCurrency(perPerson, currency)} tuyo
                  </p>
                )}
              </div>
            </button>

            {/* Expanded: participant selector */}
            {isExpanded && (
              <div className="px-3.5 pb-3.5 pt-0 border-t border-bg-border/50">
                <div className="pt-3 space-y-2">
                  {divisionMode === 'hybrid' && (
                    <button
                      onClick={() => toggleShared(item)}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition-all',
                        item.is_shared
                          ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue-bright'
                          : 'bg-bg-elevated border-bg-border text-text-secondary hover:border-accent-blue/20'
                      )}
                    >
                      <Users className="w-4 h-4" />
                      Dividir entre todos por igual
                      {item.is_shared && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  )}

                  <p className="text-xs text-text-muted uppercase tracking-widest font-mono">
                    ¿Quién consumió esto?
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    {participants.map(p => {
                      const isAssigned = item.assigned_to.includes(p.id)
                      const isMe = p.id === currentParticipantId

                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleAssignment(item, p.id)}
                          disabled={updating === item.id}
                          className={cn(
                            'flex items-center gap-2 rounded-xl px-3 py-2 border text-sm transition-all',
                            isAssigned
                              ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                              : 'bg-bg-elevated border-bg-border text-text-secondary hover:border-accent-green/20',
                            updating === item.id && 'opacity-50 cursor-wait'
                          )}
                          style={isAssigned ? { borderColor: `${generateColor(p.name)}40` } : undefined}
                        >
                          <Avatar name={p.name} size="xs" />
                          <span className="truncate flex-1 text-left">
                            {p.name}{isMe ? ' (tú)' : ''}
                          </span>
                          {isAssigned && <Check className="w-3 h-3 flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
