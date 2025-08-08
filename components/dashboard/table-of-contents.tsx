"use client";

import { useMemo } from "react";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  // 解析标题生成目录
  const tocItems = useMemo(() => {
    if (!content.trim()) return [];

    const lines = content.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const id = `heading-${index}-${text.toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')}`;
        
        items.push({ id, text, level });
      }
    });

    return items;
  }, [content]);

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="toc-container bg-muted/20 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <List className="h-4 w-4 mr-2" />
        <h3 className="font-semibold text-sm">目录</h3>
      </div>
      <ul className="space-y-1">
        {tocItems.map((item) => (
          <li
            key={item.id}
            style={{ marginLeft: `${(item.level - 1) * 1}rem` }}
          >
            <button
              onClick={() => handleTocClick(item.id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full truncate"
              title={item.text}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}