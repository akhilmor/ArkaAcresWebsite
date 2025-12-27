import type { Metadata } from 'next'
import PageRenderer from '@/components/PageRenderer'
import { YOGA_PAGE, SITE_CONFIG } from '@/content/siteContent'

export const metadata: Metadata = {
  title: `Yoga Workshops - ${SITE_CONFIG.name}`,
  description: YOGA_PAGE.description,
}

export default function YogaPage() {
  return <PageRenderer sections={YOGA_PAGE.sections} />
}

