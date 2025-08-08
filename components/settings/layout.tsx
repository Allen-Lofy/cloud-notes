"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, User, Settings, Download, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";
import type { Profile } from "@/lib/types";

interface SettingsLayoutProps {
  user: any; // Supabase user type
}

export function SettingsLayout({ user }: SettingsLayoutProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
  });
  const { addError } = useAppStore();
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        addError("获取用户信息失败");
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
        });
      }
    } catch (error) {
      addError("获取用户信息失败");
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        addError("更新用户信息失败");
        return;
      }

      await loadProfile();
      alert("用户信息更新成功");
    } catch (error) {
      addError("更新用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    try {
      setLoading(true);
      
      // 动态导入JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // 获取用户所有文件夹
      const { data: folders } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id);

      // 获取用户所有文件
      const { data: files } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", user.id);

      // 构建文件夹路径映射
      const folderMap = new Map();
      const buildFolderPath = (folderId: string, folders: any[]): string => {
        if (folderMap.has(folderId)) return folderMap.get(folderId);
        
        const folder = folders?.find(f => f.id === folderId);
        if (!folder) return "";
        
        const parentPath = folder.parent_id ? buildFolderPath(folder.parent_id, folders) : "";
        const fullPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
        folderMap.set(folderId, fullPath);
        return fullPath;
      };

      // 创建文件夹结构
      folders?.forEach(folder => {
        const folderPath = buildFolderPath(folder.id, folders);
        if (folderPath) {
          zip.folder(folderPath);
        }
      });

      // 添加文件到ZIP
      files?.forEach(file => {
        let filePath = "";
        
        if (file.folder_id) {
          const folderPath = buildFolderPath(file.folder_id, folders || []);
          filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
        } else {
          filePath = file.name;
        }

        // 根据文件类型处理内容
        let fileContent = "";
        if (file.content) {
          fileContent = file.content;
        } else if (file.file_path) {
          // 对于上传的文件，添加引用信息
          fileContent = `# ${file.name}\n\n此文件原为上传文件，存储路径：${file.file_path}\n\n如需获取原文件，请从云端存储下载。`;
        } else {
          fileContent = `# ${file.name}\n\n此文件暂无内容。`;
        }

        zip.file(filePath, fileContent);
      });

      // 添加导出信息文件
      const exportInfo = {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        totalFolders: folders?.length || 0,
        totalFiles: files?.length || 0,
        description: "Cloud Notes 完整数据导出",
        note: "此导出包含您的所有文件夹和文件，保持原有的目录结构。"
      };
      
      zip.file("导出信息.md", `# Cloud Notes 数据导出

**导出时间**: ${new Date().toLocaleString('zh-CN')}  
**导出用户**: ${user.email}  
**文件夹数量**: ${folders?.length || 0}  
**文件数量**: ${files?.length || 0}

## 说明
此导出包含您在 Cloud Notes 中的所有文件夹和文件，保持原有的目录结构。

- Markdown 文件包含完整的文本内容
- 上传的文件会显示存储路径信息
- 文件夹结构与应用中完全一致

---
*由 Cloud Notes 云笔记应用生成*`);

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // 创建下载
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cloud-notes-完整备份-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert("数据导出成功！ZIP文件包含您的所有文件夹和文件。");
      
    } catch (error) {
      console.error("导出失败:", error);
      addError("导出数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">设置</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              个人信息
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              偏好设置
            </TabsTrigger>
            <TabsTrigger value="data">
              <Download className="h-4 w-4 mr-2" />
              数据管理
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              安全设置
            </TabsTrigger>
          </TabsList>

          {/* 个人信息 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>
                  管理您的个人资料信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    邮箱地址无法修改
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">全名</Label>
                  <Input
                    id="full_name"
                    placeholder="请输入您的全名"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Input
                    id="bio"
                    placeholder="介绍一下您自己"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>

                <Button onClick={updateProfile} disabled={loading}>
                  {loading ? "保存中..." : "保存更改"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 偏好设置 */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>偏好设置</CardTitle>
                <CardDescription>
                  自定义您的使用体验
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">偏好设置功能即将推出...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>数据管理</CardTitle>
                <CardDescription>
                  导出和管理您的数据
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">导出所有数据</h4>
                  <p className="text-sm text-muted-foreground">
                    下载包含您所有笔记和文件夹的备份文件
                  </p>
                  <Button onClick={exportAllData}>
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>安全设置</CardTitle>
                <CardDescription>
                  管理您的账户安全
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">安全设置功能即将推出...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}