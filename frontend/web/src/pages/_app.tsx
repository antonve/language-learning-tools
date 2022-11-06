import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../app/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="apple-mobile-web-app-title" content="OCR Reader" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
