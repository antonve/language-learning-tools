/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    questions: process.env.QUESTIONS_JSON,
  },
  basePath: '/grammar',
}
