# 蛐蛐 (QuQu) 项目概览

## 项目目的
蛐蛐是一个开源免费的 Wispr Flow 替代方案，专为中文用户打造的注重隐私的桌面端语音输入与文本处理工具。核心功能包括：

- **本地语音识别**: 使用阿里巴巴 FunASR Paraformer 模型进行高精度中文语音识别
- **AI 文本优化**: 支持配置各种 AI 模型（OpenAI、通义千问、Kimi 等）进行智能文本优化
- **隐私保护**: 所有语音数据在本地处理，不上传到云端
- **跨平台支持**: 支持 macOS、Windows、Linux

## 技术栈
- **前端**: React 19, TypeScript, Tailwind CSS, shadcn/ui, Vite
- **桌面端**: Electron
- **语音技术**: FunASR (Paraformer-large, FSMN-VAD, CT-Transformer)
- **AI模型**: 兼容 OpenAI API 的各种模型
- **数据库**: better-sqlite3
- **Python环境**: 支持 uv、系统 Python、嵌入式 Python 三种方式

## 项目结构
```
ququ/
├── main.js                 # Electron 主进程入口
├── preload.js              # 预加载脚本
├── funasr_server.py        # Python FunASR 服务
├── download_models.py      # 模型下载脚本
├── src/                    # 前端源码
│   ├── App.jsx            # 主应用组件
│   ├── main.jsx           # React 入口
│   ├── settings.jsx       # 设置页面
│   ├── history.jsx        # 历史记录页面
│   ├── components/        # UI 组件
│   ├── hooks/            # React Hooks
│   ├── helpers/          # 主进程辅助模块
│   └── utils/            # 工具函数
├── assets/               # 资源文件
├── scripts/             # 构建脚本
└── python/              # 嵌入式 Python 环境
```

## 核心功能模块
- **语音识别**: FunASR 本地模型处理
- **AI 优化**: 可配置的 AI 模型进行文本优化
- **快捷键支持**: 全局快捷键自定义
- **历史记录**: 转录历史管理
- **设置管理**: AI 模型配置和快捷键设置