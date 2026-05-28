import type { Metadata, Viewport } from 'next'
import { Space_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'MondAI — Split Bill',
  description: 'Divide la cuenta de forma inteligente con tus amigos',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'MondAI — Split Bill',
    description: 'Divide la cuenta de forma inteligente con tus amigos',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#080B10',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${spaceMono.variable} bg-bg-base text-text-primary antialiased`}
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <div className="min-h-screen bg-bg-base bg-gradient-mesh">
          {children}
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#141820',
              color: '#F0F4FF',
              border: '1px solid #1E2530',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#00E5A0', secondary: '#080B10' },
            },
            error: {
              iconTheme: { primary: '#FF4D6D', secondary: '#080B10' },
            },
          }}
        />
      </body>
    </html>
  )
}
