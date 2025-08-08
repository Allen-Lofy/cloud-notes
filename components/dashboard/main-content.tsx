"use client";

import { useAppStore } from "@/lib/store";
import { MarkdownEditor } from "./markdown-editor";
import { WelcomeView } from "./welcome-view";

export function MainContent() {
  const { editor } = useAppStore();

  if (!editor.activeFile) {
    return <WelcomeView />;
  }

  return (
    <div className="h-full">
      <MarkdownEditor />
    </div>
  );
}