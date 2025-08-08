"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Image,
  FileType,
  File as FileIcon,
  MoreVertical,
  Edit,
  Trash2,
  Move
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  parent_id?: string;
  children: TreeNode[];
  file?: any;
  folder?: any;
}

interface FileTreeItemProps {
  node: TreeNode;
  level: number;
  onRefresh: () => void;
}

export function FileTreeItem({ node, level, onRefresh }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<TreeNode[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const { 
    setActiveFile, 
    setCurrentFolder, 
    setEditorContent,
    editor,
    addError,
    folders 
  } = useAppStore();

  const isActive = editor.activeFile?.id === node.id;
  const hasChildren = node.children.length > 0;

  const handleClick = async () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
      setCurrentFolder(node.folder);
    } else if (node.type === "file") {
      try {
        const response = await fetch(`/api/files/${node.id}`);
        if (response.ok) {
          const { data: file } = await response.json();
          setActiveFile(file);
          setEditorContent(file.content || "");
        } else {
          addError("打开文件失败");
        }
      } catch (error) {
        addError("打开文件失败");
      }
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === node.name) {
      setIsRenaming(false);
      return;
    }

    try {
      const endpoint = node.type === "folder" ? `/api/folders/${node.id}` : `/api/files/${node.id}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        const error = await response.json();
        addError(error.error || "重命名失败");
      }
    } catch (error) {
      addError("重命名失败");
    }
    
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (!confirm(`确定要删除 "${node.name}" 吗？`)) return;

    try {
      const endpoint = node.type === "folder" ? `/api/folders/${node.id}` : `/api/files/${node.id}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
        if (node.type === "file" && isActive) {
          setActiveFile(null);
          setEditorContent("");
        }
      } else {
        const error = await response.json();
        addError(error.error || "删除失败");
      }
    } catch (error) {
      addError("删除失败");
    }
  };

  // 获取可用文件夹列表
  const loadAvailableFolders = () => {
    const buildFolderTree = (folders: any[]): TreeNode[] => {
      return folders
        .filter(folder => folder.id !== node.id) // 不能移动到自身
        .map(folder => ({
          id: folder.id,
          name: folder.name,
          type: "folder" as const,
          path: folder.path,
          parent_id: folder.parent_id,
          children: [],
          folder
        }));
    };

    setAvailableFolders(buildFolderTree(folders));
    setSelectedFolderId(null);
  };

  // 处理移动操作
  const handleMove = async () => {
    if (!selectedFolderId && selectedFolderId !== null) return;

    try {
      const endpoint = node.type === "folder" ? `/api/folders/${node.id}` : `/api/files/${node.id}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          folder_id: selectedFolderId === "root" ? null : selectedFolderId 
        }),
      });

      if (response.ok) {
        onRefresh();
        setIsMoveDialogOpen(false);
      } else {
        const error = await response.json();
        addError(error.error || "移动失败");
      }
    } catch (error) {
      addError("移动失败");
    }
  };

  const getFileIcon = (file: any) => {
    if (!file) return <FileIcon className="h-4 w-4" />;
    
    switch (file.type) {
      case "markdown":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "image":
        return <Image className="h-4 w-4 text-green-500" />;
      case "pdf":
        return <FileType className="h-4 w-4 text-red-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between group hover:bg-accent/50 rounded-sm p-1",
          isActive && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
      >
        <div className="flex items-center flex-1 min-w-0" onClick={handleClick}>
          {/* 展开/收缩按钮 */}
          {node.type === "folder" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )
              ) : (
                <div className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-7" />
          )}

          {/* 图标 */}
          <div className="mr-2">
            {node.type === "folder" ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              getFileIcon(node.file)
            )}
          </div>

          {/* 名称 */}
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                } else if (e.key === "Escape") {
                  setNewName(node.name);
                  setIsRenaming(false);
                }
              }}
              className="flex-1 bg-background border rounded px-1 text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className={cn(
                "truncate text-sm cursor-pointer",
                isActive && "font-medium"
              )}
              title={node.name}
            >
              {node.name}
            </span>
          )}
        </div>

        {/* 操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Edit className="h-4 w-4 mr-2" />
              重命名
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              loadAvailableFolders();
              setIsMoveDialogOpen(true);
            }}>
              <Move className="h-4 w-4 mr-2" />
              移动
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 子节点 */}
      {node.type === "folder" && isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* 移动对话框 */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>移动 &quot;{node.name}&quot;</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              选择目标文件夹：
            </div>
            
            {/* 根目录选项 */}
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="root-folder"
                name="folder"
                value="root"
                checked={selectedFolderId === "root"}
                onChange={() => setSelectedFolderId("root")}
                className="h-4 w-4"
              />
              <label htmlFor="root-folder" className="text-sm cursor-pointer">
                根目录
              </label>
            </div>

            {/* 文件夹列表 */}
            <div className="max-h-60 overflow-y-auto border rounded p-2">
              {availableFolders.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  没有可用的文件夹
                </div>
              ) : (
                <div className="space-y-1">
                  {availableFolders.map((folder) => (
                    <div key={folder.id} className="flex items-center space-x-2 p-1 hover:bg-accent rounded">
                      <input
                        type="radio"
                        id={`folder-${folder.id}`}
                        name="folder"
                        value={folder.id}
                        checked={selectedFolderId === folder.id}
                        onChange={() => setSelectedFolderId(folder.id)}
                        className="h-4 w-4"
                      />
                      <Folder className="h-4 w-4 text-blue-500" />
                      <label 
                        htmlFor={`folder-${folder.id}`} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        {folder.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsMoveDialogOpen(false)}
            >
              取消
            </Button>
            <Button 
              onClick={handleMove}
              disabled={selectedFolderId === null}
            >
              移动
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}