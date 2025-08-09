"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Save, Eye, EyeOff, Download, FileDown } from "lucide-react";
import { useTheme } from "next-themes";
// 防抖函数实现
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// 节流函数实现
const throttle = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  return (...args: any[]) => {
    const currentTime = Date.now();
    if (currentTime - lastExecTime > wait) {
      func.apply(null, args);
      lastExecTime = currentTime;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(null, args);
        lastExecTime = Date.now();
        timeout = null;
      }, wait - (currentTime - lastExecTime));
    }
  };
};

export function MarkdownEditor() {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showAutoSaveReminder, setShowAutoSaveReminder] = useState(false);
  const [editorLoadError, setEditorLoadError] = useState<string | null>(null);
  
  const {
    editor,
    preferences,
    setEditorContent,
    setEditorDirty,
    setPreviewMode,
    addError,
    setLoading,
    loading
  } = useAppStore();

  const { activeFile, content, isDirty, isPreviewMode } = editor;

  // 防抖保存函数
  const debouncedSave = useCallback(
    debounce(async (fileId: string, newContent: string) => {
      try {
        setLoading("save", true);
        const response = await fetch(`/api/files/${fileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) {
          const error = await response.json();
          addError(error.error || "保存失败");
        } else {
          setEditorDirty(false);
        }
      } catch (error) {
        addError("保存失败");
      } finally {
        setLoading("save", false);
      }
    }, preferences.editor.autoSaveInterval), // 使用配置的自动保存间隔
    [addError, setLoading, setEditorDirty, preferences.editor.autoSaveInterval]
  );

  // PDF导出功能
  const handleExportPDF = useCallback(async () => {
    if (!activeFile || !content.trim()) {
      addError("没有内容可导出");
      return;
    }

    setIsExportingPDF(true);
    console.log('开始PDF导出，文件:', activeFile.name, '内容长度:', content.length);
    
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          title: activeFile.name,
          fileId: activeFile.id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDF导出响应错误:', response.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: `服务器错误 (${response.status})`, details: errorText };
        }
        throw new Error(errorData.error || 'PDF导出失败');
      }

      // 下载PDF文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${activeFile.name.replace(/\.[^/.]+$/, "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("PDF导出成功！");
    } catch (error) {
      console.error('PDF导出失败:', error);
      addError(error instanceof Error ? error.message : 'PDF导出失败');
    } finally {
      setIsExportingPDF(false);
    }
  }, [activeFile, content, addError]);

  // 优化的自动保存提醒逻辑 - 减少依赖
  useEffect(() => {
    let reminderTimeout: NodeJS.Timeout;
    
    if (isDirty && !loading.save && preferences.editor.enableAutoSave) {
      // 只有在启用自动保存且有未保存更改时才显示提醒
      reminderTimeout = setTimeout(() => {
        setShowAutoSaveReminder(true);
      }, 30000);
    } else {
      setShowAutoSaveReminder(false);
    }

    return () => {
      if (reminderTimeout) clearTimeout(reminderTimeout);
    };
  }, [isDirty, loading.save, preferences.editor.enableAutoSave]);

  // Monaco编辑器选项配置 - 使用用户偏好设置
  const editorOptions = useMemo(() => ({
    minimap: { enabled: preferences.editor.enableMinimap },
    scrollBeyondLastLine: false,
    wordWrap: preferences.editor.enableWordWrap ? "on" as const : "off" as const,
    lineNumbers: preferences.editor.enableLineNumbers ? "on" as const : "off" as const,
    fontSize: preferences.editor.fontSize,
    lineHeight: 1.5,
    fontFamily: preferences.editor.fontFamily,
    automaticLayout: true,
    scrollbar: {
      vertical: "auto" as const,
      horizontal: "auto" as const,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    suggest: {
      showSnippets: true,
      showWords: true
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    renderLineHighlight: "none" as const,
    selectionHighlight: false,
    occurrencesHighlight: "off" as const,
    renderIndentGuides: false,
    codeLens: false,
    folding: true,
    foldingHighlight: false,
    unfoldOnClickAfterEndOfLine: false,
    showUnused: false,
    // 性能优化
    smoothScrolling: false, // 关闭平滑滚动以提高性能
    cursorSmoothCaretAnimation: "off" as const, // 关闭光标动画
    mouseWheelZoom: false,
    fastScrollSensitivity: 5,
    multiCursorModifier: "alt" as const,
    // 增加更多性能优化选项
    wordBasedSuggestions: "off" as const, // 关闭基于单词的建议
    parameterHints: {
      enabled: false // 关闭参数提示
    },
    hover: {
      enabled: false // 关闭悬停提示
    },
    links: false, // 关闭链接检测
    colorDecorators: false, // 关闭颜色装饰器
    lightbulb: {
      enabled: "off" // 关闭灯泡提示
    },
    // 进一步的性能优化选项
    bracketPairColorization: {
      enabled: false // 关闭括号配对着色
    },
    guides: {
      indentation: false, // 关闭缩进参考线
      bracketPairs: false, // 关闭括号配对参考线
      bracketPairsHorizontal: false,
      highlightActiveIndentation: false
    },
    unicodeHighlight: {
      ambiguousCharacters: false, // 关闭Unicode字符高亮
      invisibleCharacters: false
    },
    stickyScroll: {
      enabled: false // 关闭粘性滚动
    },
    inlayHints: {
      enabled: "off" // 关闭内联提示
    },
    overviewRulerLanes: 0, // 隐藏概览标尺
    hideCursorInOverviewRuler: true, // 隐藏概览标尺中的光标
    overviewRulerBorder: false, // 隐藏概览标尺边框
    // 语法高亮优化
    "semanticHighlighting.enabled": false, // 关闭语义高亮
    // 减少动画和过渡效果
    cursorBlinking: "solid", // 减少光标闪烁动画
    // 关闭代码镜头
    codeLens: false,
    // 关闭引用信息
    referenceInfos: false,
    // 关闭定义预览
    definitionLinkOpensInPeek: false
  }), [preferences.editor]);

  // 手动保存 - 使用当前内容而不是状态中的内容
  const handleSave = useCallback(async () => {
    const currentContent = contentRef.current;
    if (!activeFile || !isDirtyRef.current) return;

    try {
      setLoading("save", true);
      const response = await fetch(`/api/files/${activeFile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: currentContent }),
      });

      if (!response.ok) {
        const error = await response.json();
        addError(error.error || "保存失败");
      } else {
        setEditorDirty(false);
        isDirtyRef.current = false;
      }
    } catch (error) {
      addError("保存失败");
    } finally {
      setLoading("save", false);
    }
  }, [activeFile, addError, setLoading, setEditorDirty]);

  // 使用useRef追踪内容，减少状态更新频率
  const contentRef = useRef(content);
  const isDirtyRef = useRef(isDirty);
  
  // 防抖更新状态 - 减少React重渲染
  const debouncedStateUpdate = useCallback(
    debounce((newContent: string, dirty: boolean) => {
      setEditorContent(newContent);
      if (dirty !== isDirtyRef.current) {
        setEditorDirty(dirty);
        isDirtyRef.current = dirty;
      }
    }, 100), // 状态更新防抖100ms
    [setEditorContent, setEditorDirty]
  );

  // 内容变化处理 - 减少状态更新频率
  const handleEditorChange = useCallback((value: string = "") => {
    // 更新ref中的内容
    contentRef.current = value;
    
    // 防抖更新React状态
    debouncedStateUpdate(value, true);
    
    // 只有在启用自动保存时才执行自动保存
    if (activeFile && preferences.editor.enableAutoSave) {
      debouncedSave(activeFile.id, value);
    }
  }, [debouncedStateUpdate, activeFile, debouncedSave, preferences.editor.enableAutoSave]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "e":
            e.preventDefault();
            setPreviewMode(!isPreviewMode);
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, isPreviewMode, setPreviewMode]);

  // Editor 配置
  const handleEditorDidMount = (editor: any, monaco: any) => {
    try {
      editorRef.current = editor;
      
      // 应用完整的编辑器选项配置
      editor.updateOptions(editorOptions);

      // 自定义快捷键
      if (monaco) {
        editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
          handleSave
        );
      }

      // 清除任何之前的错误状态
      setEditorLoadError(null);
    } catch (error) {
      console.warn('Monaco编辑器初始化警告:', error);
      setEditorLoadError(error instanceof Error ? error.message : '未知错误');
    }
  };

  // 简化的错误处理 - 减少全局事件监听开销
  useEffect(() => {
    // 只在开发环境下启用详细的错误处理
    if (process.env.NODE_ENV === 'development') {
      const handleError = (event: ErrorEvent) => {
        if (event.message?.includes('monaco') || event.filename?.includes('monaco')) {
          console.warn('Monaco相关错误已捕获:', event);
          event.preventDefault();
        }
      };

      window.addEventListener('error', handleError, { passive: true });
      return () => window.removeEventListener('error', handleError);
    }
  }, []);

  if (!activeFile) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* 编辑器工具栏 */}
      <div className="h-12 border-b bg-muted/30 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium truncate">{activeFile.name}</h3>
          {isDirty && !loading.save && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
              <div className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full mr-1 animate-pulse"></div>
              未保存
            </span>
          )}
          {loading.save && (
            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-1 animate-pulse"></div>
              保存中...
            </span>
          )}
          {!isDirty && !loading.save && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-1"></div>
              已保存
            </span>
          )}
          {showAutoSaveReminder && (
            <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center animate-bounce">
              💾 建议手动保存 (Ctrl+S)
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                编辑模式
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                预览模式
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || loading.save}
            className={isDirty ? "text-amber-600 hover:text-amber-700 dark:text-amber-400" : ""}
          >
            <Save className="h-4 w-4 mr-1" />
            {loading.save ? "保存中..." : (isDirty ? "保存*" : "保存")}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExportingPDF || !content.trim()}
          >
            <FileDown className="h-4 w-4 mr-1" />
            {isExportingPDF ? "导出中..." : "导出PDF"}
          </Button>
          
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 overflow-hidden relative">
        {activeFile.type === "markdown" ? (
          <div className="h-full">
            {editorLoadError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <p className="text-destructive">编辑器加载失败</p>
                  <p className="text-sm text-muted-foreground">{editorLoadError}</p>
                  <button 
                    onClick={() => {
                      setEditorLoadError(null);
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded"
                  >
                    重新加载
                  </button>
                </div>
              </div>
            ) : (
              <Editor
                height="100%"
                language="markdown"
                theme={theme === "dark" ? "vs-dark" : "vs"}
                defaultValue={content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={editorOptions}
                loading="正在加载编辑器..."
                keepCurrentModel={true} // 保持当前模型，避免重新创建
                // 使用key来确保文件切换时重新创建编辑器实例
                key={activeFile?.id}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                该文件类型不支持编辑
              </p>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                下载文件
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}