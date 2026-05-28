'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useSplitStore } from '@/lib/store'
import type { PresenceState } from '@/types'

export function useRealtimeSession(sessionId: string, participantId?: string) {
  const channelRef = useRef<any>(null)
  const { setOnlineParticipants, addOnlineParticipant, removeOnlineParticipant, updateSession, updateParticipant } = useSplitStore()

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase.channel(`split:${sessionId}`, {
      config: {
        presence: { key: participantId ?? 'anonymous' },
        broadcast: { self: true },
      },
    })

    channelRef.current = channel

    // ── Presence ──────────────────────────────────────────────────────────
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>()
      const ids = Object.keys(state).map(key => state[key][0]?.participant_id).filter(Boolean)
      setOnlineParticipants(ids)
    })

    channel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
      const id = newPresences[0]?.participant_id
      if (id) addOnlineParticipant(id)
    })

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
      const id = leftPresences[0]?.participant_id
      if (id) removeOnlineParticipant(id)
    })

    // ── Database changes ──────────────────────────────────────────────────
    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'receipt_items',
        filter: `session_id=eq.${sessionId}`,
      }, (payload: any) => {
        // Item updated — refresh items in session
        if (payload.eventType === 'UPDATE') {
          updateSession({} as any) // trigger re-fetch via SWR or manual refetch
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `session_id=eq.${sessionId}`,
      }, (payload: any) => {
        if (payload.eventType === 'UPDATE') {
          updateParticipant(payload.new.id, payload.new)
        }
        if (payload.eventType === 'INSERT') {
          updateSession({} as any)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'split_sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload: any) => {
        updateSession(payload.new)
      })

    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED' && participantId) {
        await channel.track({
          participant_id: participantId,
          online_at: new Date().toISOString(),
        } as PresenceState)
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId, participantId])
}
