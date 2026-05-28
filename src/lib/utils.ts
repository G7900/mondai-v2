import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Debt, Participant } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'COP') {
  if (currency === 'COP') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// ─── Debt calculation ─────────────────────────────────────────────────────────

export function calculateDebts(participants: Participant[]): Debt[] {
  const debts: Debt[] = []

  // Find payers (positive balance = they paid more than owed)
  const balances = participants.map(p => ({
    id: p.id,
    balance: (p as any).amount_paid ?? 0 - p.total_owed,
  }))

  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance)
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance)

  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(-debtor.balance, creditor.balance)

    if (amount > 0) {
      debts.push({
        from_participant_id: debtor.id,
        to_participant_id: creditor.id,
        amount,
        is_settled: false,
      })
    }

    debtor.balance += amount
    creditor.balance -= amount

    if (Math.abs(debtor.balance) < 1) i++
    if (Math.abs(creditor.balance) < 1) j++
  }

  return debts
}

// ─── Time ─────────────────────────────────────────────────────────────────────

export function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'ahora mismo'
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`
  return `hace ${Math.floor(seconds / 86400)}d`
}

// ─── String ───────────────────────────────────────────────────────────────────

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function generateColor(name: string): string {
  const colors = [
    '#00E5A0', '#3B82F6', '#8B5CF6', '#F59E0B',
    '#EF4444', '#06B6D4', '#EC4899', '#10B981',
  ]
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  return colors[index]
}

// ─── Payment methods ──────────────────────────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  bancolombia: 'Bancolombia',
  paypal: 'PayPal',
  cash: 'Efectivo',
  transfer: 'Transferencia',
}

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  nequi: '#7B2EFF',
  daviplata: '#FF0000',
  bancolombia: '#FFCC00',
  paypal: '#003087',
  cash: '#00E5A0',
  transfer: '#3B82F6',
}
