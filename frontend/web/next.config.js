const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  assetPrefix: isProd ? 'https://tadoku.app/tools' : undefined,
  publicRuntimeConfig: {
    API_ROOT: isProd ? 'https://tadoku.app/tools/api' : 'http://localhost:8080',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: isProd ? '/tools/anki/ja' : '/anki/ja',
        permanent: false,
      }
    ]
  }
}
