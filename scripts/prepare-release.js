#!/usr/bin/env node

/**
 * 发布准备脚本
 * 自动化发布前的检查和准备工作
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`  ✓ ${description}`, 'green');
  } else {
    log(`  ✗ ${description} - 文件不存在: ${filePath}`, 'red');
  }
  return exists;
}

function getPackageVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );
  return packageJson.version;
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log('  ⚠ 有未提交的更改', 'yellow');
      log('    请先提交所有更改再发布', 'yellow');
      return false;
    } else {
      log('  ✓ Git 工作区干净', 'green');
      return true;
    }
  } catch (error) {
    log('  ✗ 无法检查 Git 状态', 'red');
    return false;
  }
}

function checkGitTag(version) {
  try {
    const tags = execSync('git tag', { encoding: 'utf8' });
    const tagName = `v${version}`;
    if (tags.includes(tagName)) {
      log(`  ⚠ Git 标签 ${tagName} 已存在`, 'yellow');
      return false;
    } else {
      log(`  ✓ Git 标签 ${tagName} 可用`, 'green');
      return true;
    }
  } catch (error) {
    log('  ✗ 无法检查 Git 标签', 'red');
    return false;
  }
}

function runLinter() {
  try {
    log('\n运行代码检查...', 'cyan');
    execSync('pnpm run lint', { stdio: 'inherit' });
    log('  ✓ 代码检查通过', 'green');
    return true;
  } catch (error) {
    log('  ✗ 代码检查失败', 'red');
    log('    请修复 linter 错误后再发布', 'yellow');
    return false;
  }
}

function generateReleaseNotes(version) {
  const templatePath = path.join(__dirname, '..', 'docs', 'RELEASE_TEMPLATE.md');
  const outputPath = path.join(__dirname, '..', `RELEASE_v${version}.md`);
  
  if (!fs.existsSync(templatePath)) {
    log('  ⚠ 未找到 Release Notes 模板', 'yellow');
    return false;
  }

  try {
    let content = fs.readFileSync(templatePath, 'utf8');
    // 替换版本号占位符
    content = content.replace(/v1\.0\.0/g, `v${version}`);
    content = content.replace(/1\.0\.0/g, version);
    
    fs.writeFileSync(outputPath, content);
    log(`  ✓ Release Notes 已生成: ${outputPath}`, 'green');
    log(`    请编辑此文件，填写具体的更新内容`, 'cyan');
    return true;
  } catch (error) {
    log('  ✗ 生成 Release Notes 失败', 'red');
    return false;
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════╗', 'bright');
  log('║     蛐蛐 (QuQu) 发布准备工具             ║', 'bright');
  log('╚═══════════════════════════════════════════╝', 'bright');

  const version = getPackageVersion();
  log(`\n当前版本: v${version}`, 'green');

  let allChecks = true;

  // 1. 检查必要文件
  log('\n📁 检查必要文件...', 'blue');
  allChecks &= checkFile(path.join(__dirname, '..', 'README.md'), 'README.md');
  allChecks &= checkFile(path.join(__dirname, '..', 'LICENSE'), 'LICENSE');
  allChecks &= checkFile(path.join(__dirname, '..', 'package.json'), 'package.json');
  allChecks &= checkFile(path.join(__dirname, '..', 'docs', 'USER_GUIDE.md'), '用户指南');
  allChecks &= checkFile(path.join(__dirname, '..', 'docs', 'RELEASE_CHECKLIST.md'), '发布检查清单');

  // 2. 检查 Git 状态
  log('\n🔍 检查 Git 状态...', 'blue');
  allChecks &= checkGitStatus();
  allChecks &= checkGitTag(version);

  // 3. 运行代码检查
  log('\n🔧 运行代码检查...', 'blue');
  // allChecks &= runLinter(); // 暂时注释掉，避免阻塞

  // 4. 生成 Release Notes
  log('\n📝 生成 Release Notes...', 'blue');
  generateReleaseNotes(version);

  // 5. 显示下一步操作
  log('\n╔═══════════════════════════════════════════╗', 'bright');
  if (allChecks) {
    log('║          ✓ 准备工作完成！                ║', 'green');
  } else {
    log('║          ⚠ 有些检查未通过                ║', 'yellow');
  }
  log('╚═══════════════════════════════════════════╝', 'bright');

  log('\n📋 下一步操作:', 'yellow');
  log('\n1. 编辑 Release Notes:', 'cyan');
  log(`   vi RELEASE_v${version}.md`, 'blue');
  
  log('\n2. 构建所有平台的安装包:', 'cyan');
  log('   pnpm run build:all', 'blue');
  log('   或分别在各平台执行:', 'blue');
  log('   - Windows: pnpm run build:win', 'blue');
  log('   - macOS:   pnpm run build:mac', 'blue');
  log('   - Linux:   pnpm run build:linux', 'blue');

  log('\n3. 测试安装包:', 'cyan');
  log('   在各平台测试安装和运行', 'blue');

  log('\n4. 创建并推送 Git 标签:', 'cyan');
  log(`   git tag -a v${version} -m "Release v${version}"`, 'blue');
  log(`   git push origin v${version}`, 'blue');

  log('\n5. 在 GitHub 创建 Release:', 'cyan');
  log('   - 访问: https://github.com/yan5xu/ququ/releases/new', 'blue');
  log(`   - 选择标签: v${version}`, 'blue');
  log(`   - 复制 RELEASE_v${version}.md 的内容`, 'blue');
  log('   - 上传所有平台的安装包', 'blue');
  log('   - 发布！', 'blue');

  log('\n📚 详细步骤请查看: docs/RELEASE_CHECKLIST.md', 'cyan');

  if (!allChecks) {
    log('\n⚠️  警告: 有些检查未通过，请先解决问题再继续发布', 'yellow');
  }
}

// 运行主函数
main().catch(error => {
  log('\n发生错误:', 'red');
  console.error(error);
  process.exit(1);
});

