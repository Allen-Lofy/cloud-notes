import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6" />
            <span className="font-bold text-xl">Cloud Notes 云笔记</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          现代化云笔记平台
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          基于 Next.js + Supabase 构建，提供类似 Obsidian 的文件管理体验，
          支持 Markdown 编辑、实时预览、文件分享和团队协作。
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">立即开始</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/auth/login">登录账号</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">核心功能特性</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Markdown 编辑</h3>
            <p className="text-sm text-muted-foreground">
              强大的 Markdown 编辑器，支持实时预览、LaTeX 数学公式和语法高亮
            </p>
          </div>
          <div className="text-center p-6">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">团队协作</h3>
            <p className="text-sm text-muted-foreground">
              分享笔记、协作编辑、评论点赞，打造知识共享社区
            </p>
          </div>
          <div className="text-center p-6">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">安全可靠</h3>
            <p className="text-sm text-muted-foreground">
              基于 Supabase 的企业级安全，数据加密存储，权限精确控制
            </p>
          </div>
          <div className="text-center p-6">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">高性能</h3>
            <p className="text-sm text-muted-foreground">
              基于 Next.js 构建，支持文件缓存、懒加载和渐进式网络应用
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Cloud Notes. Powered by{" "}
              <a 
                href="https://supabase.com" 
                target="_blank" 
                className="underline hover:text-primary"
                rel="noreferrer"
              >
                Supabase
              </a>
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/share" className="text-sm text-muted-foreground hover:text-primary">
                分享广场
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                关于我们
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
