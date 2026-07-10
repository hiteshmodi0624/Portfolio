import { CasesSchema, type CasesContent } from './schema'

/**
 * Deep case studies — the PDF portfolio's pages 4–7, one per build, in PDF
 * order: Ditch Navigation, quri, Extrack, WhyCosmos. The prose is the PDF
 * copy verbatim, adjusted only where the medium differs (a web page, not a
 * document). Extrack, WhyCosmos and quri ALSO keep their proof-gallery
 * cards — intended redundancy: the gallery is the skim, this is the read.
 */
export const cases: CasesContent = CasesSchema.parse({
  heading: 'Four builds, up close',
  lede: 'What it actually looks like when one engineer takes a problem from mess to shipped.',
  items: [
    {
      slug: 'ditch-navigation',
      heading: 'Helping mariners find safe water, a million times a day.',
      category: { label: 'Client project · United States', tone: 'sky' },
      blocks: [
        {
          label: 'The problem',
          body: 'Ditch Navigation guides boaters through shallow, poorly charted waters, where a wrong turn can mean a grounded hull. Their app needed depth data that loads instantly, and their old stack was starting to buckle under growth.',
        },
        {
          label: 'What I built',
          body: 'I rebuilt their flagship navigation app from the ground up and had it live in three months. Behind it sits a data pipeline on AWS that turns raw survey data into instant answers, plus an open-source mapping library that their other apps now reuse.',
        },
        {
          label: 'The outcome',
          body: 'Lookups that used to take up to two seconds now come back in under 60 milliseconds. The system quietly serves over a million requests every single day, and boaters get their answer before the boat has moved a meter.',
        },
      ],
      stats: [
        { value: '1M+', label: 'requests served, every day' },
        { value: '−97%', label: 'response time, 2s down to 60ms' },
        { value: '3 mo', label: 'full app rebuild, live in production' },
      ],
      url: 'https://www.ditchnavigation.com',
      tech: 'React Native · AWS Lambda + Glue · Mapbox GL · real-time data pipeline',
      image: {
        src: '/shots/ditch-navigation.png',
        width: 1200,
        height: 750,
        alt: 'The Ditch Navigation website, live',
      },
    },
    {
      slug: 'quri',
      heading: 'A quiet watchtower for your business numbers.',
      category: { label: 'My own product · AI for startups', tone: 'violet' },
      blocks: [
        {
          label: 'The problem',
          body: 'Founders check five dashboards before breakfast. Payments, analytics, ads, support. Most mornings nothing has changed. But on the morning something has, they usually find out a week too late, from an annoyed customer.',
        },
        {
          label: 'What I built',
          body: 'quri plugs into the tools a startup already runs, like PostHog, Razorpay and Google Analytics. It learns what a normal week looks like and speaks up the moment a number drifts, over Slack, email or Linear. It can take small, safe actions too, and every single one waits for approval and lands in an audit log.',
        },
        {
          label: 'Where it stands',
          body: 'Built solo and moving fast: 30+ data connectors, three alert channels, and a test suite more than seven thousand strong keeping every release honest. AI assistants like Claude can plug straight into it as well.',
        },
      ],
      stats: [
        { value: '30+', label: 'connectors to tools startups already use' },
        { value: '7,000+', label: 'automated tests behind every release' },
        { value: '24/7', label: "watching, so the founder doesn't have to" },
      ],
      url: 'https://myquri.com',
      tech: 'TypeScript · anomaly detection · PostHog, Razorpay & GA4 connectors · MCP',
      image: {
        src: '/shots/quri.png',
        width: 1200,
        height: 750,
        alt: 'The quri website, live',
      },
    },
    {
      slug: 'extrack',
      heading: 'From idea to paying customers in 15 days.',
      category: { label: 'My own product · Fintech', tone: 'violet' },
      blocks: [
        {
          label: 'The idea',
          body: 'Money tracking that answers back. Extrack is a personal-finance product where you talk to your books in plain words: file an expense, split a bill with a friend, or just ask where the money went this month.',
        },
        {
          label: 'What I built',
          body: 'The whole thing, solo. Product, design, build, launch, and billing. It runs serverless on AWS, and its AI side speaks the same protocol that tools like Claude use natively: 29 actions an assistant can safely take on your behalf, each one with your approval built in.',
        },
        {
          label: 'Why it matters to you',
          body: 'This is the speed that AI-first building unlocks. Fifteen days from a blank folder to strangers paying for it. The same approach is exactly what The Full Build brings to your idea.',
        },
      ],
      stats: [
        { value: '15 days', label: 'idea to first paying customers' },
        { value: '29', label: 'AI-assistant actions, each approval-gated' },
        { value: 'Solo', label: 'design, build, launch & billing, one engineer' },
      ],
      url: 'https://myextrack.com',
      tech: 'Next.js · AWS serverless · subscription billing · MCP (AI-agent protocol)',
      image: {
        src: '/shots/extrack.png',
        width: 1200,
        height: 750,
        alt: 'The Extrack website, live',
      },
    },
    {
      slug: 'whycosmos',
      heading: 'Course creation used to take a month. Now it takes ten days.',
      category: { label: 'Product engineering · EdTech', tone: 'blush' },
      blocks: [
        {
          label: 'The problem',
          body: 'WhyCosmos teaches kids to fall in love with space. But every new course meant weeks of hand-building lessons. Around it sat live classes, certificates, emails and school onboarding, all of it running on people power.',
        },
        {
          label: 'What I build there',
          body: 'I engineer the platform end to end. An AI authoring assistant on the Claude API drafts and edits lesson pages, with the teacher approving every change. Live classes schedule themselves on Google Meet, and the recordings arrive securely afterwards. A messaging pipeline sends thirteen kinds of email on its own, and entire schools can be onboarded in bulk through a module with 22 APIs behind it.',
        },
        {
          label: 'The outcome',
          body: 'Creating a course dropped from a month of work to about ten days. And with 2,400+ automated tests underneath, the platform stays safe to change every single week.',
        },
      ],
      stats: [
        { value: '10 days', label: 'to create a course, down from a month' },
        { value: '22', label: 'APIs running the schools module' },
        { value: '2,400+', label: 'automated tests guarding the platform' },
      ],
      url: 'https://whycosmos.com',
      tech: 'React · AWS serverless · Claude API · Google Meet integration',
      image: {
        src: '/shots/whycosmos.png',
        width: 1200,
        height: 750,
        alt: 'The WhyCosmos website, live',
      },
    },
  ],
})
