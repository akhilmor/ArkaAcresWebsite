import type { Metadata } from 'next'
import PageRenderer from '@/components/PageRenderer'
import { ACTIVITIES_PAGE, SITE_CONFIG } from '@/content/siteContent'

export const metadata: Metadata = {
  title: `Activities - ${SITE_CONFIG.name}`,
  description: ACTIVITIES_PAGE.description,
}

export default function ActivitiesPage() {
  return <PageRenderer sections={ACTIVITIES_PAGE.sections} />
}
