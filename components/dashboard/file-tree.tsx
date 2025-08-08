"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";
import { FileTreeItem } from "./file-tree-item";
import { Loader2 } from "lucide-react";
import type { Folder, File } from "@/lib/types";

interface FileTreeProps {
  searchTerm: string;
}

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  parent_id?: string;
  children: TreeNode[];
  file?: File;
  folder?: Folder;
}

export function FileTree({ searchTerm }: FileTreeProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { addError, setCurrentFolder } = useAppStore();

  useEffect(() => {
    loadFileTree();
  }, []);

  const loadFileTree = async () => {
    try {
      setIsLoading(true);

      // 同时获取文件夹和文件
      const [foldersResponse, filesResponse] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/files")
      ]);

      const foldersData = await foldersResponse.json();
      const filesData = await filesResponse.json();

      if (!foldersResponse.ok) {
        addError(foldersData.error || "获取文件夹失败");
        return;
      }

      if (!filesResponse.ok) {
        addError(filesData.error || "获取文件失败");
        return;
      }

      const folders = foldersData.data || [];
      const files = filesData.data || [];

      // 构建树结构
      const tree = buildTree(folders, files);
      setTreeData(tree);

    } catch (error) {
      console.error("加载文件树失败:", error);
      addError("加载文件树失败");
    } finally {
      setIsLoading(false);
    }
  };

  const buildTree = (folders: Folder[], files: File[]): TreeNode[] => {
    const folderMap = new Map<string, TreeNode>();
    const tree: TreeNode[] = [];

    // 首先创建所有文件夹节点
    folders.forEach((folder) => {
      const node: TreeNode = {
        id: folder.id,
        name: folder.name,
        type: "folder",
        path: folder.path,
        parent_id: folder.parent_id || undefined,
        children: [],
        folder,
      };
      folderMap.set(folder.id, node);
    });

    // 构建文件夹层级关系
    folderMap.forEach((node) => {
      if (node.parent_id && folderMap.has(node.parent_id)) {
        folderMap.get(node.parent_id)!.children.push(node);
      } else {
        tree.push(node);
      }
    });

    // 添加文件到对应的文件夹或根目录
    files.forEach((file) => {
      const fileNode: TreeNode = {
        id: file.id,
        name: file.name,
        type: "file",
        path: file.name,
        children: [],
        file,
      };

      if (file.folder_id && folderMap.has(file.folder_id)) {
        folderMap.get(file.folder_id)!.children.push(fileNode);
      } else {
        tree.push(fileNode);
      }
    });

    // 排序：文件夹在前，文件在后，然后按名称排序
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name, "zh-CN");
      });
    };

    // 递归排序所有节点
    const sortTreeRecursively = (nodes: TreeNode[]): TreeNode[] => {
      return sortNodes(nodes).map(node => ({
        ...node,
        children: sortTreeRecursively(node.children)
      }));
    };

    return sortTreeRecursively(tree);
  };

  const filterTree = (nodes: TreeNode[], searchTerm: string): TreeNode[] => {
    if (!searchTerm) return nodes;

    const filtered: TreeNode[] = [];
    
    for (const node of nodes) {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredChildren = filterTree(node.children, searchTerm);
      
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        });
      }
    }
    
    return filtered;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const filteredTree = filterTree(treeData, searchTerm);

  if (filteredTree.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {searchTerm ? "未找到匹配的文件或文件夹" : "暂无文件"}
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {filteredTree.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          level={0}
          onRefresh={loadFileTree}
        />
      ))}
    </div>
  );
}