import { HumanSchema, type HumanContent } from './schema'

/**
 * Beat 7 — "One engineer, no circus" (spec §3.4). The person behind every
 * other beat. Story stays plain-spoken; the tech vocabulary is deliberately
 * quarantined in nerdyBits (a native <details> dark panel, open by default
 * but still collapsible — PDF page 9 .nerdy treatment).
 */
export const human: HumanContent = HumanSchema.parse({
  heading: 'One engineer, no circus',
  name: 'Hitesh Modi',
  story: [
    "I'm Hitesh. Every project on this page, from design to build to launch, was done by me, start to finish. No agency, no hand-offs, no \"let me check with the team\".",
    "I build with AI every single day. That's why things that used to take months take me weeks, and why the helpers I build actually work the way the demos promise.",
    'Clients run my work in Australia, the US, and Southeast Asia. Wherever you are, you get answers the same day, usually within the hour.',
  ],
  nerdyBits: {
    label: 'the nerdy bits, for your technical friend',
    items: [
      'AWS end-to-end: CDK-defined infrastructure, S3 + CloudFront, Lambda, SES',
      'AI agent infrastructure: MCP servers, tool-calling pipelines, eval harnesses',
      'Static sites tuned to a hard JS budget, tested with Playwright end-to-end',
      'Production systems serving 1M+ requests a day',
    ],
  },
  facts: [
    {
      label: 'Home base',
      body: 'Guwahati, India. Clients across four time zones, from Sydney to San Francisco.',
    },
    {
      label: 'Education',
      body: 'B.Tech from NIT Kurukshetra, class of 2024.',
    },
    {
      label: 'Off hours',
      body: 'Chess, mostly. And competitive programming: ranked 1559 in the world at Google Kickstart.',
      link: {
        label: 'chess.com/hiteshmodi0624',
        href: 'https://www.chess.com/member/hiteshmodi0624',
      },
    },
  ],
  photo: {
    src: '/images/hitesh-crop-640.jpg',
    alt: 'Portrait of Hitesh Modi',
    width: 640,
    height: 575,
  },
})
