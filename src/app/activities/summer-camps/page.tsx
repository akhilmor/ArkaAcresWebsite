import type { Metadata } from 'next'
import PageRenderer from '@/components/PageRenderer'
import { SUMMER_CAMPS_PAGE, SITE_CONFIG } from '@/content/siteContent'

export const metadata: Metadata = {
  title: `Summer Camps - ${SITE_CONFIG.name}`,
  description: SUMMER_CAMPS_PAGE.description,
}

export default function SummerCampsPage() {
  return <PageRenderer sections={SUMMER_CAMPS_PAGE.sections} />
}

