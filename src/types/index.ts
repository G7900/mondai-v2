// ─── Split Session ────────────────────────────────────────────────────────────

export type SplitStatus = 'active' | 'completed' | 'expired'
export type PaymentMethod = 'nequi' | 'daviplata' | 'bancolombia' | 'paypal' | 'cash' | 'transfer'
export type DivisionMode = 'exact' | 'equal' | 'hybrid'
export type ParticipantStatus = 'pending' | 'selecting' | 'done'

export interface SplitSession {
  id: string
  split_id: string // short code e.g. ABCD123
  host_id: string
  title: string
  status: SplitStatus
  division_mode: DivisionMode
  receipt_url?: string
  receipt_data?: ReceiptData
  total_amount: number
  tax_amount?: number
  tip_amount?: number
  tip_percentage?: number
  payers: Payer[]
  participants: Participant[]
  items: ReceiptItem[]
  debts: Debt[]
  created_at: string
  updated_at: string
  expires_at: string
}

export interface ReceiptData {
  raw_text?: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  tip: number
  total: number
  currency: string
  restaurant_name?: string
  date?: string
}

export interface ReceiptItem {
  id: string
  name: string
  qty: number
  unit_price: number
  total_price: number
  category?: string
  is_shared: boolean
  assigned_to: string[] // participant ids
}

export interface Participant {
  id: string
  session_id: string
  name: string
  is_host: boolean
  is_present: boolean
  status: ParticipantStatus
  payment_methods: PaymentMethodInfo[]
  represented_by?: string // participant id
  represents: string[] // participant ids
  subtotal: number
  tax_share: number
  tip_share: number
  total_owed: number
  last_seen: string
  joined_at: string
}

export interface PaymentMethodInfo {
  type: PaymentMethod
  handle: string // e.g. phone number, alias
  qr_url?: string
}

export interface Payer {
  participant_id: string
  amount_paid: number
  percentage: number
}

export interface Debt {
  from_participant_id: string
  to_participant_id: string
  amount: number
  is_settled: boolean
  settled_at?: string
}

// ─── Realtime Presence ────────────────────────────────────────────────────────

export interface PresenceState {
  participant_id: string
  name: string
  status: ParticipantStatus
  online_at: string
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface GuestInfo {
  id: string
  name: string
  payment_methods: PaymentMethodInfo[]
}

export interface ItemAssignment {
  item_id: string
  participant_ids: string[]
  qty_per_person?: Record<string, number>
}
