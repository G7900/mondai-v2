# MondAI Split — Web Colaborativa

Página web para sesiones de split bill en tiempo real.  
Stack: **Next.js 14 · Tailwind CSS · Supabase Realtime · Docker**

---

## 🚀 Deploy en tu servidor (Coolify)

### 1. Base de datos — Supabase

Abre `supabase.gvfokinserver.store` → **SQL Editor** y ejecuta:

```
supabase-schema.sql
```

Luego activa Realtime para las tablas:  
`Table Editor → split_sessions / participants / receipt_items / debts → Enable Realtime`

Copia tu **anon key** desde `Settings → API`.

---

### 2. Deploy en Coolify

1. **New Resource → Docker Image** (o Git repo si subes el código)
2. Configura el dominio: `split.gvfokinserver.store`
3. Agrega las variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.gvfokinserver.store
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
NEXT_PUBLIC_APP_URL=https://split.gvfokinserver.store
```

4. Coolify detecta el `Dockerfile` y construye automáticamente
5. Traefik maneja el SSL automáticamente ✅

---

### 3. Build local (opcional)

```bash
cp .env.example .env.local
# Edita .env.local con tus valores

npm install
npm run dev        # desarrollo en localhost:3000
npm run build      # build de producción
```

---

## 📱 Flujo de uso

```
App Android crea sesión → genera link mondai.app/split/ABCD123
         ↓
Comparte por WhatsApp / QR
         ↓
Invitados abren el link en el navegador
         ↓
Ingresan su nombre (sin cuenta)
         ↓
Seleccionan qué consumieron
         ↓
Sistema calcula deudas en tiempo real
         ↓
Cada uno ve a quién le debe y cuánto
         ↓
Copian número Nequi / Daviplata y pagan
```

---

## 🗂 Estructura

```
src/
├── app/
│   ├── layout.tsx          # Root layout, tema oscuro
│   ├── page.tsx            # Home
│   └── split/[id]/
│       └── page.tsx        # ← Página principal del split
├── components/
│   ├── ui/                 # Button, Badge, Avatar
│   └── split/              # JoinModal, ParticipantsBar, ReceiptItemsList, DebtsSummary
├── hooks/
│   └── useRealtimeSession  # Supabase Realtime + Presence
├── lib/
│   ├── supabase.ts         # Cliente + helpers
│   ├── store.ts            # Zustand state
│   └── utils.ts            # Formateo, cálculos
└── types/
    └── index.ts            # Todos los tipos TypeScript
```

---

## 🎨 Design System

| Token | Valor |
|-------|-------|
| Fondo base | `#080B10` |
| Card | `#0E1219` |
| Accent green | `#00E5A0` |
| Accent blue | `#3B82F6` |
| Fuente | DM Sans |
| Fuente mono | Space Mono |

---

## 🔌 Integración con Android

La app Android crea la sesión en Supabase y genera el `split_id`.  
La URL del split es simplemente:

```
https://split.gvfokinserver.store/split/{split_id}
```

La web lee esa sesión, conecta el realtime y maneja todo el flujo colaborativo.
