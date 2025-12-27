import type { Metadata } from 'next'
import PageRenderer from '@/components/PageRenderer'
import { HOME_PAGE, SITE_CONFIG } from '@/content/siteContent'

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
}

export default function HomePage() {
  return <PageRenderer sections={HOME_PAGE.sections} />
}
