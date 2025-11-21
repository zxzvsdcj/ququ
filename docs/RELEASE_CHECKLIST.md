# 蛐蛐发布检查清单

> 📋 在发布新版本前，请按照此清单逐项检查

## 📝 发布前准备

### 代码与文档
- [ ] 所有功能已完成并测试通过
- [ ] 所有 linter 错误已修复
- [ ] README.md 已更新（版本号、功能描述）
- [ ] CHANGELOG.md 已更新
- [ ] 用户指南已更新（如有新功能）
- [ ] 代码已提交到 main 分支

### 版本号管理
- [ ] 更新 `package.json` 中的版本号
- [ ] 版本号遵循语义化版本规范（如 1.0.0, 1.1.0, 2.0.0）
- [ ] Git 标签已创建（如 `v1.0.0`）

### 测试
- [ ] Windows 平台测试通过
- [ ] macOS 平台测试通过（Intel 和 Apple Silicon）
- [ ] Linux 平台测试通过
- [ ] 首次安装流程测试通过
- [ ] 模型下载功能测试通过
- [ ] AI 优化功能测试通过
- [ ] 快捷键功能测试通过
- [ ] 历史记录功能测试通过

---

## 🔨 构建安装包

### 环境准备
```bash
# 确保依赖已安装
pnpm install

# 清理旧的构建文件
pnpm run clean
rm -rf dist
```

### Windows 构建
```bash
# 在 Windows 机器上执行
pnpm run build:win

# 检查输出文件
# dist/ququ-setup-x.x.x.exe
# dist/ququ-x.x.x-win.zip (便携版)
```

**检查项**：
- [ ] 安装包可以正常安装
- [ ] 安装后可以正常启动
- [ ] 卸载功能正常
- [ ] 快捷方式创建正常
- [ ] 文件关联正常（如有）

### macOS 构建
```bash
# 在 macOS 机器上执行

# Intel 版本
pnpm run build:mac -- --x64

# Apple Silicon 版本
pnpm run build:mac -- --arm64

# 或者同时构建两个版本
pnpm run build:mac -- --universal

# 检查输出文件
# dist/ququ-x.x.x-mac-x64.dmg
# dist/ququ-x.x.x-mac-arm64.dmg
```

**检查项**：
- [ ] DMG 文件可以正常打开
- [ ] 拖动安装正常
- [ ] 首次打开权限提示正常
- [ ] 代码签名正常（如已配置）
- [ ] 公证通过（如已配置）

### Linux 构建
```bash
# 在 Linux 机器上执行
pnpm run build:linux

# 检查输出文件
# dist/ququ-x.x.x.AppImage
# dist/ququ_x.x.x_amd64.deb (如配置了)
```

**检查项**：
- [ ] AppImage 有执行权限
- [ ] AppImage 可以正常运行
- [ ] DEB 包可以正常安装（如有）

---

## 📤 发布到 GitHub Releases

### 1. 创建 Release
```bash
# 创建并推送 Git 标签
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 2. 上传文件
在 GitHub Releases 页面：
- [ ] 创建新的 Release
- [ ] 选择刚才创建的标签（v1.0.0）
- [ ] 填写 Release 标题：`蛐蛐 v1.0.0`
- [ ] 复制 `docs/RELEASE_TEMPLATE.md` 内容到描述框
- [ ] 上传所有安装包文件：
  - [ ] Windows: `ququ-setup-x.x.x.exe`
  - [ ] Windows 便携版: `ququ-x.x.x-win.zip`
  - [ ] macOS Intel: `ququ-x.x.x-mac-x64.dmg`
  - [ ] macOS Apple Silicon: `ququ-x.x.x-mac-arm64.dmg`
  - [ ] Linux: `ququ-x.x.x.AppImage`
  - [ ] Linux DEB: `ququ_x.x.x_amd64.deb` (如有)

### 3. 填写 Release Notes
- [ ] 更新下载链接（指向实际的文件）
- [ ] 更新文件大小信息
- [ ] 更新 SHA256 校验和（可选但推荐）

### 4. 发布
- [ ] 勾选"Set as the latest release"
- [ ] 如果是测试版本，勾选"Set as a pre-release"
- [ ] 点击"Publish release"

---

## 📢 发布后宣传

### 更新项目主页
- [ ] 更新 README.md 中的版本号徽章
- [ ] 更新下载链接指向最新 Release
- [ ] 更新功能列表（如有新功能）

### 社交媒体宣传
- [ ] 在微信交流群发布更新通知
- [ ] 在 GitHub Discussions 发布公告
- [ ] 在相关技术社区分享（如 V2EX、少数派等）
- [ ] 更新项目介绍视频（如有）

### 文档更新
- [ ] 更新在线文档（如有）
- [ ] 更新 FAQ（根据用户反馈）
- [ ] 更新故障排除指南

---

## 🔍 发布后监控

### 第一周
- [ ] 每天检查 GitHub Issues，及时回复用户问题
- [ ] 监控下载量和 Star 数
- [ ] 收集用户反馈
- [ ] 记录常见问题，更新 FAQ

### 紧急修复
如果发现严重 Bug：
- [ ] 立即创建 hotfix 分支
- [ ] 修复问题并测试
- [ ] 发布补丁版本（如 1.0.1）
- [ ] 在 Release Notes 中说明修复内容

---

## 📊 发布统计

记录以下数据用于后续分析：
- [ ] 发布日期
- [ ] 各平台下载量
- [ ] 用户反馈数量
- [ ] Issue 数量
- [ ] Star 增长数
- [ ] Fork 数量

---

## ✅ 完成发布

当所有检查项都完成后：
- [ ] 在项目看板中标记"发布完成"
- [ ] 通知团队成员
- [ ] 开始规划下一个版本

**恭喜！🎉 新版本发布成功！**

