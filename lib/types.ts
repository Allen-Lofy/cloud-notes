// 云笔记应用类型定义

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  parent_id?: string;
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
  children?: Folder[];
  files?: File[];
}

export interface File {
  id: string;
  user_id: string;
  folder_id?: string;
  name: string;
  type: 'markdown' | 'pdf' | 'image' | 'document' | 'other';
  content?: string;
  file_path?: string;
  size: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: string;
  user_id: string;
  file_id: string;
  title: string;
  description?: string;
  tags: string[];
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  file?: File;
  user?: Profile;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  share_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  share_id: string;
  content: string;
  created_at: string;
  user?: Profile;
}

// UI 组件相关类型
export interface FileTreeItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileTreeItem[];
  path: string;
  parent_id?: string;
}

export interface EditorState {
  activeFile?: File;
  content: string;
  isDirty: boolean;
  isPreviewMode: boolean;
}

export interface UploadProgress {
  file: globalThis.File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// 搜索和过滤
export interface SearchFilters {
  query?: string;
  type?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
}

// 文件预览
export interface PreviewOptions {
  file: File;
  mode: 'inline' | 'modal' | 'fullscreen';
  enableDownload?: boolean;
  enableEdit?: boolean;
}

// 导出选项
export interface ExportOptions {
  format: 'pdf' | 'html' | 'markdown' | 'zip';
  includeAttachments?: boolean;
  filename?: string;
}

// 系统统计
export interface SystemStats {
  totalUsers: number;
  totalFiles: number;
  totalShares: number;
  storageUsed: number;
  activeUsers: number;
  recentActivity: {
    date: string;
    uploads: number;
    shares: number;
    views: number;
  }[];
}

// 管理员操作
export interface AdminAction {
  type: 'delete_user' | 'ban_user' | 'make_admin' | 'delete_file' | 'delete_share';
  target_id: string;
  reason?: string;
}

// Zustand store 类型
export interface AppState {
  // 用户状态
  user: User | null;
  profile: Profile | null;
  
  // 文件系统状态
  folders: Folder[];
  currentFolder: Folder | null;
  selectedFiles: File[];
  
  // 编辑器状态
  editor: EditorState;
  
  // UI 状态
  sidebarOpen: boolean;
  previewPanelOpen: boolean;
  darkMode: boolean;
  
  // 加载状态
  loading: {
    files: boolean;
    upload: boolean;
    save: boolean;
  };
  
  // 错误状态
  errors: string[];
}

// 表单类型
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export interface ProfileForm {
  username?: string;
  full_name?: string;
  bio?: string;
  avatar?: globalThis.File;
}

export interface ShareForm {
  title: string;
  description?: string;
  tags: string[];
  is_public: boolean;
}

export interface FolderForm {
  name: string;
  parent_id?: string;
}

export interface FileForm {
  name: string;
  folder_id?: string;
  content?: string;
}

// 快捷键配置
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: string;
  description: string;
}

// 主题配置
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  editorTheme: string;
}

// 编辑器设置
export interface EditorSettings {
  autoSaveInterval: number; // 自动保存间隔，单位：毫秒
  enableAutoSave: boolean; // 是否启用自动保存
  previewDelay: number; // 预览延迟，单位：毫秒
  enableLineNumbers: boolean; // 是否显示行号
  enableMinimap: boolean; // 是否显示迷你地图
  enableWordWrap: boolean; // 是否启用自动换行
  fontSize: number; // 编辑器字体大小
  fontFamily: string; // 编辑器字体族
}

// 用户偏好设置
export interface UserPreferences {
  editor: EditorSettings;
  theme: ThemeConfig;
  language: 'zh-CN' | 'en-US';
}