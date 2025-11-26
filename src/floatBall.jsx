import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useRecording } from './hooks/useRecording';
import { useModelStatus } from './hooks/useModelStatus';
import { useHotkey } from './hooks/useHotkey';

const FloatBall = () => {
  const [status, setStatus] = useState('idle'); // idle, recording, processing, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const { isRecording, isProcessing, isOptimizing, startRecording, stopRecording } = useRecording();
  const modelStatus = useModelStatus();
  const { syncRecordingState } = useHotkey();

  // 更新状态
  useEffect(() => {
    if (isRecording) {
      setStatus('recording');
    } else if (isProcessing || isOptimizing) {
      setStatus('processing');
    } else if (errorMessage) {
      setStatus('error');
      // 3秒后清除错误状态
      const timer = setTimeout(() => {
        setErrorMessage('');
        setStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setStatus('idle');
    }
  }, [isRecording, isProcessing, isOptimizing, errorMessage]);

  // 监听模型状态
  useEffect(() => {
    if (modelStatus.stage === 'error') {
      setErrorMessage(modelStatus.error || '模型错误');
      setStatus('error');
    }
  }, [modelStatus.stage, modelStatus.error]);

  // 点击切换录音
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    
    // 检查模型状态
    if (!modelStatus.isReady) {
      setErrorMessage('模型未就绪');
      setStatus('error');
      return;
    }

    if (isRecording) {
      stopRecording();
    } else if (!isProcessing && !isOptimizing) {
      startRecording();
    }
  }, [isRecording, isProcessing, isOptimizing, modelStatus.isReady, startRecording, stopRecording]);

  // 右键菜单 - 显示选项菜单
  const handleContextMenu = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 使用原生Electron菜单
    if (window.electronAPI && window.electronAPI.showFloatBallContextMenu) {
      await window.electronAPI.showFloatBallContextMenu();
    }
  }, []);

  // 注册热键（F2双击 + 自定义快捷键）和录音状态同步
  useEffect(() => {
    // 注册所有热键
    const registerHotkeys = async () => {
      try {
        // 1. 注册F2双击热键
        if (window.electronAPI && window.electronAPI.registerF2Hotkey) {
          await window.electronAPI.registerF2Hotkey();
          console.log('✅ 悬浮球：F2双击热键已注册');
        }

        // 2. 注册自定义快捷键（从设置中读取）
        if (window.electronAPI && window.electronAPI.getSetting && window.electronAPI.registerHotkey) {
          const customHotkey = await window.electronAPI.getSetting('hotkey', 'CommandOrControl+Shift+Space');
          if (customHotkey) {
            const result = await window.electronAPI.registerHotkey(customHotkey);
            if (result.success) {
              console.log('✅ 悬浮球：自定义快捷键已注册', customHotkey);
            } else {
              console.warn('⚠️ 悬浮球：自定义快捷键注册失败', customHotkey);
            }
          }
        }
      } catch (error) {
        console.error('❌ 悬浮球：热键注册失败', error);
      }
    };

    registerHotkeys();

    // 监听F2双击事件
    const handleF2DoubleClick = (event, data) => {
      console.log('🎹 悬浮球：收到F2双击事件', data);
      if (data.action === 'start') {
        if (modelStatus.isReady && !isProcessing && !isOptimizing) {
          startRecording();
        }
      } else if (data.action === 'stop') {
        if (isRecording) {
          stopRecording();
        }
      }
    };

    // 监听自定义快捷键事件
    const handleHotkeyTriggered = () => {
      console.log('🎹 悬浮球：收到自定义快捷键事件');
      // 切换录音状态
      if (isRecording) {
        stopRecording();
      } else if (modelStatus.isReady && !isProcessing && !isOptimizing) {
        startRecording();
      }
    };

    if (window.electronAPI && window.electronAPI.onF2DoubleClick) {
      window.electronAPI.onF2DoubleClick(handleF2DoubleClick);
    }

    if (window.electronAPI && window.electronAPI.onHotkeyTriggered) {
      window.electronAPI.onHotkeyTriggered(handleHotkeyTriggered);
    }

    return () => {
      // 清理监听器
      if (window.electronAPI && window.electronAPI.removeF2DoubleClickListener) {
        window.electronAPI.removeF2DoubleClickListener();
      }
    };
  }, [modelStatus.isReady, isRecording, isProcessing, isOptimizing, startRecording, stopRecording]);

  // 同步录音状态到主进程
  useEffect(() => {
    syncRecordingState(isRecording);
  }, [isRecording, syncRecordingState]);

  // 注册全局录音完成和AI优化完成回调
  useEffect(() => {
    // 录音完成回调
    window.onTranscriptionComplete = async (result) => {
      console.log('🎤 悬浮球：语音识别完成', result);
      // 悬浮球模式：静默处理，不显示Toast
    };

    // AI优化完成回调
    window.onAIOptimizationComplete = async (result) => {
      console.log('🤖 悬浮球：处理完成', result);
      
      // 自动粘贴文本
      if (result.text && window.electronAPI) {
        try {
          const pasteResult = await window.electronAPI.pasteText(result.text);
          console.log('✅ 悬浮球：粘贴结果', pasteResult);
          
          // 悬浮球模式下不显示Toast，只在控制台记录
          if (pasteResult && pasteResult.requiresManualPaste) {
            console.log('ℹ️ 悬浮球：需要手动粘贴 -', pasteResult.message);
          }
        } catch (error) {
          console.error('❌ 悬浮球：粘贴失败', error);
          setErrorMessage('粘贴失败');
        }
      }
    };

    return () => {
      window.onTranscriptionComplete = null;
      window.onAIOptimizationComplete = null;
    };
  }, [syncRecordingState]);

  // 渲染图标
  const renderIcon = () => {
    switch (status) {
      case 'recording':
        return (
          <div className="wave-container">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
        );
      
      case 'processing':
        return (
          <div className="dots-container">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case 'error':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/>
          </svg>
        );
      
      default: // idle
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="white"/>
            <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10H7V12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12V10H19Z" fill="white"/>
            <path d="M11 20V23H13V20H11Z" fill="white"/>
          </svg>
        );
    }
  };

  return (
    <div
      id="float-ball"
      className={status}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={
        status === 'error' 
          ? errorMessage 
          : status === 'recording' 
          ? '录音中 (按F2两次停止)' 
          : status === 'processing'
          ? '处理中...'
          : '点击或按F2两次开始录音'
      }
    >
      <div className="icon">
        {renderIcon()}
      </div>
    </div>
  );
};

// 挂载React应用
const root = createRoot(document.getElementById('root') || document.body);
root.render(<FloatBall />);

