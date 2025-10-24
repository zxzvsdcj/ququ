@echo off
title 蛐蛐启动器
cd /d "%~dp0"

:: 隐藏命令行窗口
if not "%1"=="hidden" (
    start /min "" "%~f0" hidden
    exit /b
)

:: 检查环境
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未找到 pnpm
    pause
    exit /b 1
)

:: 启动应用
echo 正在启动蛐蛐...
pnpm run dev >nul 2>&1
