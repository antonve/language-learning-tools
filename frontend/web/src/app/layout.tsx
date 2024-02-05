import { Metadata } from 'next'
import '../lib/globals.css'
import { ReactQueryClientProvider } from 'src/components/ReactQueryClientProvider'

export const metadata: Metadata = {
  title: 'Tadoku Language Tools',
  description: 'Immerse in foreign languages!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <head>
          <meta name="apple-mobile-web-app-title" content="OCR Reader" />
        </head>
        <body>{children}</body>
      </html>
    </ReactQueryClientProvider>
  )
}
