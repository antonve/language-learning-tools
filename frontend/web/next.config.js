const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  assetPrefix: isProd ? 'https://tools.tadoku.app' : undefined,
  publicRuntimeConfig: {
    API_ROOT: isProd ? 'https://tools.tadoku.app/api' : 'http://localhost:8080',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/anki/ja',
        permanent: false,
      }
    ]
  }
}
