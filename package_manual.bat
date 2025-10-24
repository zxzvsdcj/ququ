@echo off
echo 手动打包蛐蛐应用...

REM 创建打包目录
if not exist "dist\package" mkdir "dist\package"

REM 复制必要文件
echo 复制应用文件...
copy "main.js" "dist\package\"
copy "preload.js" "dist\package\"
copy "package.json" "dist\package\"
copy "funasr_server.py" "dist\package\"
copy "download_models.py" "dist\package\"

REM 复制构建后的前端文件
if exist "src\dist" (
    echo 复制前端文件...
    xcopy "src\dist\*" "dist\package\" /E /I /Y
)

REM 复制源码目录（用于 Python 脚本）
echo 复制源码目录...
if not exist "dist\package\src" mkdir "dist\package\src"
xcopy "src\helpers" "dist\package\src\helpers\" /E /I /Y
xcopy "src\utils" "dist\package\src\utils\" /E /I /Y

REM 复制资源文件
echo 复制资源文件...
if not exist "dist\package\assets" mkdir "dist\package\assets"
copy "assets\*" "dist\package\assets\"

REM 复制 Python 环境（如果存在）
if exist "python" (
    echo 复制 Python 环境...
    xcopy "python" "dist\package\python\" /E /I /Y
)

REM 复制 node_modules（核心依赖）
echo 复制核心依赖...
if not exist "dist\package\node_modules" mkdir "dist\package\node_modules"
xcopy "node_modules\electron" "dist\package\node_modules\electron\" /E /I /Y
xcopy "node_modules\better-sqlite3" "dist\package\node_modules\better-sqlite3\" /E /I /Y

REM 创建启动脚本
echo 创建启动脚本...
echo @echo off > "dist\package\start_ququ.bat"
echo echo 启动蛐蛐应用... >> "dist\package\start_ququ.bat"
echo node main.js >> "dist\package\start_ququ.bat"
echo pause >> "dist\package\start_ququ.bat"

REM 创建说明文件
echo 创建说明文件...
echo 蛐蛐 (QuQu) - 中文语音转文字应用 > "dist\package\README.txt"
echo. >> "dist\package\README.txt"
echo 使用方法： >> "dist\package\README.txt"
echo 1. 双击 start_ququ.bat 启动应用 >> "dist\package\README.txt"
echo 2. 首次使用需要下载 AI 模型文件 >> "dist\package\README.txt"
echo 3. 在设置中配置 AI API Key 以启用文本优化功能 >> "dist\package\README.txt"
echo. >> "dist\package\README.txt"
echo 功能特性： >> "dist\package\README.txt"
echo - 高精度中文语音识别 >> "dist\package\README.txt"
echo - AI 智能文本优化 >> "dist\package\README.txt"
echo - 自定义快捷键支持 >> "dist\package\README.txt"
echo - 完全中文化界面 >> "dist\package\README.txt"

echo.
echo ✅ 打包完成！
echo 📁 打包文件位置：dist\package\
echo 🚀 运行方式：双击 dist\package\start_ququ.bat
echo.
pause
