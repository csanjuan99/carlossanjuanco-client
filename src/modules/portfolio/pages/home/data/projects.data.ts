export interface ProjectData {
  id: 'obra1' | 'obra2' | 'obra3'
  numeral: string
  slotId: string
  year: string
  stack: string
  link: string
}

export const PROJECTS: ProjectData[] = [
  { id: 'obra1', numeral: 'I', slotId: 'obra-1', year: '2025', stack: 'React · Node.js · PostgreSQL', link: '#' },
  { id: 'obra2', numeral: 'II', slotId: 'obra-2', year: '2024', stack: 'Next.js · Go · Kubernetes', link: '#' },
  { id: 'obra3', numeral: 'III', slotId: 'obra-3', year: '2023', stack: 'Vue · Python · AWS', link: '#' },
]
