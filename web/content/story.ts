import { StorySchema, type StoryContent } from './schema'

export const story: StoryContent = StorySchema.parse({
  chaos: {
    heading: 'Your week right now',
    lede: "Running the business is the part you love. It's everything else that piles up.",
    cards: [
      {
        id: 'whatsapp',
        kind: 'message',
        hue: 'amber',
        title: 'WhatsApp · 11:47 PM',
        body: '“Hi! Do you have anything free this Saturday?”',
        meta: 'Still unanswered',
      },
      {
        id: 'invoice',
        kind: 'invoice',
        hue: 'red',
        title: 'Invoice #114',
        body: '$1,850, three weeks overdue',
        meta: 'You keep meaning to chase it',
      },
      {
        id: 'booking',
        kind: 'booking',
        hue: 'red',
        title: 'Missed call · new customer',
        body: 'They wanted Saturday. They booked someone else.',
        meta: 'Yesterday, 4:12 PM',
      },
      {
        id: 'email',
        kind: 'email',
        hue: 'amber',
        title: 'Inbox',
        body: '47 unread. Six of them matter. Which six?',
        meta: 'Growing since Tuesday',
      },
      {
        id: 'note-tiles',
        kind: 'note',
        hue: 'amber',
        title: 'Note to self',
        body: 'Call the tile guy back. TODAY.',
      },
      {
        id: 'note-website',
        kind: 'note',
        hue: 'red',
        title: 'Note to self',
        body: 'Fix the website?? (someday)',
      },
    ],
  },
  turn: {
    heading: 'Then, quietly, it all gets handled',
    lede: 'While you were asleep:',
    time: '2:14 AM',
    closer: 'You find out over coffee. Everything just… happened.',
    events: [
      {
        id: 'customer-message',
        kind: 'customer',
        wash: 'sky',
        text: '“Hey, do you have anything free this Saturday?”',
        meta: '2:14 AM',
      },
      {
        id: 'helper-reply',
        kind: 'helper',
        wash: 'lavender',
        text: '“We do! 10:30 on Saturday just opened up. Want me to book you in?”',
        meta: 'Answered in 4 seconds',
      },
      {
        id: 'booking-confirmed',
        kind: 'event',
        wash: 'sky',
        text: 'Booking confirmed for Saturday, 10:30 AM',
      },
      {
        id: 'invoice-sent',
        kind: 'event',
        wash: 'lavender',
        text: 'Invoice sent, with a pay-now link',
      },
      {
        id: 'follow-up',
        kind: 'event',
        wash: 'blush',
        text: 'Follow-up scheduled for Tuesday morning',
      },
    ],
  },
  storefront: {
    heading: 'And it looks gorgeous doing it',
    punchline: 'Your website should be your best salesperson.',
    before: {
      title: 'WELCOME TO OUR WEBSITE',
      nav: ['Home', 'About Us', 'Services', 'Gallery', 'Contact', 'FAQ'],
      line: 'We are committed to quality and service since 2009.',
    },
    after: {
      title: 'Saturday has three openings left.',
      line: 'Pick a time. It takes under a minute.',
      cta: 'Book Saturday',
    },
    metric: { label: 'enquiries this week', from: 2, to: 11 },
  },
})
