@echo off
title 创建蛐蛐桌面快捷方式
cd /d "%~dp0"

echo.
echo ========================================
echo       创建蛐蛐桌面快捷方式
echo ========================================
echo.

echo [1/3] 检查环境...
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到 PowerShell
    pause
    exit /b 1
)

echo [2/3] 创建桌面快捷方式...
powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\蛐蛐.lnk'); $Shortcut.TargetPath = '%~dp0start_ququ_silent.vbs'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = '蛐蛐 - 智能语音转文字应用'; $Shortcut.IconLocation = '%~dp0assets\icon.ico'; $Shortcut.Save()}"

if %errorlevel% neq 0 (
    echo ❌ 创建快捷方式失败
    pause
    exit /b 1
)

echo [3/3] 完成！
echo.
echo ✅ 桌面快捷方式已创建！
echo 📁 位置：%USERPROFILE%\Desktop\蛐蛐.lnk
echo 🚀 现在你可以双击桌面上的"蛐蛐"图标来启动应用
echo.
pause
