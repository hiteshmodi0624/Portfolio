import { Chaos } from '@/components/beats/chaos'
import { Finale } from '@/components/beats/finale'
import { Hero } from '@/components/beats/hero'
import { Proof } from '@/components/beats/proof'
import { Storefront } from '@/components/beats/storefront'
import { Turn } from '@/components/beats/turn'
import { MotionProvider } from '@/components/motion-provider'
import { profile } from '@/content/profile'
import { proof } from '@/content/projects'
import { story } from '@/content/story'
import { ticker } from '@/content/ticker'

export default function HomePage() {
  return (
    <MotionProvider>
      <main>
        <Hero hero={profile.hero} />
        <Chaos chaos={story.chaos} />
        {/* the page hands beat-2's cards to beat 3 — beats never import beats */}
        <Turn turn={story.turn} cards={story.chaos.cards} />
        <Storefront storefront={story.storefront} />
        <Proof proof={proof} ticker={ticker} />
        <Finale finale={profile.finale} />
      </main>
    </MotionProvider>
  )
}
