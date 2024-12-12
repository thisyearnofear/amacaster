/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
      issuer: {
        and: [/\.(js|jsx|ts|tsx)$/],
      },
    })
    return config
  },
}

module.exports = nextConfig
