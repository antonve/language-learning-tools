const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  assetPrefix: isProd ? 'https://tadoku.app/miner/ocr-chinese' : undefined,
  publicRuntimeConfig: {
    API_ROOT: isProd ? 'https://tadoku.app/miner/api' : 'http://localhost:8080',
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
