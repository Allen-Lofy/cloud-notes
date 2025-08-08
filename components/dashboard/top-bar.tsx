"use client";

import { FileText, Upload, Settings, Share, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { AuthButtonClient } from "@/components/auth-button-client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

interface TopBarProps {
  onUploadClick: () => void;
}

export function TopBar({ onUploadClick }: TopBarProps) {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    previewPanelOpen, 
    setPreviewPanelOpen,
    editor 
  } = useAppStore();

  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        {/* 左侧控制 */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
          
          <Link href="/dashboard">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Cloud Notes</span>
            </div>
          </Link>
        </div>

        {/* 中间搜索栏 */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文件和文件夹..."
              className="pl-10"
            />
          </div>
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center space-x-2">
          {editor.activeFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewPanelOpen(!previewPanelOpen)}
            >
              {previewPanelOpen ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  隐藏预览
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  显示预览
                </>
              )}
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={onUploadClick}>
            <Upload className="h-4 w-4 mr-1" />
            上传
          </Button>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href="/share">
              <Share className="h-4 w-4 mr-1" />
              分享
            </Link>
          </Button>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-1" />
              设置
            </Link>
          </Button>
          
          <ThemeSwitcher />
          <AuthButtonClient />
        </div>
      </div>
    </div>
  );
}