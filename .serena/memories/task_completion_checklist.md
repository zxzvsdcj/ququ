# 任务完成检查清单

## 开发任务完成后的检查步骤

### 1. 代码质量检查
```bash
# 运行代码检查
pnpm run lint

# 检查是否有 TypeScript 错误
npx tsc --noEmit
```

### 2. 功能测试
```bash
# 启动开发服务器
pnpm run dev

# 测试主要功能
# - 语音识别是否正常
# - AI 优化是否工作
# - 快捷键是否响应
# - 设置页面是否正常
```

### 3. 构建测试
```bash
# 构建前端
pnpm run build:renderer

# 测试构建结果
pnpm run preview
```

### 4. Python 环境测试
```bash
# 测试 Python 环境
pnpm run test:python

# 检查模型文件
uv run python -c "import funasr; print('FunASR 可用')"
```

### 5. Git 提交前检查
```bash
# 检查文件状态
git status

# 添加更改
git add .

# 提交更改 (使用规范格式)
git commit -m "feat: 添加新功能"
# 或
git commit -m "fix: 修复问题"
# 或  
git commit -m "docs: 更新文档"
```

## 提交信息规范

### 提交类型
- **feat**: 新功能
- **fix**: 修复问题
- **docs**: 文档更新
- **style**: 代码格式调整
- **refactor**: 代码重构
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动

### 提交格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 示例
```
feat(hotkey): 添加快捷键自定义功能

- 新增快捷键设置界面
- 支持 F1-F12 和组合键
- 添加独立保存按钮

Closes #123
```

## 部署前检查

### 1. 环境检查
- [ ] Node.js 版本 >= 18
- [ ] pnpm 已安装
- [ ] Python 环境正常
- [ ] 网络连接正常

### 2. 功能检查
- [ ] 应用能正常启动
- [ ] 语音识别功能正常
- [ ] AI 优化功能正常
- [ ] 快捷键功能正常
- [ ] 设置页面正常
- [ ] 历史记录功能正常

### 3. 构建检查
- [ ] 前端构建成功
- [ ] 主进程启动正常
- [ ] Python 服务启动正常
- [ ] 模型文件完整

### 4. 打包检查
- [ ] 手动打包脚本运行成功
- [ ] 打包文件完整
- [ ] 启动脚本正常
- [ ] 说明文档完整

## 问题排查

### 常见问题
1. **端口占用**: 检查 5173 端口是否被占用
2. **Python 环境**: 确保 Python 和依赖正确安装
3. **模型文件**: 确保 FunASR 模型已下载
4. **权限问题**: 确保有足够的文件系统权限

### 调试命令
```bash
# 检查端口占用
netstat -ano | findstr :5173

# 检查进程
tasklist | findstr "node"

# 查看日志
type logs\latest.log
```

### 清理和重置
```bash
# 清理构建文件
pnpm run clean

# 重新安装依赖
rm -rf node_modules
pnpm install

# 重新下载模型
uv run python download_models.py
```