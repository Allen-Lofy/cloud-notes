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
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, actualDelay);

    return () => clearTimeout(timer);
  }, [content, actualDelay]);

  return <MarkdownPreview content={debouncedContent} />;
});

export { DebouncedMarkdownPreview };