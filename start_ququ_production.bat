@echo off
title 蛐蛐启动器
cd /d "%~dp0"

echo.
echo ========================================
echo           蛐蛐 (QuQu) 启动器
echo ========================================
echo.

echo [1/3] 检查环境...
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到 pnpm，请先安装 Node.js 和 pnpm
    pause
    exit /b 1
)

echo [2/3] 构建前端...
call pnpm run build:renderer
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)

echo [3/3] 启动应用...
echo ✅ 启动中，请稍候...
start "" "%~dp0start_ququ_silent.vbs"

echo.
echo 🎉 蛐蛐已启动！请查看系统托盘或桌面窗口。
echo.
pause
