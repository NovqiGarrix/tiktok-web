/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  env: {
    BASE_URL: process.env.BASE_URL,
    SERVER_URL: process.env.SERVER_URL,
    CURRENT_API_VERSION: process.env.CURRENT_API_VERSION,
    ABSTRACT_API_KEY: process.env.ABSTRACT_API_KEY
  },
  images: {
    domains: ["lh3.googleusercontent.com", "ui-avatars.com"],
  }
}
