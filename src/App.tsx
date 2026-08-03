import { ContentProvider } from '@/shared/content/ContentProvider'
import HomePage from '@/modules/portfolio/pages/home'

export default function App() {
  return (
    <ContentProvider>
      <HomePage />
    </ContentProvider>
  )
}
