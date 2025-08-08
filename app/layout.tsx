import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Cloud Notes 云笔记",
  description: "基于 Next.js + Supabase 的云笔记应用，结合 Obsidian 风格的文件管理和团队协作功能",
  keywords: ["云笔记", "Markdown", "协作", "Obsidian", "Next.js", "Supabase"],
  authors: [{ name: "Cloud Notes" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 预加载关键资源 */}
        <link rel="preload" href="/favicon.ico" as="image" />
        {/* KaTeX CSS 预加载 */}
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css" 
          as="style" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css" 
        />
        {/* 性能优化 */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
