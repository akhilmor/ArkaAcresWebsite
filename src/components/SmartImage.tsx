'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SmartImageProps {
  src?: string
  alt: string
  priority?: boolean
  className?: string
  aspectRatio?: 'square' | 'wide' | 'tall' | 'auto'
  fallbackLabel?: string
}

export default function SmartImage({
  src,
  alt,
  priority = false,
  className = '',
  aspectRatio = 'wide',
  fallbackLabel,
}: SmartImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]',
    auto: '',
  }

  // Fallback gradient placeholder
  const FallbackPlaceholder = () => (
    <div
      className={`${aspectClasses[aspectRatio]} bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center ${className}`}
    >
      <p className="text-neutral-400 text-sm text-center px-4">
        {fallbackLabel || alt || 'Image placeholder'}
      </p>
    </div>
  )

  // If no src or error, show fallback
  if (!src || imageError) {
    return <FallbackPlaceholder />
  }

  // If aspectRatio is 'auto', don't apply aspect class (parent controls size)
  const wrapperClasses = aspectRatio === 'auto' 
    ? `relative ${className} overflow-hidden`
    : `relative ${aspectClasses[aspectRatio]} ${className} rounded-lg overflow-hidden`

  return (
    <div className={wrapperClasses}>
      {/* Loading shimmer */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse" />
      )}
      
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 700px"
      />
    </div>
  )
}

