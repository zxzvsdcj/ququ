import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('正在初始化...');

  useEffect(() => {
    const steps = [
      { progress: 20, status: '加载核心模块...' },
      { progress: 40, status: '初始化数据库...' },
      { progress: 60, status: '启动 FunASR 服务...' },
      { progress: 80, status: '加载 AI 模型...' },
      { progress: 100, status: '准备就绪！' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setProgress(step.progress);
        setStatus(step.status);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo 区域 */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">蛐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 chinese-title">
            蛐蛐 (QuQu)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            智能语音转文字应用
          </p>
        </div>

        {/* 进度条 */}
        <div className="w-80 mx-auto mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 加载动画 */}
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            正在启动，请稍候...
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
