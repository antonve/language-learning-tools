/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(epub)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext]',
      },
    })
    return config
  },
}