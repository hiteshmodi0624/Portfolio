import { Finale } from '@/components/beats/finale'
import { Hero } from '@/components/beats/hero'
import { profile } from '@/content/profile'

export default function HomePage() {
  return (
    <main>
      <Hero hero={profile.hero} />
      <Finale finale={profile.finale} />
    </main>
  )
}
