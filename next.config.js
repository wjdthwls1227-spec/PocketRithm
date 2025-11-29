/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer, dev }) => {
    // 개발 모드에서 큰 문자열 직렬화 경고 완화
    if (dev && !isServer) {
      // 캐시 최적화 설정
      config.cache = {
        ...config.cache,
        compression: 'gzip',
        maxMemoryGenerations: 1,
      }
      
      // 큰 문자열 직렬화 경고 완화를 위한 설정
      config.optimization = {
        ...config.optimization,
        minimize: false,
        usedExports: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

