import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../lib/globals.css'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="apple-mobile-web-app-title" content="OCR Reader" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  )
}

export default MyApp
