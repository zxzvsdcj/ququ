# 蛐蛐 v1.0.0 发布说明

> 🎉 **蛐蛐 (QuQu) 正式版发布！** - 开源免费的 Wispr Flow 替代方案

## 📦 下载地址

### Windows
- **安装包**: [ququ-setup-1.0.0.exe](链接) - 推荐
- **便携版**: [ququ-1.0.0-win.zip](链接)
- 系统要求：Windows 10 或更高版本

### macOS
- **Intel 芯片**: [ququ-1.0.0-mac-x64.dmg](链接)
- **Apple Silicon (M1/M2/M3)**: [ququ-1.0.0-mac-arm64.dmg](链接)
- 系统要求：macOS 10.15 或更高版本

### Linux
- **AppImage**: [ququ-1.0.0.AppImage](链接) - 通用格式
- **Debian/Ubuntu**: [ququ_1.0.0_amd64.deb](链接)
- 系统要求：主流 Linux 发行版

---

## ✨ 主要特性

### 🎯 核心功能
- ✅ **本地语音识别**：基于 FunASR Paraformer 模型，高精度中文识别
- ✅ **AI 文本优化**：支持通义千问、Kimi、DeepSeek 等国产 AI 模型
- ✅ **全局快捷键**：F2 快速启动录音，随时随地使用
- ✅ **自动粘贴**：识别完成自动粘贴到光标位置
- ✅ **历史记录**：所有转录内容自动保存，支持搜索和导出

### 🆕 v1.0.0 新增功能
- ✅ **窗口置顶按钮**：可自由控制主窗口是否置顶
- ✅ **智能提示优化**：AI 关闭时不再显示"AI 优化失败"提示
- ✅ **快速设置面板**：一键切换 AI 优化开关
- ✅ **模型自动下载**：首次启动自动下载语音识别模型
- ✅ **状态指示器**：实时显示模型下载和初始化进度

### 🔒 隐私保护
- ✅ 语音数据本地处理，不上传云端
- ✅ AI 优化可选，完全由用户控制
- ✅ 所有数据存储在本地数据库

---

## 🚀 快速开始

### 1. 下载并安装
根据你的操作系统，下载对应的安装包并按照向导完成安装。

### 2. 首次启动
首次启动时会自动下载语音识别模型（约 500MB），请保持网络连接并耐心等待。

### 3. 配置 AI（可选）
如果需要使用 AI 文本优化功能：
1. 点击设置按钮
2. 填写 AI API Key 和 Base URL
3. 推荐使用国内 AI 服务商（通义千问、Kimi、DeepSeek）

### 4. 开始使用
- 按 `F2` 启动录音
- 说话
- 再按 `F2` 停止
- 文本自动粘贴！

详细使用说明请查看 [用户指南](https://github.com/yan5xu/ququ/blob/main/docs/USER_GUIDE.md)

---

## 🔧 技术细节

### 系统要求
- **Windows**: Windows 10 或更高版本
- **macOS**: macOS 10.15 (Catalina) 或更高版本
- **Linux**: 主流发行版（Ubuntu 20.04+, Fedora 35+, Debian 11+ 等）
- **内存**: 建议 4GB 或以上
- **磁盘空间**: 至少 2GB 可用空间（用于模型和数据）

### 技术栈
- **前端**: React 19, TypeScript, Tailwind CSS, Vite
- **桌面端**: Electron 36
- **语音识别**: FunASR (Paraformer-large, FSMN-VAD, CT-Transformer)
- **数据库**: better-sqlite3
- **AI 模型**: 兼容 OpenAI API 的所有服务

### 安装包大小
- Windows 安装包: ~150MB
- macOS DMG: ~160MB
- Linux AppImage: ~155MB

---

## 📝 完整更新日志

### 新增功能
- [新增] 主窗口置顶按钮，支持一键切换置顶状态
- [新增] 快速设置面板，方便快速切换常用选项
- [新增] 模型下载进度指示器
- [新增] 启动画面优化，显示初始化进度
- [新增] 历史记录搜索功能

### 功能改进
- [改进] AI 优化提示逻辑，关闭 AI 时不再显示失败提示
- [改进] 窗口默认不置顶，避免遮挡其他应用
- [改进] 模型下载失败时的错误提示更友好
- [改进] 设置页面 UI 优化，更清晰的布局
- [改进] 数据库性能优化，历史记录加载更快

### Bug 修复
- [修复] 某些情况下 AI 优化失败但仍显示成功提示的问题
- [修复] 快捷键在某些应用中不生效的问题
- [修复] macOS 上首次启动权限提示不明确的问题
- [修复] Windows 上路径包含中文时的兼容性问题
- [修复] 历史记录窗口在某些分辨率下显示异常的问题

---

## 🐛 已知问题

### Windows
- 在某些杀毒软件下可能会被误报，请添加信任
- 首次运行可能需要管理员权限

### macOS
- 首次打开需要在"安全性与隐私"中允许
- Apple Silicon 版本需要 macOS 11.0 或更高版本

### Linux
- AppImage 需要手动添加执行权限
- 某些桌面环境下全局快捷键可能不生效

如遇到问题，请查看 [故障排除指南](https://github.com/yan5xu/ququ/blob/main/docs/USER_GUIDE.md#%F0%9F%94%A7-%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98) 或提交 [Issue](https://github.com/yan5xu/ququ/issues)

---

## 🙏 致谢

感谢所有为蛐蛐项目做出贡献的开发者和用户！

特别感谢：
- [FunASR](https://github.com/modelscope/FunASR) 提供优秀的语音识别引擎
- [OpenWhispr](https://github.com/HeroTools/open-whispr) 提供架构参考
- 所有提交 Issue 和 PR 的贡献者

---

## 📄 许可证

本项目采用 [Apache License 2.0](https://github.com/yan5xu/ququ/blob/main/LICENSE) 许可证。

---

## 💬 加入社区

- 📖 [项目主页](https://github.com/yan5xu/ququ)
- 📚 [用户指南](https://github.com/yan5xu/ququ/blob/main/docs/USER_GUIDE.md)
- 🐛 [问题反馈](https://github.com/yan5xu/ququ/issues)
- 💬 微信交流群（见 README）

**祝你使用愉快！🎉**

