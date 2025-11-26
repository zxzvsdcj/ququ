import React, { useState } from "react";
import { Mic, Shield, Settings } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import PermissionCard from "./ui/permission-card";
import { toast } from "sonner";

const SettingsPanel = ({ onClose }) => {
  const [enableAiOptimization, setEnableAiOptimization] = useState(true);
  const [uiMode, setUiMode] = useState('full'); // full or float
  const [isLoading, setIsLoading] = useState(true);

  const showAlert = (alert) => {
    toast(alert.title, {
      description: alert.description,
      duration: 4000,
    });
  };

  const {
    micPermissionGranted,
    accessibilityPermissionGranted,
    requestMicPermission,
    testAccessibilityPermission,
  } = usePermissions(showAlert);

  // 加载设置
  React.useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI && window.electronAPI.getSetting) {
        try {
          const aiEnabled = await window.electronAPI.getSetting('enable_ai_optimization', true);
          const mode = await window.electronAPI.getSetting('ui_mode', 'full');
          setEnableAiOptimization(aiEnabled);
          setUiMode(mode);
        } catch (error) {
          console.error('加载设置失败:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // 切换AI优化开关
  const toggleAiOptimization = async () => {
    const newValue = !enableAiOptimization;
    setEnableAiOptimization(newValue);
    
    if (window.electronAPI && window.electronAPI.setSetting) {
      try {
        await window.electronAPI.setSetting('enable_ai_optimization', newValue);
        toast.success(newValue ? 'AI优化已启用' : 'AI优化已关闭', {
          description: newValue 
            ? '语音识别结果将经过AI优化处理，提升文本质量' 
            : '将直接显示FunASR识别结果，速度更快',
          duration: 3000,
        });
      } catch (error) {
        console.error('保存设置失败:', error);
        // 回滚状态
        setEnableAiOptimization(!newValue);
        toast.error('设置保存失败', {
          description: error.message || '请重试',
          duration: 3000,
        });
      }
    }
  };

  // 切换界面模式
  const switchUIMode = async (mode) => {
    setUiMode(mode);
    
    if (window.electronAPI) {
      try {
        await window.electronAPI.setSetting('ui_mode', mode);
        await window.electronAPI.switchUIMode(mode);
        toast.success(mode === 'float' ? '已切换到悬浮球模式' : '已切换到完整模式', {
          description: mode === 'float' 
            ? '仅显示状态指示器，性能更优' 
            : '显示完整界面，功能更全',
          duration: 3000,
        });
        // 关闭设置面板
        onClose();
      } catch (error) {
        console.error('切换UI模式失败:', error);
        // 回滚状态
        setUiMode(mode === 'float' ? 'full' : 'float');
        toast.error('切换失败', {
          description: error.message || '请重试',
          duration: 3000,
        });
      }
    }
  };

  // 打开完整设置页面
  const openFullSettings = () => {
    if (window.electronAPI && window.electronAPI.openSettingsWindow) {
      window.electronAPI.openSettingsWindow();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 chinese-title">快速设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-gray-500 text-xl">×</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-8">
          {/* 性能设置部分 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 chinese-title">
              性能设置
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">AI文本优化</h4>
                    {isLoading ? (
                      <span className="text-xs text-gray-500">加载中...</span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        enableAiOptimization 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {enableAiOptimization ? '已启用' : '已关闭'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {enableAiOptimization 
                      ? <><span role="img" aria-label="sparkles">✨</span> 识别结果将经过AI优化，提升文本质量（速度稍慢）</>
                      : <><span role="img" aria-label="lightning">⚡</span> 直接显示FunASR识别结果，响应更快（无AI处理）</>
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    <span role="img" aria-label="bulb">💡</span> 提示：关闭AI优化可减少1-5秒延迟，适合快速输入场景
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableAiOptimization}
                  disabled={isLoading}
                  onClick={toggleAiOptimization}
                  className={`${
                    enableAiOptimization ? 'bg-blue-600' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      enableAiOptimization ? 'translate-x-5' : 'translate-x-0'
                    } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>

            {/* 界面模式选择 */}
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">界面模式</h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    uiMode === 'float' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {uiMode === 'float' ? '悬浮球' : '完整界面'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  选择应用显示方式，影响性能和使用体验
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => switchUIMode('full')}
                    disabled={isLoading}
                    className={`${
                      uiMode === 'full' 
                        ? 'bg-blue-500 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    } p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-left">
                      <div className="font-medium mb-1">完整模式</div>
                      <div className="text-xs opacity-90">
                        显示完整界面<br/>
                        功能全面，适合查看文本
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => switchUIMode('float')}
                    disabled={isLoading}
                    className={`${
                      uiMode === 'float' 
                        ? 'bg-purple-500 text-white border-purple-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                    } p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-left">
                      <div className="font-medium mb-1">悬浮球模式 ⚡</div>
                      <div className="text-xs opacity-90">
                        仅显示状态指示器<br/>
                        性能最优，响应更快
                      </div>
                    </div>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  <span role="img" aria-label="rocket">🚀</span> 提示：悬浮球模式下AI关闭时，粘贴耗时仅约30ms（完整模式62ms）
                </p>
              </div>
            </div>
            
            <button
              onClick={openFullSettings}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              &rarr; 打开完整AI配置（API Key、模型等）
            </button>
          </div>

          {/* 权限部分 */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 chinese-title">
              权限管理
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              测试和管理应用权限，确保麦克风和辅助功能正常工作。
            </p>
            
            <div className="space-y-4">
              <PermissionCard
                icon={Mic}
                title="麦克风权限"
                description="录制语音所需的权限"
                granted={micPermissionGranted}
                onRequest={requestMicPermission}
                buttonText="测试麦克风"
              />

              <PermissionCard
                icon={Shield}
                title="辅助功能权限"
                description="自动粘贴文本所需的权限"
                granted={accessibilityPermissionGranted}
                onRequest={testAccessibilityPermission}
                buttonText="测试权限"
              />
            </div>
          </div>

          {/* 应用信息部分 */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 chinese-title">
              关于蛐蛐
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span role="img" aria-label="microphone">🎤</span> <strong>蛐蛐 (QuQu)</strong> - 基于FunASR和AI的中文语音转文字应用
              </p>
              <p className="text-xs text-gray-600">
                • 高精度中文语音识别<br/>
                • AI智能文本优化（可快速切换）<br/>
                • 实时语音处理<br/>
                • 隐私保护设计
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;