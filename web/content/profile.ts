import { ProfileSchema, type Profile } from './schema'

export const profile: Profile = ProfileSchema.parse({
  name: 'Hitesh Modi',
  siteUrl: 'https://hiteshmodi.in',
  metaDescription:
    'Beautiful websites and AI helpers that never sleep, built end-to-end by one engineer. A little magic for your business.',
  hero: {
    h1: 'A little magic for your business.',
    sub: 'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
    availability: 'Available for new projects',
    ctaLabel: 'Start your project',
    ctaHref: '#finale',
    scrollCue: 'show me how ↓',
    identity: {
      name: 'Hitesh Modi',
      line: 'builds these end-to-end, replies same day',
      photo: { src: '/images/hitesh-96.jpg', alt: 'Portrait of Hitesh Modi' },
    },
  },
  finale: {
    heading: "Let's build your magic",
    email: 'mail@hiteshmodi.in',
    calUrl: 'https://cal.com/hiteshmodi',
  },
})
