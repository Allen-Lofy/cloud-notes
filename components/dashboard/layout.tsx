"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { PreviewPanel } from "./preview-panel";
import { TopBar } from "./top-bar";
import { FileUploadModal } from "./file-upload-modal";
import { Loader2 } from "lucide-react";

export function DashboardLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(384); // 默认宽度 24rem = 384px
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { 
    setUser, 
    setProfile, 
    setFolders, 
    sidebarOpen, 
    previewPanelOpen,
    addError 
  } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 获取用户信息
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          addError("获取用户信息失败");
          return;
        }

        setUser(user);

        // 获取或创建用户档案
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          // 如果档案不存在，创建一个
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: user.email?.split("@")[0] || "user",
              full_name: user.user_metadata?.full_name || "",
              is_admin: false,
            })
            .select()
            .single();

          if (createError) {
            addError("创建用户档案失败");
          } else {
            setProfile(newProfile);
          }
        } else {
          setProfile(profile);
        }

        // 获取文件夹结构
        const { data: folders, error: foldersError } = await supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id)
          .order("path");

        if (foldersError) {
          addError("获取文件夹失败");
        } else {
          setFolders(folders || []);
        }

      } catch (error) {
        console.error("初始化应用失败:", error);
        addError("应用初始化失败");
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [supabase, setUser, setProfile, setFolders, addError]);

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setProfile(null);
          setFolders([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, setUser, setProfile, setFolders]);

  // 处理预览面板宽度调整
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newWidth = containerWidth - e.clientX;
    
    // 限制最小和最大宽度
    const minWidth = 300; // 最小宽度
    const maxWidth = containerWidth * 0.7; // 最大宽度为屏幕的70%
    
    setPreviewWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部工具栏 */}
      <TopBar onUploadClick={() => setUploadModalOpen(true)} />
      
      {/* 主要内容区域 */}
      <div className="flex h-[calc(100vh-60px)] overflow-hidden">
        {/* 左侧边栏 - 文件树 */}
        {sidebarOpen && (
          <div className="w-80 border-r bg-muted/10 flex-shrink-0 overflow-hidden">
            <Sidebar />
          </div>
        )}
        
        {/* 中间主内容区 */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <MainContent />
        </div>
        
        {/* 拖拽分割条 */}
        {previewPanelOpen && (
          <div 
            className="w-1 bg-border hover:bg-primary/20 cursor-col-resize flex-shrink-0 relative group"
            onMouseDown={handleMouseDown}
            ref={resizeRef}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/10"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-muted-foreground/30 group-hover:bg-primary/60 rounded-full"></div>
          </div>
        )}
        
        {/* 右侧预览面板 */}
        {previewPanelOpen && (
          <div 
            className="bg-muted/10 flex-shrink-0 overflow-hidden"
            style={{ width: `${previewWidth}px` }}
          >
            <PreviewPanel />
          </div>
        )}
      </div>

      {/* 文件上传模态框 */}
      <FileUploadModal 
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
    </div>
  );
}