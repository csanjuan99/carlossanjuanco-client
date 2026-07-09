export interface StackGroup {
  name: string
  items: string[]
}

export const STACK_GROUPS: StackGroup[] = [
  { name: 'FRONTEND', items: ['React', 'TypeScript', 'Next.js', 'Vue'] },
  { name: 'BACKEND', items: ['Node.js', 'Python', 'Go', 'GraphQL'] },
  { name: 'INFRA / DEVOPS', items: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'] },
  { name: 'DATA', items: ['PostgreSQL', 'Redis', 'MongoDB', 'Elasticsearch'] },
]
