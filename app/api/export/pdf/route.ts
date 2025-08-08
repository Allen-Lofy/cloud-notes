import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { marked } from "marked";
import katex from "katex";
import { createClient } from "@/lib/supabase/server";

// 配置marked解析器 - 启用GFM表格支持
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 确保表格渲染器正确工作
const renderer = new marked.Renderer();

// 自定义表格渲染
renderer.table = function(header, body) {
  return '<table class="pdf-table" style="width: 100%; border-collapse: collapse; margin: 1em 0;">' + 
         '<thead>' + header + '</thead>' + 
         '<tbody>' + body + '</tbody>' + 
         '</table>';
};

renderer.tablerow = function(content) {
  return '<tr>' + content + '</tr>';
};

renderer.tablecell = function(content, flags) {
  const type = flags.header ? 'th' : 'td';
  const style = flags.header ? 
    'style="border: 1px solid #dfe2e5; padding: 6px 13px; background-color: #f6f8fa; font-weight: 600;"' :
    'style="border: 1px solid #dfe2e5; padding: 6px 13px;"';
  return '<' + type + ' ' + style + '>' + content + '</' + type + '>';
};

// 应用自定义渲染器
marked.setOptions({ renderer });

// KaTeX渲染函数 - 与前端保持一致的处理逻辑
function renderKaTeX(content: string): string {
  if (!content.trim()) return "";
    
  let processed = content;
  
  // LaTeX环境保护和转义修复
  const latexBlocks: string[] = [];
  let latexIndex = 0;
  
  // 1. 保护并修复 $$ ... $$ 块级数学公式
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
    // 更精确的转义修复，保护上下标
    const fixedMath = mathContent
      // 保护下标和上标语法
      .replace(/\\\\_/g, '__UNDERSCORE__')  // 临时保护转义的下划线
      .replace(/\\\\\^/g, '__CARET__')      // 临时保护转义的上标
      // 修复双反斜线（LaTeX换行符）
      .replace(/\\\\\\\\/g, '\\\\')
      // 修复其他LaTeX命令，但避免影响下标上标
      .replace(/\\\\([a-zA-Z])/g, '\\$1')
      // 恢复下标和上标
      .replace(/__UNDERSCORE__/g, '\\_')
      .replace(/__CARET__/g, '\\^');
      
    const placeholder = `__LATEX_BLOCK_${latexIndex}__`;
    
    try {
      const rendered = katex.renderToString(fixedMath.trim(), {
        displayMode: true,
        throwOnError: false,
        output: "html",
        strict: false,
        trust: true,
        // 启用更多LaTeX功能和宏定义
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\ZZ": "\\mathbb{Z}",
          "\\NN": "\\mathbb{N}",
          "\\QQ": "\\mathbb{Q}",
          "\\CC": "\\mathbb{C}",
        },
        // 支持更多数学环境
        fleqn: false,
        leqno: false,
        colorIsTextColor: false,
        maxSize: Infinity,
        maxExpand: 1000,
      });
      latexBlocks[latexIndex] = rendered;
    } catch (error) {
      latexBlocks[latexIndex] = `<div class="katex-error">LaTeX Error: ${fixedMath}</div>`;
    }
    
    latexIndex++;
    return placeholder;
  });
  
  // 2. 保护并修复 $ ... $ 行内数学公式
  processed = processed.replace(/\$([^$]*(?:\n[^$]*)*)\$/g, (match, mathContent) => {
    // 更精确的转义修复，保护上下标
    const fixedMath = mathContent
      // 保护下标和上标语法
      .replace(/\\\\_/g, '__UNDERSCORE__')  // 临时保护转义的下划线
      .replace(/\\\\\^/g, '__CARET__')      // 临时保护转义的上标
      // 修复双反斜线
      .replace(/\\\\\\\\/g, '\\\\')
      // 修复其他LaTeX命令，但避免影响下标上标
      .replace(/\\\\([a-zA-Z])/g, '\\$1')
      // 恢复下标和上标
      .replace(/__UNDERSCORE__/g, '\\_')
      .replace(/__CARET__/g, '\\^');
      
    const placeholder = `__LATEX_INLINE_${latexIndex}__`;
    
    try {
      const rendered = katex.renderToString(fixedMath.trim(), {
        displayMode: false,
        throwOnError: false,
        output: "html",
        strict: false,
        trust: true,
        // 启用更多LaTeX功能
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\ZZ": "\\mathbb{Z}",
          "\\NN": "\\mathbb{N}",
          "\\QQ": "\\mathbb{Q}",
          "\\CC": "\\mathbb{C}",
        }
      });
      latexBlocks[latexIndex] = rendered;
    } catch (error) {
      latexBlocks[latexIndex] = `<span class="katex-error">LaTeX Error: ${fixedMath}</span>`;
    }
    
    latexIndex++;
    return placeholder;
  });

  // 3. 将处理好的内容转换为Markdown，然后还原LaTeX
  let result = processed;
  
  // 还原LaTeX块
  for (let i = 0; i < latexIndex; i++) {
    const blockPlaceholder = `__LATEX_BLOCK_${i}__`;
    const inlinePlaceholder = `__LATEX_INLINE_${i}__`;
    
    result = result.replace(blockPlaceholder, latexBlocks[i]);
    result = result.replace(inlinePlaceholder, latexBlocks[i]);
  }

  return result;
}

// 生成完整的HTML文档
function generateHTML(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        /* 标题样式 */
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1em; }
        h5 { font-size: 0.875em; }
        h6 { font-size: 0.85em; color: #6a737d; }
        
        /* 段落和文本 */
        p { margin-bottom: 16px; }
        
        /* 代码样式 */
        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 0.85em;
            padding: 0.2em 0.4em;
        }
        
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 0.85em;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
            margin-bottom: 16px;
        }
        
        pre code {
            background-color: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            max-width: auto;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }
        
        /* 列表样式 */
        ul, ol {
            margin-bottom: 16px;
            padding-left: 2em;
        }
        
        li {
            margin-bottom: 0.25em;
        }
        
        /* 引用样式 */
        blockquote {
            border-left: 0.25em solid #dfe2e5;
            color: #6a737d;
            margin: 0 0 16px 0;
            padding: 0 1em;
        }
        
        /* 表格样式 */
        table {
            border-collapse: collapse;
            margin-bottom: 16px;
            width: 100%;
        }
        
        table th, table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
        
        table th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        
        /* KaTeX数学公式样式 */
        .katex {
            font-size: 1.1em;
        }
        
        .katex-display {
            margin: 1em 0;
            text-align: center;
            overflow-x: auto;
            padding: 0.5em 0;
        }
        
        .katex .base {
            display: inline-block;
        }
        
        /* 长公式处理 */
        .katex-display > .katex {
            max-width: 100%;
            overflow-x: auto;
        }
        
        /* 矩阵和表格样式 */
        .katex .arraycolsep {
            width: 0.5em;
        }
        
        .katex .mtable .vertical-separator {
            border-left: 1px solid currentColor;
        }
        
        /* 错误样式 */
        .error, .katex-error {
            color: #d73a49;
            background-color: #ffeef0;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.9em;
        }
        
        /* 打印样式 */
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const { content, title = "导出文档", fileId } = body;

    if (!content) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    // Step 1: 渲染LaTeX数学公式
    const withKaTeX = renderKaTeX(content);

    // Step 2: 转换Markdown到HTML
    const htmlContent = await marked(withKaTeX);

    // Step 3: 生成完整HTML文档
    const fullHTML = generateHTML(title, htmlContent);

    // Step 4: 使用Puppeteer生成PDF
    console.log('准备启动Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }).catch(error => {
      console.error('Puppeteer启动失败:', error);
      throw new Error(`Puppeteer启动失败: ${error.message}`);
    });
    console.log('Puppeteer启动成功');

    const page = await browser.newPage();
    
    // 设置页面内容
    await page.setContent(fullHTML, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // 等待KaTeX渲染完成
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // 如果页面有KaTeX元素，等待渲染完成
        const katexElements = document.querySelectorAll('.katex');
        if (katexElements.length === 0) {
          resolve(true);
          return;
        }
        
        // 简单等待一下确保渲染完成
        setTimeout(resolve, 1000);
      });
    });

    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      },
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    // 返回PDF文件
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('PDF导出完整错误信息:', {
      message: error instanceof Error ? error.message : "未知错误",
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return NextResponse.json(
      { 
        error: "PDF导出失败", 
        details: error instanceof Error ? error.message : "未知错误",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}