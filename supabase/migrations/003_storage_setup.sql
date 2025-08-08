-- Storage 存储桶设置和权限配置

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('user-files', 'user-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('user-avatars', 'user-avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-files', 'shared-files', true);

-- user-files 桶的策略（私有文件）
CREATE POLICY "用户只能查看自己的文件" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "用户只能上传到自己的目录" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "用户只能删除自己的文件" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "用户可以更新自己的文件" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- user-avatars 桶的策略（公开头像）
CREATE POLICY "所有人可以查看头像" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "用户只能上传自己的头像" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "用户只能删除自己的头像" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- shared-files 桶的策略（公开分享文件）
CREATE POLICY "所有人可以查看公开分享的文件" ON storage.objects
  FOR SELECT USING (bucket_id = 'shared-files');

CREATE POLICY "用户可以上传分享文件" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'shared-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "用户只能删除自己分享的文件" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'shared-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );