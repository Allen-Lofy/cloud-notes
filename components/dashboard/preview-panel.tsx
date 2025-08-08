"use client";

import { useAppStore } from "@/lib/store";
import { MarkdownPreview } from "./markdown-preview";
import { FileInfo } from "./file-info";
import { Eye } from "lucide-react";

export function PreviewPanel() {
  const { editor } = useAppStore();
  const { activeFile, content } = editor;

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <Eye className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-medium">预览面板</h3>
            <p className="text-sm text-muted-foreground mt-1">
              选择一个文件以查看预览
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 预览标题栏 */}
      <div className="h-12 border-b bg-muted/30 flex items-center px-4">
        <Eye className="h-4 w-4 mr-2" />
        <span className="font-medium">预览</span>
      </div>

      {/* 预览内容 */}
      <div className="flex-1 overflow-auto">
        <div className="h-full min-w-0">
          {activeFile.type === "markdown" ? (
            <div className="markdown-preview-content w-full min-w-0">
              <MarkdownPreview content={content} />
            </div>
          ) : (
            <FileInfo file={activeFile} />
          )}
        </div>
      </div>
    </div>
  );
}