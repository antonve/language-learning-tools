/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    API_ROOT:
      process.env.NEXT_PUBLIC_API_ROOT || 'http://localhost:8080',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ja',
        permanent: true,
      }
    ]
  }
}
