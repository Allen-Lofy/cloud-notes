"use client";

import { useState } from "react";
import { FileTree } from "./file-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, FilePlus, Search, MoreVertical } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  
  const { currentFolder, addError } = useAppStore();

  const handleCreateFolder = async () => {
    if (!newItemName.trim()) return;

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newItemName.trim(),
          parent_id: currentFolder?.id || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        addError(error.error || "创建文件夹失败");
        return;
      }

      // 重新加载文件树
      window.location.reload(); // 临时解决方案，后续优化
      
      setNewItemName("");
      setShowNewFolderInput(false);
    } catch (error) {
      addError("创建文件夹失败");
    }
  };

  const handleCreateFile = async () => {
    if (!newItemName.trim()) return;

    try {
      const fileName = newItemName.trim().endsWith('.md') 
        ? newItemName.trim() 
        : `${newItemName.trim()}.md`;

      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileName,
          type: "markdown",
          folder_id: currentFolder?.id || null,
          content: `# ${newItemName.trim()}\n\n`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        addError(error.error || "创建文件失败");
        return;
      }

      // 重新加载文件树
      window.location.reload(); // 临时解决方案，后续优化
      
      setNewItemName("");
      setShowNewFileInput(false);
    } catch (error) {
      addError("创建文件失败");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="p-4 border-b space-y-2">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>

        {/* 创建按钮 */}
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowNewFolderInput(true);
              setShowNewFileInput(false);
            }}
            className="flex-1 justify-start"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            新建文件夹
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowNewFileInput(true);
              setShowNewFolderInput(false);
            }}
            className="flex-1 justify-start"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            新建文件
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                导入文件
              </DropdownMenuItem>
              <DropdownMenuItem>
                刷新
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 新建文件夹输入框 */}
        {showNewFolderInput && (
          <div className="space-y-2">
            <Input
              placeholder="文件夹名称"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder();
                } else if (e.key === "Escape") {
                  setShowNewFolderInput(false);
                  setNewItemName("");
                }
              }}
              className="h-8"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleCreateFolder}>
                创建
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewItemName("");
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 新建文件输入框 */}
        {showNewFileInput && (
          <div className="space-y-2">
            <Input
              placeholder="文件名称（.md）"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFile();
                } else if (e.key === "Escape") {
                  setShowNewFileInput(false);
                  setNewItemName("");
                }
              }}
              className="h-8"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleCreateFile}>
                创建
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowNewFileInput(false);
                  setNewItemName("");
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-auto">
        <FileTree searchTerm={searchTerm} />
      </div>

      {/* 底部状态栏 */}
      <div className="p-2 border-t text-xs text-muted-foreground">
        当前位置: {currentFolder?.name || "根目录"}
      </div>
    </div>
  );
}