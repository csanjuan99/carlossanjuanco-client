export interface StrapiMedia {
  url: string
  alternativeText?: string | null
}

export interface HeroContent {
  eyebrow: string
  titleBefore: string
  titleEmphasis: string
  subtitle: string
  imageAlt: string
  scrollHint: string
  image?: StrapiMedia | null
}

export interface ManifestoContent {
  label: string
  quote: string
  technique: string
}

export interface SectionHeadingContent {
  label: string
  title: string
}

export interface ObrasSectionContent extends SectionHeadingContent {
  numeralPrefix: string
  technique: string
  role: string
  year: string
  result: string
  cta: string
  imagePlaceholder: string
  plateLabel: string
}

export interface ContactContent {
  label: string
  title: string
  subtitle: string
  cta: string
  email: string
}

export interface SiteSettingContent {
  githubUrl: string
  linkedinUrl: string
  email: string
  copyright: string
  githubLabel: string
  linkedinLabel: string
  emailLabel: string
}

export interface Project {
  documentId: string
  numeral: string
  year: string
  order: number
  stack: string
  link: string
  title: string
  description: string
  role: string
  result: string
  image?: StrapiMedia | null
}

export interface Experience {
  documentId: string
  order: number
  years: string
  company: string
  role: string
  feat: string
}

export interface Testimonial {
  documentId: string
  order: number
  quote: string
  author: string
}

export interface StackGroup {
  documentId: string
  name: string
  order: number
  items: { label: string }[]
}

export interface SiteContent {
  hero: HeroContent
  manifesto: ManifestoContent
  stackSection: SectionHeadingContent
  obrasSection: ObrasSectionContent
  friezeSection: SectionHeadingContent
  testimonialsSection: SectionHeadingContent
  contact: ContactContent
  siteSetting: SiteSettingContent
  projects: Project[]
  experiences: Experience[]
  testimonials: Testimonial[]
  stackGroups: StackGroup[]
}
