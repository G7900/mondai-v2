'use client'

import { ArrowRight, QrCode, Copy, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '@/lib/utils'
import type { Debt, Participant } from '@/types'
import toast from 'react-hot-toast'

interface DebtsSummaryProps {
  debts: Debt[]
  participants: Participant[]
  currentParticipantId?: string
  currency?: string
}

export function DebtsSummary({ debts, participants, currentParticipantId, currency = 'COP' }: DebtsSummaryProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const getParticipant = (id: string) => participants.find(p => p.id === id)

  const myDebts = debts.filter(d => d.from_participant_id === currentParticipantId && !d.is_settled)
  const owedToMe = debts.filter(d => d.to_participant_id === currentParticipantId && !d.is_settled)

  const totalIOwe = myDebts.reduce((sum, d) => sum + d.amount, 0)
  const totalOwedToMe = owedToMe.reduce((sum, d) => sum + d.amount, 0)

  const copyHandle = async (handle: string, type: string) => {
    await navigator.clipboard.writeText(handle)
    setCopied(handle)
    toast.success(`${type} copiado`)
    setTimeout(() => setCopied(null), 2000)
  }

  const openNequi = (phone: string, amount: number) => {
    window.open(`https://api.whatsapp.com/send?text=Te+debo+${formatCurrency(amount, currency)}+en+MondAI+🌿+Nequi:+${phone}`, '_blank')
  }

  if (debts.length === 0) {
    return (
      <div className="bg-bg-card border border-bg-border rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent-green/10 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-accent-green" />
        </div>
        <p className="text-text-secondary text-sm">Todo dividido equitativamente</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* My total */}
      {currentParticipantId && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-status-error/8 border border-status-error/20 rounded-2xl p-4">
            <p className="text-xs text-text-muted mb-1">Yo debo</p>
            <p className="text-xl font-bold text-status-error font-mono amount-text">
              {formatCurrency(totalIOwe, currency)}
            </p>
          </div>
          <div className="bg-accent-green/8 border border-accent-green/20 rounded-2xl p-4">
            <p className="text-xs text-text-muted mb-1">Me deben</p>
            <p className="text-xl font-bold text-accent-green font-mono amount-text">
              {formatCurrency(totalOwedToMe, currency)}
            </p>
          </div>
        </div>
      )}

      {/* All debts */}
      <div className="space-y-2">
        {debts.filter(d => !d.is_settled).map((debt, idx) => {
          const from = getParticipant(debt.from_participant_id)
          const to = getParticipant(debt.to_participant_id)
          if (!from || !to) return null

          const isMyDebt = debt.from_participant_id === currentParticipantId
          const isOwedToMe = debt.to_participant_id === currentParticipantId
          const paymentMethods = to.payment_methods ?? []

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-4 space-y-3 ${
                isMyDebt
                  ? 'bg-status-error/5 border-status-error/20'
                  : isOwedToMe
                  ? 'bg-accent-green/5 border-accent-green/15'
                  : 'bg-bg-card border-bg-border'
              }`}
            >
              {/* Debt row */}
              <div className="flex items-center gap-3">
                <Avatar name={from.name} size="sm" />
                <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                <Avatar name={to.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    <span className="text-text-secondary">{isMyDebt ? 'Tú' : from.name}</span>
                    <span className="text-text-muted"> → </span>
                    <span className="text-text-secondary">{isOwedToMe ? 'ti' : to.name}</span>
                  </p>
                </div>
                <p className={`text-base font-bold font-mono amount-text flex-shrink-0 ${
                  isMyDebt ? 'text-status-error' : isOwedToMe ? 'text-accent-green' : 'text-text-primary'
                }`}>
                  {formatCurrency(debt.amount, currency)}
                </p>
              </div>

              {/* Payment methods */}
              {isMyDebt && paymentMethods.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
                    Pagar a {to.name} via:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {paymentMethods.map(method => (
                      <button
                        key={method.type}
                        onClick={() => copyHandle(method.handle, PAYMENT_METHOD_LABELS[method.type])}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 border border-bg-border bg-bg-elevated hover:border-accent-green/30 transition-all text-sm"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: PAYMENT_METHOD_COLORS[method.type] }}
                        />
                        <span className="font-medium">{PAYMENT_METHOD_LABELS[method.type]}</span>
                        <span className="text-text-muted font-mono text-xs">{method.handle}</span>
                        {copied === method.handle ? (
                          <Check className="w-3 h-3 text-accent-green" />
                        ) : (
                          <Copy className="w-3 h-3 text-text-muted" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
