const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  assetPrefix: isProd ? 'https://tadoku.app/tools/' : undefined,
  output: 'standalone',
  publicRuntimeConfig: {
    API_ROOT: isProd ? 'https://tadoku.app/tools/api' : 'http://localhost:8080',
  },
}
