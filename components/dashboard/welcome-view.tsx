"use client";

import { FileText, FolderPlus, Upload, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WelcomeView() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* 欢迎标题 */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">欢迎使用 Cloud Notes</h1>
          <p className="text-lg text-muted-foreground">
            开始创建您的第一个笔记，或者探索强大的文件管理功能
          </p>
        </div>

        {/* 快速操作卡片 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">创建新文件</CardTitle>
              <CardDescription>
                创建 Markdown 文件开始写作
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full">新建文件</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
                <FolderPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">创建文件夹</CardTitle>
              <CardDescription>
                组织您的文件和笔记
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">新建文件夹</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-2">
                <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">上传文件</CardTitle>
              <CardDescription>
                导入已有的文档和文件
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">上传文件</Button>
            </CardContent>
          </Card>
        </div>

        {/* 功能介绍 */}
        <div className="bg-muted/30 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">功能特性</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">编辑功能</h3>
              <ul className="space-y-1">
                <li>• Markdown 实时预览</li>
                <li>• LaTeX 数学公式支持</li>
                <li>• 语法高亮</li>
                <li>• 自动保存</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">文件管理</h3>
              <ul className="space-y-1">
                <li>• 层级文件夹结构</li>
                <li>• 拖拽移动文件</li>
                <li>• 多格式文件支持</li>
                <li>• 批量操作</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>快捷键提示：</p>
          <p>Ctrl + N: 新建文件 | Ctrl + Shift + N: 新建文件夹 | Ctrl + S: 保存</p>
        </div>
      </div>
    </div>
  );
}