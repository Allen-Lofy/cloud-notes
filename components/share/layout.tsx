"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Share } from "lucide-react";

interface ShareLayoutProps {
  user: any; // Supabase user type
}

export function ShareLayout({ user }: ShareLayoutProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Share className="h-6 w-6" />
              <h1 className="text-3xl font-bold">分享广场</h1>
            </div>
          </div>
          
          {user && (
            <Button asChild>
              <Link href="/dashboard">我的笔记</Link>
            </Button>
          )}
        </div>

        {/* 占位内容 */}
        <Card>
          <CardHeader>
            <CardTitle>分享广场</CardTitle>
            <CardDescription>
              发现和分享优秀的笔记内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">分享功能正在开发中...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}