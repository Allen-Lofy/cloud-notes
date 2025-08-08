import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { User, Profile, Folder, File, EditorState, AppState } from "./types";

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setFolders: (folders: Folder[]) => void;
  setCurrentFolder: (folder: Folder | null) => void;
  setSelectedFiles: (files: File[]) => void;
  addSelectedFile: (file: File) => void;
  removeSelectedFile: (fileId: string) => void;
  clearSelectedFiles: () => void;
  
  // Editor actions
  setActiveFile: (file: File | null) => void;
  setEditorContent: (content: string) => void;
  setEditorDirty: (isDirty: boolean) => void;
  setPreviewMode: (isPreview: boolean) => void;
  
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setPreviewPanelOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  
  // Loading actions
  setLoading: (key: keyof AppState["loading"], loading: boolean) => void;
  
  // Error actions
  addError: (error: string) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  
  // File system actions
  addFolder: (folder: Folder) => void;
  updateFolder: (folderId: string, updates: Partial<Folder>) => void;
  removeFolder: (folderId: string) => void;
  addFile: (file: File) => void;
  updateFile: (fileId: string, updates: Partial<File>) => void;
  removeFile: (fileId: string) => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        profile: null,
        folders: [],
        currentFolder: null,
        selectedFiles: [],
        editor: {
          activeFile: undefined,
          content: "",
          isDirty: false,
          isPreviewMode: false,
        },
        sidebarOpen: true,
        previewPanelOpen: true,
        darkMode: false,
        loading: {
          files: false,
          upload: false,
          save: false,
        },
        errors: [],

        // Actions
        setUser: (user) => set({ user }),
        setProfile: (profile) => set({ profile }),
        setFolders: (folders) => set({ folders }),
        setCurrentFolder: (currentFolder) => set({ currentFolder }),
        setSelectedFiles: (selectedFiles) => set({ selectedFiles }),
        
        addSelectedFile: (file) => {
          const { selectedFiles } = get();
          if (!selectedFiles.some(f => f.id === file.id)) {
            set({ selectedFiles: [...selectedFiles, file] });
          }
        },
        
        removeSelectedFile: (fileId) => {
          const { selectedFiles } = get();
          set({ selectedFiles: selectedFiles.filter(f => f.id !== fileId) });
        },
        
        clearSelectedFiles: () => set({ selectedFiles: [] }),

        // Editor actions
        setActiveFile: (activeFile) => set(state => ({
          editor: { ...state.editor, activeFile: activeFile || undefined }
        })),
        
        setEditorContent: (content) => set(state => ({
          editor: { ...state.editor, content }
        })),
        
        setEditorDirty: (isDirty) => set(state => ({
          editor: { ...state.editor, isDirty }
        })),
        
        setPreviewMode: (isPreviewMode) => set(state => ({
          editor: { ...state.editor, isPreviewMode }
        })),

        // UI actions
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setPreviewPanelOpen: (previewPanelOpen) => set({ previewPanelOpen }),
        setDarkMode: (darkMode) => set({ darkMode }),

        // Loading actions
        setLoading: (key, loading) => set(state => ({
          loading: { ...state.loading, [key]: loading }
        })),

        // Error actions
        addError: (error) => set(state => ({
          errors: [...state.errors, error]
        })),
        
        removeError: (index) => set(state => ({
          errors: state.errors.filter((_, i) => i !== index)
        })),
        
        clearErrors: () => set({ errors: [] }),

        // File system actions
        addFolder: (folder) => set(state => ({
          folders: [...state.folders, folder]
        })),
        
        updateFolder: (folderId, updates) => set(state => ({
          folders: state.folders.map(folder => 
            folder.id === folderId ? { ...folder, ...updates } : folder
          )
        })),
        
        removeFolder: (folderId) => set(state => ({
          folders: state.folders.filter(folder => folder.id !== folderId)
        })),
        
        addFile: (file) => {
          // 这里可以添加到对应文件夹的文件列表中
          // 但由于文件夹结构较复杂，建议通过API重新获取
        },
        
        updateFile: (fileId, updates) => {
          const state = get();
          if (state.editor.activeFile?.id === fileId) {
            set(prevState => ({
              editor: {
                ...prevState.editor,
                activeFile: { ...prevState.editor.activeFile, ...updates } as File
              }
            }));
          }
        },
        
        removeFile: (fileId) => {
          const state = get();
          if (state.editor.activeFile?.id === fileId) {
            set(prevState => ({
              editor: { ...prevState.editor, activeFile: undefined, content: "" }
            }));
          }
          // 从选中文件列表中移除
          set(state => ({
            selectedFiles: state.selectedFiles.filter(f => f.id !== fileId)
          }));
        },
      }),
      {
        name: "cloud-notes-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          previewPanelOpen: state.previewPanelOpen,
          darkMode: state.darkMode,
        }),
      }
    ),
    { name: "cloud-notes-store" }
  )
);