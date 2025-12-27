import type { Metadata } from 'next'
import PageRenderer from '@/components/PageRenderer'
import { FARMING_PAGE, SITE_CONFIG } from '@/content/siteContent'

export const metadata: Metadata = {
  title: `Farming - ${SITE_CONFIG.name}`,
  description: FARMING_PAGE.description,
}

export default function FarmingPage() {
  return <PageRenderer sections={FARMING_PAGE.sections} />
}
