import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack 配置优化
  webpack: (config, { isServer, webpack }) => {
    // 处理客户端专用的fallback
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // 忽略特定的warning
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/punycode\/punycode\.js/ },
    ];

    // 添加DefinePlugin避免一些构建警告
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      })
    );
    
    return config;
  },
  
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fcbroldtkbhoxqnlimle.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  
  // 运行时配置
  poweredByHeader: false,
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
