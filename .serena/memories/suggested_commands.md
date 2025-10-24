# 蛐蛐项目开发命令指南

## 开发环境设置

### 环境要求
- Node.js 18+
- pnpm 包管理器
- Python 3.8+ (推荐使用 uv 管理)

### 初始化项目
```bash
# 克隆项目
git clone https://github.com/yan5xu/ququ.git
cd ququ

# 安装 Node.js 依赖
pnpm install

# 方案1: 使用 uv (推荐)
uv sync
uv run python download_models.py

# 方案2: 使用系统 Python
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install funasr modelscope torch torchaudio librosa numpy
python download_models.py
```

## 开发命令

### 启动开发服务器
```bash
# 启动完整开发环境 (前端 + 主进程)
pnpm run dev

# 仅启动前端开发服务器
pnpm run dev:renderer

# 仅启动主进程
pnpm run dev:main
```

### 构建命令
```bash
# 构建前端
pnpm run build:renderer

# 构建完整应用 (Windows)
pnpm run build:win

# 构建完整应用 (macOS)
pnpm run build:mac

# 构建完整应用 (Linux)
pnpm run build:linux
```

### Python 环境管理
```bash
# 准备嵌入式 Python 环境
pnpm run prepare:python:embedded

# 测试 Python 环境
pnpm run test:python

# 查看 Python 环境信息
pnpm run prepare:python:info
```

### 代码质量
```bash
# 代码检查
pnpm run lint

# 预览构建结果
pnpm run preview
```

### 清理命令
```bash
# 清理构建文件和 Python 环境
pnpm run clean
```

## Windows 系统命令

### 文件操作
```cmd
# 列出文件
dir
dir /s  # 递归列出

# 复制文件
copy source dest
xcopy source dest /E /I /Y  # 递归复制

# 删除文件
del filename
rmdir /s /q directory  # 递归删除目录

# 查找文件
where filename
dir /s filename
```

### 进程管理
```cmd
# 查看进程
tasklist
tasklist | findstr "node"

# 结束进程
taskkill /PID process_id
taskkill /IM process_name /F
```

### 网络相关
```cmd
# 检查端口占用
netstat -ano | findstr :5173

# 检查网络连接
ping github.com
```

## Git 命令
```bash
# 查看状态
git status

# 添加文件
git add .
git add filename

# 提交更改
git commit -m "feat: 添加新功能"

# 推送更改
git push origin branch_name

# 查看日志
git log --oneline
```

## 调试命令

### 检查依赖
```bash
# 检查 Node.js 版本
node --version

# 检查 pnpm 版本
pnpm --version

# 检查 Python 版本
python --version
uv --version
```

### 检查端口占用
```cmd
# Windows
netstat -ano | findstr :5173

# 结束占用端口的进程
taskkill /PID process_id /F
```

### 查看日志
```bash
# 查看应用日志 (如果配置了日志文件)
type logs\latest.log
```