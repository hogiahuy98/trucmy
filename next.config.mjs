import withPWA from 'next-pwa'
import runtimeCaching from 'next-pwa/cache.js'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
}

export default withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig)


