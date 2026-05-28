import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ─── Split Session helpers ────────────────────────────────────────────────────

export async function getSplitSession(splitId: string) {
  const { data, error } = await supabase
    .from('split_sessions')
    .select(`
      *,
      participants (*),
      items: receipt_items (*),
      payers (*),
      debts (*)
    `)
    .eq('split_id', splitId)
    .single()

  if (error) throw error
  return data
}

export async function joinSplitSession(sessionId: string, name: string, paymentMethods: any[]) {
  const { data, error } = await supabase
    .from('participants')
    .insert({
      session_id: sessionId,
      name,
      is_host: false,
      is_present: true,
      status: 'selecting',
      payment_methods: paymentMethods,
      subtotal: 0,
      tax_share: 0,
      tip_share: 0,
      total_owed: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateItemAssignment(itemId: string, participantIds: string[]) {
  const { error } = await supabase
    .from('receipt_items')
    .update({ assigned_to: participantIds })
    .eq('id', itemId)

  if (error) throw error
}

export async function markParticipantDone(participantId: string) {
  const { error } = await supabase
    .from('participants')
    .update({ status: 'done' })
    .eq('id', participantId)

  if (error) throw error
}
