/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  basePath: "/miner/ocr-chinese",
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