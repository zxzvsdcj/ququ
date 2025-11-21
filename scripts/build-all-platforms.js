#!/usr/bin/env node

/**
 * 多平台构建脚本
 * 用于自动化构建所有平台的安装包
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} 完成`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} 失败`, 'red');
    console.error(error.message);
    return false;
  }
}

function checkPlatform() {
  const platform = os.platform();
  log(`\n检测到当前平台: ${platform}`, 'blue');
  return platform;
}

function getPackageVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );
  return packageJson.version;
}

function cleanDist() {
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    log('\n清理旧的构建文件...', 'yellow');
    fs.rmSync(distPath, { recursive: true, force: true });
    log('✓ 清理完成', 'green');
  }
}

function listBuiltFiles() {
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    log('\n没有找到构建文件', 'yellow');
    return;
  }

  log('\n📦 构建完成的文件:', 'bright');
  const files = fs.readdirSync(distPath);
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      log(`  - ${file} (${sizeMB} MB)`, 'cyan');
    }
  });
}

async function main() {
  log('\n╔═══════════════════════════════════════════╗', 'bright');
  log('║     蛐蛐 (QuQu) 多平台构建工具           ║', 'bright');
  log('╚═══════════════════════════════════════════╝', 'bright');

  const version = getPackageVersion();
  log(`\n当前版本: v${version}`, 'green');

  const platform = checkPlatform();
  
  // 询问用户要构建哪些平台
  log('\n请选择要构建的平台:', 'yellow');
  log('  1. 仅当前平台', 'cyan');
  log('  2. Windows', 'cyan');
  log('  3. macOS (需要 macOS 系统)', 'cyan');
  log('  4. Linux', 'cyan');
  log('  5. 全部平台 (需要对应系统)', 'cyan');

  // 由于这是自动化脚本，我们根据当前平台自动选择
  let buildCommands = [];
  
  switch (platform) {
    case 'win32':
      log('\n将构建 Windows 平台...', 'blue');
      buildCommands = [
        { cmd: 'pnpm run build:win', desc: '构建 Windows 安装包' }
      ];
      break;
    case 'darwin':
      log('\n将构建 macOS 平台...', 'blue');
      buildCommands = [
        { cmd: 'pnpm run build:mac', desc: '构建 macOS 安装包' }
      ];
      break;
    case 'linux':
      log('\n将构建 Linux 平台...', 'blue');
      buildCommands = [
        { cmd: 'pnpm run build:linux', desc: '构建 Linux 安装包' }
      ];
      break;
    default:
      log(`\n不支持的平台: ${platform}`, 'red');
      process.exit(1);
  }

  // 清理旧文件
  cleanDist();

  // 执行构建
  log('\n开始构建流程...', 'bright');
  let allSuccess = true;

  for (const { cmd, desc } of buildCommands) {
    const success = execCommand(cmd, desc);
    if (!success) {
      allSuccess = false;
      break;
    }
  }

  // 显示构建结果
  if (allSuccess) {
    log('\n╔═══════════════════════════════════════════╗', 'green');
    log('║          ✓ 构建全部成功！                ║', 'green');
    log('╚═══════════════════════════════════════════╝', 'green');
    
    listBuiltFiles();
    
    log('\n下一步:', 'yellow');
    log('  1. 测试安装包是否正常工作', 'cyan');
    log('  2. 创建 Git 标签: git tag -a v' + version + ' -m "Release v' + version + '"', 'cyan');
    log('  3. 推送标签: git push origin v' + version, 'cyan');
    log('  4. 在 GitHub 创建 Release 并上传文件', 'cyan');
    log('\n详细发布流程请查看: docs/RELEASE_CHECKLIST.md', 'blue');
  } else {
    log('\n╔═══════════════════════════════════════════╗', 'red');
    log('║          ✗ 构建失败！                    ║', 'red');
    log('╚═══════════════════════════════════════════╝', 'red');
    log('\n请检查错误信息并修复后重试', 'yellow');
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  log('\n发生错误:', 'red');
  console.error(error);
  process.exit(1);
});

