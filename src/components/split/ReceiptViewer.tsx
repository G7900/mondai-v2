'use client'

import { useState } from 'react'
import { ZoomIn, X, Maximize2 } from 'lucide-react'
import Image from 'next/image'

interface ReceiptViewerProps {
  receiptUrl: string
  restaurantName?: string
}

export function ReceiptViewer({ receiptUrl, restaurantName }: ReceiptViewerProps) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <>
      {/* Thumbnail */}
      <div className="relative group cursor-pointer" onClick={() => setFullscreen(true)}>
        <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-bg-elevated border border-bg-border">
          <Image
            src={receiptUrl}
            alt={restaurantName ?? 'Factura'}
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            {restaurantName && (
              <span className="text-sm font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                {restaurantName}
              </span>
            )}
            <div className="ml-auto bg-black/40 backdrop-blur-sm rounded-xl p-2">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-accent-green/20 transition-all" />
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-bg-card border border-bg-border flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
          <div
            className="relative w-full max-w-sm max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={receiptUrl}
              alt={restaurantName ?? 'Factura'}
              width={400}
              height={800}
              className="w-full h-auto rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
