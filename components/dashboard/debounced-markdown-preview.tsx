"use client";

import { useState, useEffect, memo } from "react";
import { MarkdownPreview } from "./markdown-preview";
import { useAppStore } from "@/lib/store";

interface DebouncedMarkdownPreviewProps {
  content: string;
  delay?: number;
}

// 防抖的Markdown预览组件，避免每次输入都重新渲染
const DebouncedMarkdownPreview = memo(function DebouncedMarkdownPreview({ 
  content, 
  delay 
}: DebouncedMarkdownPreviewProps) {
  const { preferences } = useAppStore();
  const actualDelay = delay ?? preferences.editor.previewDelay;
  const [debouncedContent, setDebouncedContent] = useState(content);

  useEffect(() => {
    // 如果内容没有实际变化，不需要更新
    if (content === debouncedContent) return;
    
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, actualDelay);

    return () => clearTimeout(timer);
  }, [content, actualDelay, debouncedContent]);

  return <MarkdownPreview content={debouncedContent} />;
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有内容真正改变时才重新渲染
  return prevProps.content === nextProps.content && prevProps.delay === nextProps.delay;
});

export { DebouncedMarkdownPreview };