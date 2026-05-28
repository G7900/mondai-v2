import { create } from 'zustand'
import type { SplitSession, Participant, GuestInfo } from '@/types'

interface SplitStore {
  session: SplitSession | null
  guest: GuestInfo | null
  onlineParticipants: string[]
  isLoading: boolean
  error: string | null

  setSession: (session: SplitSession) => void
  updateSession: (partial: Partial<SplitSession>) => void
  setGuest: (guest: GuestInfo) => void
  setOnlineParticipants: (ids: string[]) => void
  addOnlineParticipant: (id: string) => void
  removeOnlineParticipant: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateParticipant: (id: string, partial: Partial<Participant>) => void
}

export const useSplitStore = create<SplitStore>((set) => ({
  session: null,
  guest: null,
  onlineParticipants: [],
  isLoading: true,
  error: null,

  setSession: (session) => set({ session }),

  updateSession: (partial) =>
    set((state) => ({
      session: state.session ? { ...state.session, ...partial } : null,
    })),

  setGuest: (guest) => set({ guest }),

  setOnlineParticipants: (ids) => set({ onlineParticipants: ids }),

  addOnlineParticipant: (id) =>
    set((state) => ({
      onlineParticipants: [...new Set([...state.onlineParticipants, id])],
    })),

  removeOnlineParticipant: (id) =>
    set((state) => ({
      onlineParticipants: state.onlineParticipants.filter((p) => p !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateParticipant: (id, partial) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            participants: state.session.participants.map((p) =>
              p.id === id ? { ...p, ...partial } : p
            ),
          }
        : null,
    })),
}))
