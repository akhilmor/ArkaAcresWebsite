import type { Metadata } from 'next'
import PageRenderer from '@/components/PageRenderer'
import { LEARN_PAGE, SITE_CONFIG } from '@/content/siteContent'

export const metadata: Metadata = {
  title: `Learning Programs - ${SITE_CONFIG.name}`,
  description: LEARN_PAGE.description,
}

export default function LearnPage() {
  return <PageRenderer sections={LEARN_PAGE.sections} />
}

