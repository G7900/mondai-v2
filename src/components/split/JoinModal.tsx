'use client'

import { useState } from 'react'
import { User, Smartphone, Plus, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '@/lib/utils'
import type { PaymentMethod, PaymentMethodInfo } from '@/types'

interface JoinModalProps {
  sessionTitle: string
  onJoin: (name: string, methods: PaymentMethodInfo[]) => Promise<void>
}

const PAYMENT_OPTIONS: PaymentMethod[] = ['nequi', 'daviplata', 'bancolombia', 'paypal', 'cash', 'transfer']

export function JoinModal({ sessionTitle, onJoin }: JoinModalProps) {
  const [name, setName] = useState('')
  const [methods, setMethods] = useState<PaymentMethodInfo[]>([])
  const [addingMethod, setAddingMethod] = useState<PaymentMethod | null>(null)
  const [methodHandle, setMethodHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'name' | 'payment'>('name')

  const handleAddMethod = () => {
    if (!addingMethod || !methodHandle.trim()) return
    setMethods(prev => [
      ...prev.filter(m => m.type !== addingMethod),
      { type: addingMethod, handle: methodHandle.trim() }
    ])
    setAddingMethod(null)
    setMethodHandle('')
  }

  const handleJoin = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await onJoin(name.trim(), methods)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-bg-card border border-bg-border rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-card animate-slide-up">
        {/* Header gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-accent-green/8 to-transparent pointer-events-none" />

        <div className="relative p-6 pb-8 sm:p-8">
          {/* Handle (mobile) */}
          <div className="w-10 h-1 bg-bg-border rounded-full mx-auto mb-6 sm:hidden" />

          {/* Logo + title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent-green flex items-center justify-center flex-shrink-0">
              <span className="text-bg-base font-bold text-lg">M</span>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest font-mono">Te invitaron a</p>
              <h2 className="text-lg font-semibold text-text-primary leading-tight">{sessionTitle}</h2>
            </div>
          </div>

          {step === 'name' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-widest font-mono mb-2 block">
                  ¿Cómo te llamas?
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('payment')}
                    autoFocus
                    className="w-full bg-bg-elevated border border-bg-border rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all"
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!name.trim()}
                onClick={() => setStep('payment')}
                icon={<ChevronRight className="w-5 h-5" />}
              >
                Continuar
              </Button>

              <p className="text-center text-xs text-text-muted">
                No necesitas crear una cuenta
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-text-muted uppercase tracking-widest font-mono">
                    Métodos de pago <span className="text-accent-green/60">(opcional)</span>
                  </label>
                  <button onClick={() => setStep('name')} className="text-xs text-text-muted hover:text-text-secondary">
                    ← atrás
                  </button>
                </div>

                {/* Added methods */}
                {methods.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {methods.map(m => (
                      <div key={m.type} className="flex items-center justify-between bg-bg-elevated rounded-xl px-3 py-2.5 border border-bg-border">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: PAYMENT_METHOD_COLORS[m.type] }}
                          />
                          <span className="text-sm font-medium">{PAYMENT_METHOD_LABELS[m.type]}</span>
                          <span className="text-sm text-text-muted font-mono">{m.handle}</span>
                        </div>
                        <button onClick={() => setMethods(prev => prev.filter(x => x.type !== m.type))}>
                          <X className="w-3.5 h-3.5 text-text-muted hover:text-status-error" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add method */}
                {addingMethod ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={addingMethod === 'cash' ? 'Efectivo' : 'Número / alias'}
                      value={methodHandle}
                      onChange={e => setMethodHandle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddMethod()}
                      autoFocus
                      className="flex-1 bg-bg-elevated border border-accent-green/30 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
                    />
                    <Button size="sm" onClick={handleAddMethod} disabled={!methodHandle.trim()}>
                      Agregar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAddingMethod(null); setMethodHandle('') }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_OPTIONS.filter(m => !methods.find(x => x.type === m)).map(method => (
                      <button
                        key={method}
                        onClick={() => setAddingMethod(method)}
                        className="flex items-center gap-1.5 bg-bg-elevated border border-bg-border hover:border-accent-green/30 rounded-xl px-3 py-2 text-xs text-text-secondary hover:text-text-primary transition-all"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: PAYMENT_METHOD_COLORS[method] }}
                        />
                        {PAYMENT_METHOD_LABELS[method]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                size="lg"
                className="w-full"
                loading={loading}
                onClick={handleJoin}
                icon={<ChevronRight className="w-5 h-5" />}
              >
                Entrar como {name}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
