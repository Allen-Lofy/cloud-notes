"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/lib/store";
import type { EditorSettings } from "@/lib/types";

export function EditorPreferences() {
  const { preferences, updateEditorSettings } = useAppStore();
  const [settings, setSettings] = useState<EditorSettings>(preferences.editor);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(preferences.editor);
  }, [preferences.editor]);

  const handleSettingChange = (key: keyof EditorSettings, value: string | number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateEditorSettings(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(preferences.editor);
    setHasChanges(false);
  };

  const autoSaveOptions = [
    { value: 5000, label: "5秒" },
    { value: 10000, label: "10秒" },
    { value: 15000, label: "15秒" },
    { value: 20000, label: "20秒" },
    { value: 30000, label: "30秒" },
    { value: 60000, label: "1分钟" },
  ];

  return (
    <div className="space-y-6">
      {/* 自动保存设置 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableAutoSave"
            checked={settings.enableAutoSave}
            onCheckedChange={(checked) => 
              handleSettingChange('enableAutoSave', checked)
            }
          />
          <Label htmlFor="enableAutoSave" className="text-sm font-medium">
            启用自动保存
          </Label>
        </div>

        {settings.enableAutoSave && (
          <div className="space-y-2 ml-6">
            <Label className="text-sm">自动保存间隔</Label>
            <div className="grid grid-cols-3 gap-2">
              {autoSaveOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.autoSaveInterval === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSettingChange('autoSaveInterval', option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              当前设置：每{settings.autoSaveInterval / 1000}秒自动保存
            </p>
          </div>
        )}
      </div>

      {/* 预览设置 */}
      <div className="space-y-2">
        <Label htmlFor="previewDelay" className="text-sm font-medium">
          预览延迟 (毫秒)
        </Label>
        <Input
          id="previewDelay"
          type="number"
          value={settings.previewDelay}
          onChange={(e) => handleSettingChange('previewDelay', parseInt(e.target.value) || 200)}
          min={100}
          max={2000}
          step={100}
          className="max-w-32"
        />
        <p className="text-xs text-muted-foreground">
          控制预览面板更新的延迟时间，数值越大性能越好
        </p>
      </div>

      {/* 编辑器外观设置 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">编辑器外观</h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableLineNumbers"
            checked={settings.enableLineNumbers}
            onCheckedChange={(checked) => 
              handleSettingChange('enableLineNumbers', checked)
            }
          />
          <Label htmlFor="enableLineNumbers" className="text-sm">
            显示行号
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableMinimap"
            checked={settings.enableMinimap}
            onCheckedChange={(checked) => 
              handleSettingChange('enableMinimap', checked)
            }
          />
          <Label htmlFor="enableMinimap" className="text-sm">
            显示迷你地图
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableWordWrap"
            checked={settings.enableWordWrap}
            onCheckedChange={(checked) => 
              handleSettingChange('enableWordWrap', checked)
            }
          />
          <Label htmlFor="enableWordWrap" className="text-sm">
            自动换行
          </Label>
        </div>
      </div>

      {/* 字体设置 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">字体设置</h4>
        
        <div className="space-y-2">
          <Label htmlFor="fontSize" className="text-sm">
            字体大小
          </Label>
          <Input
            id="fontSize"
            type="number"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value) || 14)}
            min={10}
            max={24}
            step={1}
            className="max-w-32"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontFamily" className="text-sm">
            字体族
          </Label>
          <Input
            id="fontFamily"
            value={settings.fontFamily}
            onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
            placeholder="例如: 'JetBrains Mono', monospace"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center space-x-4 pt-4 border-t">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="flex-shrink-0"
        >
          保存设置
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!hasChanges}
          className="flex-shrink-0"
        >
          重置
        </Button>
        {hasChanges && (
          <p className="text-sm text-muted-foreground">
            有未保存的更改
          </p>
        )}
      </div>
    </div>
  );
}