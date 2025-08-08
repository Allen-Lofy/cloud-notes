"use client";

import { memo } from "react";
import { useAppStore } from "@/lib/store";
import { MarkdownEditor } from "./markdown-editor";
import { WelcomeView } from "./welcome-view";

// 使用React.memo优化主内容组件性能
export const MainContent = memo(function MainContent() {
  const { editor } = useAppStore();

  if (!editor.activeFile) {
    return <WelcomeView />;
  }

  return (
    <div className="h-full">
      <MarkdownEditor />
    </div>
  );
});