'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  Receipt, Users, ChevronDown, ChevronUp,
  Share2, Download, CheckCircle2, Clock,
  Wifi, WifiOff, AlertCircle, Loader2,
  ArrowRight, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

import { supabase, getSplitSession, joinSplitSession, markParticipantDone } from '@/lib/supabase'
import { useSplitStore } from '@/lib/store'
import { useRealtimeSession } from '@/hooks/useRealtimeSession'
import { formatCurrency, cn } from '@/lib/utils'

import { JoinModal } from '@/components/split/JoinModal'
import { ParticipantsBar } from '@/components/split/ParticipantsBar'
import { ReceiptItemsList } from '@/components/split/ReceiptItemsList'
import { DebtsSummary } from '@/components/split/DebtsSummary'
import { ReceiptViewer } from '@/components/split/ReceiptViewer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { GuestInfo, PaymentMethodInfo } from '@/types'

type Tab = 'items' | 'summary' | 'receipt'

export default function SplitPage() {
  const params = useParams()
  const splitId = params.id as string

  const { session, guest, onlineParticipants, isLoading, error, setSession, setGuest, setLoading, setError } = useSplitStore()

  const [activeTab, setActiveTab] = useState<Tab>('items')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [markingDone, setMarkingDone] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Realtime sync
  useRealtimeSession(session?.id ?? '', guest?.id)

  // Network status
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); toast.success('Conexión restaurada') }
    const handleOffline = () => { setIsOnline(false); toast.error('Sin conexión') }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  // Load session
  useEffect(() => {
    if (!splitId) return
    loadSession()
  }, [splitId])

  // Check stored guest
  useEffect(() => {
    if (!session) return
    const stored = localStorage.getItem(`mondai_guest_${session.id}`)
    if (stored) {
      try {
        const g = JSON.parse(stored) as GuestInfo
        setGuest(g)
      } catch {}
    } else {
      setShowJoinModal(true)
    }
  }, [session?.id])

  const loadSession = async () => {
    setLoading(true)
    try {
      const data = await getSplitSession(splitId)
      setSession(data as any)
    } catch (e: any) {
      setError(e.message ?? 'Sesión no encontrada')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (name: string, methods: PaymentMethodInfo[]) => {
    if (!session) return
    try {
      const participant = await joinSplitSession(session.id, name, methods)
      const g: GuestInfo = { id: participant.id, name, payment_methods: methods }
      setGuest(g)
      localStorage.setItem(`mondai_guest_${session.id}`, JSON.stringify(g))
      setShowJoinModal(false)
      toast.success(`¡Bienvenido, ${name}!`)
    } catch (e: any) {
      toast.error('Error al unirse: ' + e.message)
      throw e
    }
  }

  const handleMarkDone = async () => {
    if (!guest || !session) return
    setMarkingDone(true)
    try {
      await markParticipantDone(guest.id)
      toast.success('¡Listo! Tus selecciones fueron guardadas')
    } catch {
      toast.error('Error al confirmar')
    } finally {
      setMarkingDone(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: session?.title ?? 'Split MondAI', url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado')
    }
  }

  const currentParticipant = session?.participants?.find(p => p.id === guest?.id)
  const isDone = currentParticipant?.status === 'done'
  const allDone = session?.participants?.every(p => p.status === 'done')
  const unassignedItems = session?.items?.filter(i => i.assigned_to.length === 0) ?? []

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-accent-green/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-accent-green animate-spin" />
          </div>
          <p className="text-text-secondary">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-status-error/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-status-error" />
          </div>
          <h2 className="text-xl font-bold">Sesión no encontrada</h2>
          <p className="text-text-muted text-sm">
            El link puede haber expirado o ser inválido.
          </p>
          <code className="block text-xs text-text-muted font-mono bg-bg-card px-3 py-2 rounded-xl border border-bg-border">
            {error}
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-glow opacity-60 pointer-events-none" />

      <div className="relative max-w-lg mx-auto">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-bg-base/80 backdrop-blur-xl border-b border-bg-border px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + session */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-accent-green flex items-center justify-center flex-shrink-0">
                <span className="text-bg-base font-bold text-sm">M</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted font-mono">#{session.split_id}</p>
                <h1 className="text-sm font-semibold truncate leading-tight">{session.title}</h1>
              </div>
            </div>

            {/* Right: status + actions */}
            <div className="flex items-center gap-2">
              {/* Network indicator */}
              <div className={cn(
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                isOnline ? 'bg-accent-green animate-pulse-green' : 'bg-status-error'
              )} />

              <Badge
                variant={session.status === 'active' ? 'green' : session.status === 'completed' ? 'blue' : 'default'}
                size="sm"
              >
                {session.status === 'active' ? 'Activo' : session.status === 'completed' ? 'Cerrado' : 'Expirado'}
              </Badge>

              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-xl bg-bg-elevated border border-bg-border flex items-center justify-center hover:border-accent-green/30 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <main className="px-4 py-4 space-y-4 pb-32">

          {/* Total card */}
          <div className="bg-bg-card border border-bg-border rounded-3xl p-5 relative overflow-hidden noise">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <p className="text-xs text-text-muted uppercase tracking-widest font-mono mb-1">Total factura</p>
              <p className="text-4xl font-bold text-text-primary font-mono amount-text tracking-tight">
                {formatCurrency(session.total_amount, 'COP')}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-text-muted font-mono">
                {session.tax_amount ? (
                  <span>IVA {formatCurrency(session.tax_amount, 'COP')}</span>
                ) : null}
                {session.tip_amount ? (
                  <span>Propina {session.tip_percentage}% = {formatCurrency(session.tip_amount, 'COP')}</span>
                ) : null}
              </div>

              {/* My share */}
              {currentParticipant && currentParticipant.total_owed > 0 && (
                <div className="mt-4 flex items-center justify-between p-3 bg-accent-green/8 rounded-2xl border border-accent-green/20">
                  <span className="text-sm text-accent-green">Tu parte</span>
                  <span className="text-lg font-bold text-accent-green font-mono amount-text">
                    {formatCurrency(currentParticipant.total_owed, 'COP')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <ParticipantsBar
            participants={session.participants ?? []}
            onlineIds={onlineParticipants}
            currentParticipantId={guest?.id}
          />

          {/* Warning: unassigned items */}
          {unassignedItems.length > 0 && (
            <div className="flex items-center gap-3 bg-status-warning/8 border border-status-warning/20 rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-status-warning flex-shrink-0" />
              <p className="text-sm text-status-warning">
                {unassignedItems.length} ítem{unassignedItems.length > 1 ? 's' : ''} sin asignar
              </p>
            </div>
          )}

          {/* All done banner */}
          {allDone && (
            <div className="flex items-center gap-3 bg-accent-green/8 border border-accent-green/20 rounded-2xl px-4 py-3 animate-slide-up">
              <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
              <p className="text-sm text-accent-green font-medium">
                ¡Todos confirmaron! Las deudas están listas.
              </p>
            </div>
          )}

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          <div className="flex bg-bg-card border border-bg-border rounded-2xl p-1 gap-1">
            {[
              { id: 'items' as Tab, label: 'Ítems', icon: Receipt },
              { id: 'summary' as Tab, label: 'Deudas', icon: ArrowRight },
              ...(session.receipt_url ? [{ id: 'receipt' as Tab, label: 'Factura', icon: Download }] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-accent-green text-bg-base shadow-green-glow'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ────────────────────────────────────────── */}
          {activeTab === 'items' && (
            <ReceiptItemsList
              items={session.items ?? []}
              participants={session.participants ?? []}
              currentParticipantId={guest?.id}
              divisionMode={session.division_mode}
              currency="COP"
            />
          )}

          {activeTab === 'summary' && (
            <DebtsSummary
              debts={session.debts ?? []}
              participants={session.participants ?? []}
              currentParticipantId={guest?.id}
              currency="COP"
            />
          )}

          {activeTab === 'receipt' && session.receipt_url && (
            <div className="space-y-4 animate-fade-in">
              <ReceiptViewer
                receiptUrl={session.receipt_url}
                restaurantName={session.receipt_data?.restaurant_name}
              />
              {session.receipt_data && (
                <div className="bg-bg-card border border-bg-border rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-text-muted font-mono uppercase tracking-widest">Resumen</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Subtotal', value: session.receipt_data.subtotal },
                      { label: 'Impuestos', value: session.receipt_data.tax },
                      { label: 'Propina', value: session.receipt_data.tip },
                    ].map(row => row.value > 0 && (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-text-muted">{row.label}</span>
                        <span className="font-mono text-text-secondary">{formatCurrency(row.value, 'COP')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-bg-border">
                      <span>Total</span>
                      <span className="font-mono text-accent-green">{formatCurrency(session.receipt_data.total, 'COP')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Footer CTA ──────────────────────────────────────────────────── */}
        {guest && session.status === 'active' && (
          <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 pb-safe bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent pointer-events-none">
            <div className="pointer-events-auto">
              {isDone ? (
                <div className="flex items-center justify-center gap-2 bg-accent-green/10 border border-accent-green/25 rounded-2xl px-4 py-3.5">
                  <CheckCircle2 className="w-5 h-5 text-accent-green" />
                  <span className="text-accent-green font-medium">Confirmaste tus ítems</span>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  loading={markingDone}
                  onClick={handleMarkDone}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Confirmar mis ítems
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Join Modal ──────────────────────────────────────────────────────── */}
      {showJoinModal && (
        <JoinModal
          sessionTitle={session.title}
          onJoin={handleJoin}
        />
      )}
    </div>
  )
}
