import Layout from '@/components/layout/layout';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hitesh Modi — Engineer & Founder</title>
        <meta
          name="description"
          content="Software Engineer & Founder. Architecture-first code, AI-augmented productivity. Building Extrack (SaaS with paying customers) and shipping production systems at Digital Alpha Technologies."
        />
        <meta property="og:title" content="Hitesh Modi — Engineer & Founder" />
        <meta property="og:description" content="I write architecture-first code, ship fast with AI, and build products people pay for." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiteshmodi.in" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@hiteshmodi_" />
        <meta name="theme-color" content="#080808" />
        <link rel="canonical" href="https://hiteshmodi.in" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Hitesh Modi",
              "url": "https://hiteshmodi.in",
              "email": "mail@hiteshmodi.in",
              "jobTitle": "Software Engineer & Founder",
              "description": "Software Engineer with 2+ years of production experience. Founder of Extrack. Expert in React Native, AWS, Python, and AI/LLM integrations.",
              "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "National Institute of Technology, Kurukshetra"
              },
              "knowsAbout": ["React Native", "AWS", "Python", "TypeScript", "Mapbox GL", "OpenAI API", "FastAPI", "Next.js", "DynamoDB", "Software Architecture", "AI Tools", "Claude Code", "Cursor"],
              "sameAs": [
                "https://github.com/hiteshmodi0624",
                "https://linkedin.com/in/hiteshmodi0624",
                "https://twitter.com/hiteshmodi_"
              ]
            })
          }}
        />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  );
}
