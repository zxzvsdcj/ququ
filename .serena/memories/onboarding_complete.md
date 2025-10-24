# 蛐蛐项目 Onboarding 完成

## 项目信息收集完成

### 项目概览
- **项目名称**: 蛐蛐 (QuQu)
- **项目类型**: 开源免费的 Wispr Flow 替代方案
- **主要功能**: 基于 FunASR 的本地语音识别 + AI 文本优化
- **技术栈**: React 19 + Electron + Python + FunASR

### 技术架构
- **前端**: React 19, TypeScript, Tailwind CSS, shadcn/ui, Vite
- **桌面端**: Electron
- **语音技术**: FunASR (阿里巴巴开源)
- **AI模型**: 支持 OpenAI API 兼容的各种模型
- **数据库**: better-sqlite3

### 开发环境
- **Node.js**: 18+
- **包管理器**: pnpm
- **Python**: 3.8+ (支持 uv、系统 Python、嵌入式 Python)
- **平台**: macOS, Windows, Linux

### 项目结构
```
ququ/
├── main.js                 # Electron 主进程
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

### 核心功能模块
1. **语音识别**: FunASR 本地模型处理
2. **AI 优化**: 可配置的 AI 模型进行文本优化
3. **快捷键支持**: 全局快捷键自定义
4. **历史记录**: 转录历史管理
5. **设置管理**: AI 模型配置和快捷键设置

### 开发命令
- **启动开发**: `pnpm run dev`
- **构建前端**: `pnpm run build:renderer`
- **构建应用**: `pnpm run build:win/mac/linux`
- **代码检查**: `pnpm run lint`
- **清理**: `pnpm run clean`

### 已知问题
- **代码质量问题**: 337个 ESLint 错误需要修复
- **React Hooks 规则**: 在条件语句中调用 Hooks
- **环境变量问题**: 在浏览器代码中使用 Node.js 变量
- **未使用的导入**: 大量未使用的导入和变量

### 下一步建议
1. 修复代码质量问题
2. 完善 ESLint 配置
3. 优化代码结构
4. 添加测试覆盖

## Onboarding 状态: ✅ 完成