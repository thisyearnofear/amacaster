const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
      issuer: {
        // Process SVGs imported from js/ts files with SVGR
        and: [/\.(js|jsx|ts|tsx)$/],
      },
    })

    return config
  },
}

module.exports = nextConfig
