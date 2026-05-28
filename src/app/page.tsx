import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-accent-green flex items-center justify-center">
            <span className="text-bg-base font-bold text-lg">M</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Mond<span className="text-accent-green">AI</span>
          </span>
        </div>

        <h1 className="text-4xl font-bold leading-tight">
          Divide cuentas{' '}
          <span className="text-accent-green">inteligente</span>
        </h1>

        <p className="text-text-secondary text-lg leading-relaxed">
          Escanea facturas, divide con amigos en tiempo real y cobra sin drama.
        </p>

        <div className="pt-4 space-y-3">
          <p className="text-text-muted text-sm">
            Para acceder a una sesión, usa el link que te compartieron.
          </p>
          <code className="block text-accent-green/70 text-sm font-mono bg-bg-card px-4 py-2 rounded-xl border border-bg-border">
            split.gvfokinserver.store/split/CÓDIGO
          </code>
        </div>
      </div>
    </main>
  )
}
