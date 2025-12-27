// Content model types for dynamic page rendering

export type CTA = {
  label: string
  href: string
  external?: boolean
  variant?: 'primary' | 'secondary'
}

export type HeroSection = {
  type: 'hero'
  heading: string
  subheading: string
  supportingText?: string
  primaryCta: CTA
  secondaryCta?: CTA
  imageLabel?: string
  imageSrc?: string
  imagePosition?: 'left' | 'right'
}

export type StatItem = {
  value: string
  label: string
  suffix?: string
}

export type StatsSection = {
  type: 'stats'
  heading?: string
  items: StatItem[]
  backgroundColor?: 'white' | 'neutral' | 'sage'
}

export type FeatureItem = {
  title: string
  description: string
  icon?: string
}

export type FeatureGridSection = {
  type: 'featureGrid'
  heading: string
  subtitle?: string
  items: FeatureItem[]
  cta?: CTA
  columns?: 2 | 3 | 4
}

export type SplitSection = {
  type: 'split'
  heading: string
  body: string
  bullets?: string[]
  imageLabel?: string
  imageSrc?: string
  cta?: CTA
  reverse?: boolean
}

export type CardItem = {
  title: string
  description: string
  href: string
  icon?: string
  imageLabel?: string
  imageSrc?: string
}

export type CardListSection = {
  type: 'cards'
  heading: string
  subtitle?: string
  items: CardItem[]
  columns?: 2 | 3 | 4
  groupHeading?: string
}

export type FAQItem = {
  q: string
  a: string
}

export type FAQSection = {
  type: 'faq'
  heading: string
  subtitle?: string
  items: FAQItem[]
}

export type CTABandSection = {
  type: 'ctaBand'
  heading: string
  body?: string
  buttons: CTA[]
  variant?: 'primary' | 'secondary'
}

export type ContactSection = {
  type: 'contact'
  heading: string
  description?: string
  showForm?: boolean
}

export type TimelineItem = {
  time: string
  title: string
  description: string
}

export type TimelineSection = {
  type: 'timeline'
  heading: string
  subtitle?: string
  items: TimelineItem[]
}

export type Section =
  | HeroSection
  | StatsSection
  | FeatureGridSection
  | SplitSection
  | CardListSection
  | FAQSection
  | CTABandSection
  | ContactSection
  | TimelineSection

export type PageContent = {
  title: string
  description?: string
  sections: Section[]
}
