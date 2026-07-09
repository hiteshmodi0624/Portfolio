import { Finale } from '@/components/beats/finale'
import { Hero } from '@/components/beats/hero'
import { MotionProvider } from '@/components/motion-provider'
import { profile } from '@/content/profile'

export default function HomePage() {
  return (
    <MotionProvider>
      <main>
        <Hero hero={profile.hero} />
        <Finale finale={profile.finale} />
      </main>
    </MotionProvider>
  )
}
