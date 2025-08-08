-- Row Level Security 策略设置
-- 确保数据安全和权限隔离

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
CREATE POLICY "用户可以查看所有公开的profiles" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "用户只能修改自己的profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "新用户可以插入自己的profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders 策略
CREATE POLICY "用户只能查看自己的文件夹" ON folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能操作自己的文件夹" ON folders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建文件夹" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Files 策略
CREATE POLICY "用户只能查看自己的文件" ON files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能操作自己的文件" ON files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建文件" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shares 策略
CREATE POLICY "所有人可以查看公开的分享" ON shares
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "用户可以查看自己的所有分享" ON shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能操作自己的分享" ON shares
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建分享" ON shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes 策略
CREATE POLICY "所有人可以查看点赞（基于公开分享）" ON likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shares 
      WHERE shares.id = likes.share_id 
      AND shares.is_public = TRUE
    )
  );

CREATE POLICY "用户可以管理自己的点赞" ON likes
  FOR ALL USING (auth.uid() = user_id);

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
CREATE POLICY "所有人可以查看公开分享的评论" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shares 
      WHERE shares.id = comments.share_id 
      AND shares.is_public = TRUE
    )
  );

CREATE POLICY "用户可以管理自己的评论" ON comments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户可以在公开内容下评论" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM shares 
      WHERE shares.id = share_id 
      AND shares.is_public = TRUE
    )
  );

-- 管理员特殊权限
CREATE POLICY "管理员可以查看所有数据" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "管理员可以管理所有用户" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  );