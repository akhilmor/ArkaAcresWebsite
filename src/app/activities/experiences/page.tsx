import type { Metadata } from 'next'
import PageRenderer from '@/components/PageRenderer'
import { EXPERIENCES_PAGE, SITE_CONFIG } from '@/content/siteContent'

export const metadata: Metadata = {
  title: `Farm Experiences - ${SITE_CONFIG.name}`,
  description: EXPERIENCES_PAGE.description,
}

export default function ExperiencesPage() {
  return <PageRenderer sections={EXPERIENCES_PAGE.sections} />
}

