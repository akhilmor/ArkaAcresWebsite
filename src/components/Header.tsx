'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '@/content/siteContent'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-neutral-200'
          : 'bg-white/95 backdrop-blur-sm border-b border-neutral-200'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-serif text-earth-800 font-semibold">
              Arka Acres
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const active = !item.external && isActive(item.href)
              
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary transition-colors rounded-md hover:bg-neutral-50 whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-md whitespace-nowrap ${
                    active
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-neutral-700 hover:text-primary hover:bg-neutral-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              href="/activities"
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Plan a Visit
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-neutral-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = !item.external && isActive(item.href)
                
                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-3 text-base font-medium text-neutral-700 hover:text-primary hover:bg-neutral-50 rounded-md transition-colors min-h-[44px] flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  )
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-3 text-base font-medium rounded-md transition-colors min-h-[44px] flex items-center ${
                      active
                        ? 'text-primary bg-primary/10'
                        : 'text-neutral-700 hover:text-primary hover:bg-neutral-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <Link
                href="/activities"
                className="block mx-3 mt-4 px-4 py-3 text-sm font-medium text-center text-white bg-primary hover:bg-primary-dark rounded-md transition-colors min-h-[44px] flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plan a Visit
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
