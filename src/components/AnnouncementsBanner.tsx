'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { SITE_CONFIG } from '@/content/siteContent'

export default function AnnouncementsBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (!SITE_CONFIG.announcements.enabled || dismissed || !SITE_CONFIG.announcements.message) {
    return null
  }

  return (
    <div className="bg-primary text-white py-3 px-4 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4">
          <p className="text-sm font-medium text-center flex-1">
            {SITE_CONFIG.announcements.message}
            {SITE_CONFIG.announcements.link && (
              <Link
                href={SITE_CONFIG.announcements.link}
                className="ml-2 underline hover:no-underline font-semibold"
              >
                Learn more →
              </Link>
            )}
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss announcement"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

