"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { TableOfContents } from "./table-of-contents";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  // 缓存处理的内容 - 正确处理LaTeX环境
  const processedContent = useMemo(() => {
    if (!content.trim()) return "";
    
    let processed = content;
    
    // LaTeX环境保护和转义修复
    const latexBlocks: string[] = [];
    let latexIndex = 0;
    
    // 1. 保护并修复 $$ ... $$ 块级数学公式
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
      // 修复LaTeX环境内的转义问题
      const fixedMath = mathContent
        // 将 \\\\ 还原为 \\ （LaTeX换行符）
        .replace(/\\\\\\\\/g, '\\\\')
        // 确保其他LaTeX命令不被过度转义
        .replace(/\\\\([a-zA-Z])/g, '\\$1');
        
      const placeholder = `__LATEX_BLOCK_${latexIndex}__`;
      latexBlocks[latexIndex] = `$$${fixedMath}$$`;
      latexIndex++;
      return placeholder;
    });
    
    // 2. 保护并修复 $ ... $ 行内数学公式
    processed = processed.replace(/\$([^$]*(?:\n[^$]*)*)\$/g, (match, mathContent) => {
      // 修复行内公式的转义问题
      const fixedMath = mathContent
        .replace(/\\\\\\\\/g, '\\\\')
        .replace(/\\\\([a-zA-Z])/g, '\\$1');
        
      const placeholder = `__LATEX_INLINE_${latexIndex}__`;
      latexBlocks[latexIndex] = `$${fixedMath}$`;
      latexIndex++;
      return placeholder;
    });
    
    // 3. 处理普通Markdown的 \\ 换行（只在非LaTeX环境中）
    processed = processed.replace(/\\\\\s*$/gm, "  ");
    
    // 4. 恢复LaTeX环境
    for (let i = 0; i < latexIndex; i++) {
      const blockPlaceholder = `__LATEX_BLOCK_${i}__`;
      const inlinePlaceholder = `__LATEX_INLINE_${i}__`;
      
      if (processed.includes(blockPlaceholder)) {
        processed = processed.replace(blockPlaceholder, latexBlocks[i]);
      }
      if (processed.includes(inlinePlaceholder)) {
        processed = processed.replace(inlinePlaceholder, latexBlocks[i]);
      }
    }
    
    return processed;
  }, [content]);

  // 检查是否包含TOC标记
  const shouldShowTOC = useMemo(() => {
    return processedContent.includes('[TOC]') || processedContent.includes('[toc]');
  }, [processedContent]);

  // 处理TOC标记，替换为占位符
  const contentWithTOC = useMemo(() => {
    return processedContent.replace(/\[TOC\]|\[toc\]/gi, '__TOC_PLACEHOLDER__');
  }, [processedContent]);

  if (!processedContent) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>开始编辑以查看预览</p>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="w-full markdown-preview-content overflow-wrap-anywhere">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[
            [rehypeKatex, {
              // KaTeX配置选项，确保最佳渲染效果
              strict: false,  // 不严格模式，兼容更多LaTeX语法
              displayMode: false,  // 默认行内模式，块级公式会自动检测
              throwOnError: false,  // 不抛出错误，降级处理
              errorColor: '#cc0000',  // 错误颜色
              macros: {
                // 添加常用宏定义
                "\\RR": "\\mathbb{R}",
                "\\ZZ": "\\mathbb{Z}",
                "\\NN": "\\mathbb{N}",
                "\\QQ": "\\mathbb{Q}",
                "\\CC": "\\mathbb{C}",
              }
            }]
          ]}
          components={{
            // 自定义组件样式
            h1: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children : '';
              const id = text.toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <h1 id={id} className="text-3xl font-bold mb-4 mt-6 first:mt-0 border-b pb-2">
                  {children}
                </h1>
              );
            },
            h2: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children : '';
              const id = text.toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <h2 id={id} className="text-2xl font-semibold mb-3 mt-5 first:mt-0">
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children : '';
              const id = text.toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <h3 id={id} className="text-xl font-medium mb-2 mt-4 first:mt-0">
                  {children}
                </h3>
              );
            },
            h4: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children : '';
              const id = text.toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <h4 id={id} className="text-lg font-medium mb-2 mt-3 first:mt-0">
                  {children}
                </h4>
              );
            },
            h5: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children : '';
              const id = text.toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <h5 id={id} className="text-base font-medium mb-1 mt-2 first:mt-0">
                  {children}
                </h5>
              );
            },
            h6: ({ children, ...props }) => {
              const text = typeof children === 'string' ? children : '';
              const id = text.toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <h6 id={id} className="text-sm font-medium mb-1 mt-2 first:mt-0">
                  {children}
                </h6>
              );
            },
            p: ({ children }) => {
              // 检查是否为TOC占位符
              if (typeof children === 'string' && children.includes('__TOC_PLACEHOLDER__')) {
                return <TableOfContents content={content} />;
              }
              
              return (
                <p className="mb-4 leading-relaxed text-foreground break-words hyphens-auto">
                  {children}
                </p>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/20 pl-4 py-2 mb-4 italic bg-muted/30 rounded-r">
                {children}
              </blockquote>
            ),
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;
              
              if (isInline) {
                return (
                  <code
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              
              return (
                <div className="mb-4 w-full">
                  <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto max-w-full">
                    <code className={`language-${match[1]} text-sm break-all whitespace-pre-wrap`} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto mb-6">
                <table className="w-full border border-border rounded-lg table-auto">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/50">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-background divide-y divide-border">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-muted/20 transition-colors">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 text-sm text-foreground border-b border-border break-words">
                {children}
              </td>
            ),
            a: ({ href, children }) => {
              // 检查是否为锚点链接
              if (href?.startsWith('#')) {
                return (
                  <button
                    onClick={() => {
                      const element = document.getElementById(href.slice(1));
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer"
                  >
                    {children}
                  </button>
                );
              }
              
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  {children}
                </a>
              );
            },
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg shadow-sm mb-4"
                loading="lazy"
              />
            ),
            hr: () => (
              <hr className="my-6 border-t border-border" />
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground">{children}</em>
            ),
          }}
        >
          {contentWithTOC}
        </ReactMarkdown>
      </div>
    </div>
  );
}