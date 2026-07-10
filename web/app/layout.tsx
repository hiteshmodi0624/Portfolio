import type { Metadata } from 'next'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { profile } from '@/content/profile'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const title = `${profile.name} · ${profile.hero.h1}`

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title,
  description: profile.metaDescription,
  alternates: { canonical: profile.siteUrl },
  openGraph: {
    title,
    description: profile.metaDescription,
    url: profile.siteUrl,
    siteName: profile.name,
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-base font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
