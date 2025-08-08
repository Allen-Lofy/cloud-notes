-- 云笔记应用数据库初始化脚本
-- 在 Supabase 控制台的 SQL Editor 中执行此脚本

-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 folders 表
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, path)
);

-- 创建 files 表
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  size BIGINT DEFAULT 0,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, folder_id, name)
);

-- 创建 shares 表
CREATE TABLE IF NOT EXISTS shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 likes 表
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, share_id)
);

-- 创建 comments 表
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_id UUID REFERENCES shares(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_is_public ON shares(is_public);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_share_id ON likes(share_id);

CREATE INDEX IF NOT EXISTS idx_comments_share_id ON comments(share_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 profiles 表添加触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为 folders 表添加触发器
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at 
  BEFORE UPDATE ON folders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为 files 表添加触发器
DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at 
  BEFORE UPDATE ON files 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为 shares 表添加触发器
DROP TRIGGER IF EXISTS update_shares_updated_at ON shares;
CREATE TRIGGER update_shares_updated_at 
  BEFORE UPDATE ON shares 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
DROP POLICY IF EXISTS "用户可以查看所有公开的profiles" ON profiles;
CREATE POLICY "用户可以查看所有公开的profiles" ON profiles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "用户只能修改自己的profile" ON profiles;
CREATE POLICY "用户只能修改自己的profile" ON profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "新用户可以插入自己的profile" ON profiles;
CREATE POLICY "新用户可以插入自己的profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders 策略
DROP POLICY IF EXISTS "用户只能查看自己的文件夹" ON folders;
CREATE POLICY "用户只能查看自己的文件夹" ON folders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户只能操作自己的文件夹" ON folders;
CREATE POLICY "用户只能操作自己的文件夹" ON folders
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以创建文件夹" ON folders;
CREATE POLICY "用户可以创建文件夹" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Files 策略
DROP POLICY IF EXISTS "用户只能查看自己的文件" ON files;
CREATE POLICY "用户只能查看自己的文件" ON files
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户只能操作自己的文件" ON files;
CREATE POLICY "用户只能操作自己的文件" ON files
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以创建文件" ON files;
CREATE POLICY "用户可以创建文件" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shares 策略
DROP POLICY IF EXISTS "所有人可以查看公开的分享" ON shares;
CREATE POLICY "所有人可以查看公开的分享" ON shares
  FOR SELECT USING (is_public = TRUE);

DROP POLICY IF EXISTS "用户可以查看自己的所有分享" ON shares;
CREATE POLICY "用户可以查看自己的所有分享" ON shares
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户只能操作自己的分享" ON shares;
CREATE POLICY "用户只能操作自己的分享" ON shares
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以创建分享" ON shares;
CREATE POLICY "用户可以创建分享" ON shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes 策略
DROP POLICY IF EXISTS "所有人可以查看点赞（基于公开分享）" ON likes;
CREATE POLICY "所有人可以查看点赞（基于公开分享）" ON likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shares 
      WHERE shares.id = likes.share_id 
      AND shares.is_public = TRUE
    )
  );

DROP POLICY IF EXISTS "用户可以管理自己的点赞" ON likes;
CREATE POLICY "用户可以管理自己的点赞" ON likes
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以点赞公开内容" ON likes;
CREATE POLICY "用户可以点赞公开内容" ON likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM shares 
      WHERE shares.id = share_id 
      AND shares.is_public = TRUE
    )
  );

-- Comments 策略
DROP POLICY IF EXISTS "所有人可以查看公开分享的评论" ON comments;
CREATE POLICY "所有人可以查看公开分享的评论" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shares 
      WHERE shares.id = comments.share_id 
      AND shares.is_public = TRUE
    )
  );

DROP POLICY IF EXISTS "用户可以管理自己的评论" ON comments;
CREATE POLICY "用户可以管理自己的评论" ON comments
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可以在公开内容下评论" ON comments;
CREATE POLICY "用户可以在公开内容下评论" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM shares 
      WHERE shares.id = share_id 
      AND shares.is_public = TRUE
    )
  );

-- 创建存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public) 
SELECT 'user-files', 'user-files', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-files');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'user-avatars', 'user-avatars', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-avatars');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'shared-files', 'shared-files', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'shared-files');

-- 存储策略
DROP POLICY IF EXISTS "用户只能查看自己的文件" ON storage.objects;
CREATE POLICY "用户只能查看自己的文件" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "用户只能上传到自己的目录" ON storage.objects;
CREATE POLICY "用户只能上传到自己的目录" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "用户只能删除自己的文件" ON storage.objects;
CREATE POLICY "用户只能删除自己的文件" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "用户可以更新自己的文件" ON storage.objects;
CREATE POLICY "用户可以更新自己的文件" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 头像存储策略
DROP POLICY IF EXISTS "所有人可以查看头像" ON storage.objects;
CREATE POLICY "所有人可以查看头像" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "用户只能上传自己的头像" ON storage.objects;
CREATE POLICY "用户只能上传自己的头像" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "用户只能删除自己的头像" ON storage.objects;
CREATE POLICY "用户只能删除自己的头像" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 共享文件策略
DROP POLICY IF EXISTS "所有人可以查看公开分享的文件" ON storage.objects;
CREATE POLICY "所有人可以查看公开分享的文件" ON storage.objects
  FOR SELECT USING (bucket_id = 'shared-files');

DROP POLICY IF EXISTS "用户可以上传分享文件" ON storage.objects;
CREATE POLICY "用户可以上传分享文件" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'shared-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "用户只能删除自己分享的文件" ON storage.objects;
CREATE POLICY "用户只能删除自己分享的文件" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'shared-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );