'use client'

interface ImagePlaceholderProps {
  label: string
  className?: string
  aspectRatio?: 'square' | 'wide' | 'tall'
}

export default function ImagePlaceholder({ label, className = '', aspectRatio = 'wide' }: ImagePlaceholderProps) {
  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]',
  }

  return (
    <div className={`${aspectClasses[aspectRatio]} bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg flex items-center justify-center ${className}`}>
      <p className="text-neutral-500 text-sm text-center px-4">{label}</p>
    </div>
  )
}

