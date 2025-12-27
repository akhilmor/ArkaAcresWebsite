import Link from 'next/link'

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  external?: boolean
}

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  className = '',
  external = false,
}: CTAButtonProps) {
  const baseStyles =
    'inline-block px-6 py-3 text-sm font-semibold rounded-md transition-colors'
  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-dark',
    secondary:
      'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}

