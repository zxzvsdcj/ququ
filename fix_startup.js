/**
 * 蛐蛐启动修复脚本
 * 手动启动 Python FunASR 服务
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 蛐蛐启动修复脚本\n');

// 查找 Python 可执行文件
function findPython() {
  const candidates = [
    path.join(__dirname, '.venv', 'Scripts', 'python.exe'),
    path.join(__dirname, '.venv', 'bin', 'python'),
    'python',
    'python3'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log('✅ 找到 Python:', candidate);
      return candidate;
    }
  }

  console.error('❌ 未找到 Python 可执行文件');
  process.exit(1);
}

// 启动 FunASR 服务
function startFunASR() {
  const pythonCmd = findPython();
  const serverPath = path.join(__dirname, 'funasr_server.py');

  if (!fs.existsSync(serverPath)) {
    console.error('❌ 未找到 funasr_server.py');
    process.exit(1);
  }

  console.log('🚀 启动 FunASR 服务...');
  console.log('   Python:', pythonCmd);
  console.log('   脚本:', serverPath);
  console.log('');

  const funasrProcess = spawn(pythonCmd, [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      ELECTRON_USER_DATA: path.join(process.env.APPDATA || process.env.HOME, 'ququ')
    }
  });

  funasrProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log('[FunASR]', output);
      
      // 检测模型加载完成
      if (output.includes('ready') || output.includes('就绪')) {
        console.log('\n🎉 FunASR 服务已就绪！');
        console.log('📝 现在可以启动蛐蛐应用了');
        console.log('');
        console.log('请在另一个终端运行:');
        console.log('   cd E:\\cursor\\ququ');
        console.log('   pnpm run dev');
      }
    }
  });

  funasrProcess.stderr.on('data', (data) => {
    console.error('[FunASR ERROR]', data.toString().trim());
  });

  funasrProcess.on('error', (error) => {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  });

  funasrProcess.on('exit', (code) => {
    console.log(`\n⚠️  FunASR 服务已退出 (代码: ${code})`);
    process.exit(code);
  });

  // 保持进程运行
  console.log('⏳ 正在加载模型，请耐心等待...');
  console.log('   (首次启动需要 1-2 分钟)\n');
}

// 主函数
try {
  startFunASR();
} catch (error) {
  console.error('❌ 错误:', error.message);
  process.exit(1);
}

// 捕获退出信号
process.on('SIGINT', () => {
  console.log('\n\n👋 正在关闭...');
  process.exit(0);
});

