const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  assetPrefix: isProd ? 'https://tadoku.app/miner/ocr-chinese' : undefined,
  output: 'standalone',
  publicRuntimeConfig: {
    API_ROOT:
      process.env.NEXT_PUBLIC_API_ROOT || 'http://localhost:8080',
  }

}
