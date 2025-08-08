"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface AdminLayoutProps {
  user: any; // Supabase user type
}

export function AdminLayout({ user }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-3xl font-bold">管理员面板</h1>
          </div>
        </div>

        {/* 占位内容 */}
        <Card>
          <CardHeader>
            <CardTitle>系统管理</CardTitle>
            <CardDescription>
              管理用户、监控系统状态和配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">管理员功能正在开发中...</p>
            <p className="text-sm text-muted-foreground mt-2">
              管理员: {user.email}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}