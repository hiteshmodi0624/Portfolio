import Layout from '@/components/layout/layout';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
;
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
      <Layout>
          <Head>
              <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1"
              />
              <title>Hitesh Modi</title>
              <meta
                  name="description"
                  content="Hello I'm Hitesh Modi.A skilled full-stack developer with expertise in Next.js, Typescript, TailwindCss, React, and Node.js. I love contributing to open-source projects and solving coding challenges."
              />
              
          </Head>
          <Component {...pageProps} />
          <Analytics />
      </Layout>
  );
}
