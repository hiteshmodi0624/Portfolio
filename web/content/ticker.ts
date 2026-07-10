import { TickerSchema, type TickerItem } from './schema'
import { stats } from './stats'

/**
 * Beat 5 results ticker. NUMBERS come from the stats module (never hardcoded
 * in components); LABELS are copy and live here with the rest of the content.
 */
export const ticker: TickerItem[] = TickerSchema.parse([
  {
    id: 'speed',
    value: stats.manual.daysToFirstPayingCustomer,
    notation: 'plain',
    suffix: ' days',
    label: 'from idea to paying customers',
  },
  {
    id: 'scale',
    value: stats.manual.requestsPerDay,
    notation: 'compact',
    suffix: '+',
    label: 'requests served every day',
  },
  {
    id: 'reach',
    value: stats.manual.clientCountries,
    notation: 'plain',
    suffix: '',
    label: 'countries where clients run my work',
  },
])
