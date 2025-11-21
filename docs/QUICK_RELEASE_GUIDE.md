# 🚀 快速发布指南

> 这是一份简化的发布指南，帮助你快速完成蛐蛐的公开发布。

## 📋 发布流程概览

```
准备 → 构建 → 测试 → 发布 → 宣传
 15分   30分   15分   15分   15分
```

总耗时：约 1.5 小时

---

## 第一步：准备发布（15分钟）

### 1.1 运行准备脚本

```bash
pnpm run release:prepare
```

这个脚本会自动：
- ✅ 检查必要文件是否存在
- ✅ 检查 Git 状态是否干净
- ✅ 检查版本标签是否可用
- ✅ 生成 Release Notes 模板

### 1.2 编辑 Release Notes

```bash
# 编辑生成的 Release Notes 文件
vi RELEASE_v1.0.0.md
```

**需要填写的内容：**
- 本次更新的主要功能
- Bug 修复列表
- 已知问题（如有）

### 1.3 提交代码

```bash
git add .
git commit -m "chore: prepare for v1.0.0 release"
git push origin main
```

---

## 第二步：构建安装包（30分钟）

### 方案 A：在单一平台构建（推荐新手）

如果你只有一台电脑，先在当前平台构建：

```bash
# 清理旧文件
pnpm run clean

# 根据你的系统执行对应命令
pnpm run build:win    # Windows
pnpm run build:mac    # macOS
pnpm run build:linux  # Linux
```

**输出位置**：`dist/` 目录

### 方案 B：多平台构建（完整发布）

如果你有多台电脑或使用 CI/CD：

1. **Windows 机器**：
   ```bash
   pnpm run build:win
   ```

2. **macOS 机器**：
   ```bash
   # Intel 版本
   pnpm run build:mac -- --x64
   
   # Apple Silicon 版本
   pnpm run build:mac -- --arm64
   
   # 或同时构建（Universal）
   pnpm run build:mac -- --universal
   ```

3. **Linux 机器**：
   ```bash
   pnpm run build:linux
   ```

### 构建完成后

检查 `dist/` 目录，应该有以下文件：

- Windows: `ququ-setup-1.0.0.exe`
- macOS: `ququ-1.0.0-mac-x64.dmg` 和/或 `ququ-1.0.0-mac-arm64.dmg`
- Linux: `ququ-1.0.0.AppImage`

---

## 第三步：测试安装包（15分钟）

### 3.1 基础测试

在每个平台上：

1. **安装测试**：
   - 双击安装包
   - 完成安装流程
   - 检查桌面图标是否创建

2. **启动测试**：
   - 启动应用
   - 等待模型下载（首次启动）
   - 检查主窗口是否正常显示

3. **功能测试**：
   - 测试录音功能（按 F2）
   - 测试语音识别
   - 测试 AI 优化（如已配置）
   - 测试历史记录
   - 测试设置保存

### 3.2 快速测试清单

- [ ] 安装成功
- [ ] 启动正常
- [ ] 录音功能正常
- [ ] 语音识别准确
- [ ] 文本自动粘贴
- [ ] 历史记录可查看
- [ ] 设置可保存

**如果测试失败**：修复问题后重新构建。

---

## 第四步：发布到 GitHub（15分钟）

### 4.1 创建 Git 标签

```bash
# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送标签
git push origin v1.0.0
```

### 4.2 创建 GitHub Release

1. 访问：https://github.com/yan5xu/ququ/releases/new

2. 填写信息：
   - **Tag**: 选择刚才创建的 `v1.0.0`
   - **Title**: `蛐蛐 v1.0.0`
   - **Description**: 复制 `RELEASE_v1.0.0.md` 的内容

3. 上传文件：
   - 将 `dist/` 目录中的所有安装包拖拽上传
   - 或点击"Attach binaries"上传

4. 发布：
   - 勾选 ✅ "Set as the latest release"
   - 点击 **"Publish release"**

### 4.3 更新下载链接

发布后，GitHub 会生成下载链接。复制这些链接并更新：

1. 编辑刚才发布的 Release
2. 将模板中的"(链接)"替换为实际的下载链接
3. 保存更新

---

## 第五步：宣传推广（15分钟）

### 5.1 更新项目主页

编辑 `README.md`：

```bash
# 更新版本号徽章
https://img.shields.io/badge/release-v1.0.0-brightgreen

# 更新下载链接
[下载 Windows 版本](https://github.com/yan5xu/ququ/releases/download/v1.0.0/ququ-setup-1.0.0.exe)
```

提交更新：

```bash
git add README.md
git commit -m "docs: update download links for v1.0.0"
git push origin main
```

### 5.2 社交媒体宣传

**微信交流群**：
```
🎉 蛐蛐 v1.0.0 正式发布！

主要更新：
✅ 窗口置顶按钮
✅ AI 提示优化
✅ 快速设置面板

下载地址：
https://github.com/yan5xu/ququ/releases/tag/v1.0.0

欢迎体验并反馈！
```

**其他平台**（可选）：
- V2EX
- 少数派
- Reddit (r/opensource)
- Hacker News
- Product Hunt

---

## 🎉 完成！

恭喜你完成了蛐蛐的公开发布！

### 发布后的工作

**第一周**：
- 每天检查 GitHub Issues
- 及时回复用户问题
- 收集用户反馈
- 记录常见问题

**持续维护**：
- 根据反馈优化功能
- 修复发现的 Bug
- 规划下一个版本

---

## 🆘 遇到问题？

### 构建失败

**问题**：构建过程中报错
**解决**：
```bash
# 清理环境
pnpm run clean
rm -rf node_modules dist

# 重新安装依赖
pnpm install

# 再次构建
pnpm run build:win  # 或其他平台
```

### 模型下载失败

**问题**：首次启动时模型下载失败
**解决**：
- 检查网络连接
- 确保能访问 modelscope.cn
- 手动运行：`python download_models.py`

### GitHub Release 上传失败

**问题**：文件太大无法上传
**解决**：
- 使用 GitHub CLI: `gh release upload v1.0.0 dist/*`
- 或使用 Git LFS
- 或托管在其他 CDN

---

## 📚 更多资源

- 📋 [完整发布检查清单](./RELEASE_CHECKLIST.md)
- 📖 [用户使用指南](./USER_GUIDE.md)
- 🔧 [开发者文档](../README.md)

---

**祝发布顺利！🚀**

