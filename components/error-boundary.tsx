"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('应用错误:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              出现了一些问题
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              应用遇到了意外错误。请刷新页面重试。
            </p>
            {this.state.error && (
              <details className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                <summary className="cursor-pointer font-medium text-sm">
                  错误详情
                </summary>
                <pre className="mt-2 text-xs overflow-auto text-red-600 dark:text-red-400">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              刷新页面
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 简化的错误边界Hook版本
export function ErrorFallback({ error, resetError }: { error: Error, resetError: () => void }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          组件加载失败
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {error.message}
        </p>
        <Button size="sm" onClick={resetError}>
          重试
        </Button>
      </div>
    </div>
  );
}