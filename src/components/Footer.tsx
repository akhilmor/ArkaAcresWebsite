import Link from 'next/link'
import { NAV_ITEMS } from '@/content/siteContent'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => {
                if (item.external) {
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                }
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/activities" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Plan a Visit
                </Link>
              </li>
              <li>
                <Link href="/stay" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Stay Booking
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Arka Acres. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
