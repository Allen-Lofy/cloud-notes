"use client";

import { Button } from "@/components/ui/button";
import { Download, Share, Edit, Trash2, Calendar, FileText, HardDrive } from "lucide-react";
import type { File } from "@/lib/types";

interface FileInfoProps {
  file: File;
}

export function FileInfo({ file }: FileInfoProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN");
  };

  const getFileTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      markdown: "Markdown 文档",
      pdf: "PDF 文档",
      image: "图片文件",
      document: "文档文件",
      other: "其他文件",
    };
    return typeLabels[type] || "未知类型";
  };

  return (
    <div className="p-6 space-y-6">
      {/* 文件基本信息 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">{file.name}</h2>
            <p className="text-sm text-muted-foreground">
              {getFileTypeLabel(file.type)}
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm">
            <Download className="h-4 w-4 mr-1" />
            下载
          </Button>
          <Button size="sm" variant="outline">
            <Share className="h-4 w-4 mr-1" />
            分享
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-1" />
            重命名
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      </div>

      {/* 文件详细信息 */}
      <div className="space-y-4">
        <h3 className="font-medium">文件详情</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">文件大小</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">MIME 类型</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono">
              {file.mime_type || "未知"}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">创建时间</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(file.created_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">修改时间</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(file.updated_at)}
            </span>
          </div>
        </div>
      </div>

      {/* 文件路径 */}
      {file.file_path && (
        <div className="space-y-2">
          <h3 className="font-medium">存储路径</h3>
          <p className="text-sm text-muted-foreground font-mono bg-muted/30 p-2 rounded">
            {file.file_path}
          </p>
        </div>
      )}

      {/* Markdown 文件特殊信息 */}
      {file.type === "markdown" && file.content && (
        <div className="space-y-2">
          <h3 className="font-medium">内容统计</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">字符数：</span>
              <span className="font-mono">{file.content.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">行数：</span>
              <span className="font-mono">{file.content.split("\n").length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">词数：</span>
              <span className="font-mono">
                {file.content.split(/\s+/).filter(word => word.length > 0).length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">段落数：</span>
              <span className="font-mono">
                {file.content.split(/\n\s*\n/).filter(para => para.trim().length > 0).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}