import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useRecording } from './hooks/useRecording';
import { useModelStatus } from './hooks/useModelStatus';
import { useHotkey } from './hooks/useHotkey';

const FloatBall = () => {
  const [status, setStatus] = useState('idle'); // idle, recording, processing, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  const { isRecording, isProcessing, isOptimizing, startRecording, stopRecording } = useRecording();
  const modelStatus = useModelStatus();
  const { syncRecordingState } = useHotkey();
  
  // 使用ref存储最新状态，避免闭包问题
  const stateRef = useRef({ isRecording, isProcessing, isOptimizing, modelStatus });
  
  // 更新ref中的状态
  useEffect(() => {
    stateRef.current = { isRecording, isProcessing, isOptimizing, modelStatus };
  }, [isRecording, isProcessing, isOptimizing, modelStatus]);

  // JavaScript实现拖拽（避免-webkit-app-region导致的白色条问题）
  const handleMouseDown = useCallback((e) => {
    // 只响应左键
    if (e.button !== 0) return;
    
    // 记录点击起始位置（用于区分点击和拖拽）
    clickStartPos.current = { x: e.screenX, y: e.screenY };
    
    setIsDragging(true);
    dragStartPos.current = { x: e.screenX, y: e.screenY };
    
    // 获取当前窗口位置
    if (window.electronAPI && window.electronAPI.getWindowPosition) {
      window.electronAPI.getWindowPosition().then(pos => {
        dragStartPos.current.windowX = pos.x;
        dragStartPos.current.windowY = pos.y;
      });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.screenX - dragStartPos.current.x;
    const deltaY = e.screenY - dragStartPos.current.y;
    
    if (window.electronAPI && window.electronAPI.setWindowPosition) {
      const newX = (dragStartPos.current.windowX || 0) + deltaX;
      const newY = (dragStartPos.current.windowY || 0) + deltaY;
      window.electronAPI.setWindowPosition(newX, newY);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(async () => {
    setIsDragging(false);
    
    // 拖拽结束时检查是否在边缘
    if (window.electronAPI && window.electronAPI.getWindowPosition && window.electronAPI.checkFloatBallEdge) {
      try {
        const pos = await window.electronAPI.getWindowPosition();
        const edgeResult = await window.electronAPI.checkFloatBallEdge(pos.x, pos.y);
        
        if (edgeResult.shouldHide && edgeResult.edge) {
          console.log('🎯 悬浮球拖拽到边缘，准备隐藏:', edgeResult.edge);
          // 隐藏到边缘
          await window.electronAPI.hideFloatBallToEdge(edgeResult.edge);
        }
      } catch (error) {
        console.error('检查边缘失败:', error);
      }
    }
  }, []);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
  // 记录鼠标按下位置，用于区分点击和拖拽
  const clickStartPos = useRef({ x: 0, y: 0 });
  
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 如果移动距离超过5像素，认为是拖拽而不是点击
    const moveDistance = Math.sqrt(
      Math.pow(e.screenX - clickStartPos.current.x, 2) +
      Math.pow(e.screenY - clickStartPos.current.y, 2)
    );
    if (moveDistance > 5) {
      return; // 是拖拽，不触发点击
    }
    
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

  // 注册自定义快捷键 - 只注册一次
  useEffect(() => {
    const registerHotkeys = async () => {
      try {
        // 注册自定义快捷键（从设置中读取）
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

    // 监听自定义快捷键事件 - 使用ref获取最新状态
    const handleHotkeyTriggered = () => {
      const { isRecording, isProcessing, isOptimizing, modelStatus } = stateRef.current;
      console.log('🎹 悬浮球：收到自定义快捷键事件，当前状态:', { isRecording, isProcessing, isOptimizing });
      
      // 切换录音状态
      if (isRecording) {
        console.log('🎹 悬浮球：停止录音');
        stopRecording();
      } else if (modelStatus.isReady && !isProcessing && !isOptimizing) {
        console.log('🎹 悬浮球：开始录音');
        startRecording();
      } else {
        console.log('🎹 悬浮球：无法切换状态，模型未就绪或正在处理中');
      }
    };

    // 注册监听器
    let removeHotkeyListener = null;

    if (window.electronAPI && window.electronAPI.onHotkeyTriggered) {
      removeHotkeyListener = window.electronAPI.onHotkeyTriggered(handleHotkeyTriggered);
    }

    return () => {
      // 清理监听器
      if (removeHotkeyListener) {
        removeHotkeyListener();
      }
    };
  }, [startRecording, stopRecording]); // 只依赖函数引用，不依赖状态

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

  // 获取背景渐变色
  const getBackground = () => {
    switch (status) {
      case 'recording':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'processing':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
      default: // idle
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  // 获取动画样式
  const getAnimation = () => {
    switch (status) {
      case 'recording':
        return 'pulse 1.5s ease-in-out infinite';
      case 'processing':
        return 'spin 2s linear infinite';
      default:
        return 'none';
    }
  };

  // 渲染图标
  const renderIcon = () => {
    switch (status) {
      case 'recording':
        // 声波动画
        return (
          <div style={{
            display: 'flex',
            gap: '3px',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: '16px',
                  background: 'white',
                  borderRadius: '2px',
                  animation: `wave 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'processing':
        // 加载点动画
        return (
          <div style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: `bounce 1.4s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'error':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/>
          </svg>
        );
      
      default: // idle
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="white"/>
            <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10H7V12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12V10H19Z" fill="white"/>
            <path d="M11 20V23H13V20H11Z" fill="white"/>
          </svg>
        );
    }
  };

  return (
    <>
      {/* 内联CSS动画定义 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(240, 147, 251, 0.4); }
          50% { transform: scale(1.08); box-shadow: 0 6px 30px rgba(240, 147, 251, 0.6); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-8px); opacity: 0.7; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); }
          50% { box-shadow: 0 4px 30px rgba(102, 126, 234, 0.6); }
        }
        .float-ball-container:hover {
          transform: scale(1.1) !important;
        }
      `}</style>
      
      <div
        className="float-ball-container"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        title={
          status === 'error' 
            ? errorMessage 
            : status === 'recording' 
            ? '录音中 (点击或按快捷键停止)' 
            : status === 'processing'
            ? '处理中...'
            : '点击或按快捷键开始录音'
        }
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: getBackground(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.3s ease',
          animation: status === 'idle' ? 'glow 3s ease-in-out infinite' : getAnimation(),
          boxShadow: status === 'recording' 
            ? '0 6px 25px rgba(240, 147, 251, 0.5)' 
            : status === 'processing'
            ? '0 6px 25px rgba(79, 172, 254, 0.5)'
            : status === 'error'
            ? '0 6px 25px rgba(255, 107, 107, 0.5)'
            : '0 4px 20px rgba(102, 126, 234, 0.4)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div style={{
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          {renderIcon()}
        </div>
      </div>
    </>
  );
};

// 挂载React应用
function mountApp() {
  // 清理可能的Vite注入元素
  const viteElements = document.querySelectorAll('vite-error-overlay, [data-vite-dev-id]');
  viteElements.forEach(el => el.remove());
  
  // 清空body中除了script之外的所有元素
  Array.from(document.body.children).forEach(child => {
    if (child.tagName !== 'SCRIPT') {
      child.remove();
    }
  });
  
  // 创建React根容器
  const container = document.createElement('div');
  container.id = 'react-root';
  container.style.cssText = `
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  `;
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(<FloatBall />);
}

// 确保DOM加载完成后挂载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

