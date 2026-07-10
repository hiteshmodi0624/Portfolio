import { Cases } from '@/components/beats/cases'
import { Chaos } from '@/components/beats/chaos'
import { Finale } from '@/components/beats/finale'
import { Hero } from '@/components/beats/hero'
import { Human } from '@/components/beats/human'
import { Proof } from '@/components/beats/proof'
import { Services } from '@/components/beats/services'
import { Storefront } from '@/components/beats/storefront'
import { Turn } from '@/components/beats/turn'
import { MotionProvider } from '@/components/motion-provider'
import { cases } from '@/content/case-studies'
import { human } from '@/content/human'
import { profile } from '@/content/profile'
import { proof } from '@/content/projects'
import { services, servicesIntro } from '@/content/services'
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
        <Cases cases={cases} />
        <Proof proof={proof} ticker={ticker} />
        <Services intro={servicesIntro} services={services} />
        <Human human={human} />
        <Finale finale={profile.finale} />
      </main>
    </MotionProvider>
  )
}
