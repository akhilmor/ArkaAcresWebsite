import Link from 'next/link'

interface FeatureCardProps {
  title: string
  description: string
  href?: string
  className?: string
}

export default function FeatureCard({
  title,
  description,
  href,
  className = '',
}: FeatureCardProps) {
  const cardContent = (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
        href ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <h3 className="text-xl font-serif text-earth-800 font-semibold mb-3">
        {title}
      </h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  )

  if (href) {
    return <Link href={href}>{cardContent}</Link>
  }

  return cardContent
}

