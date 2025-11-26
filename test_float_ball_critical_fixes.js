#!/usr/bin/env node
/**
 * 悬浮球关键问题修复验证脚本
 * 
 * 验证三个关键问题的修复：
 * 1. 托盘退出按钮正确退出程序（不只是隐藏悬浮球）
 * 2. 悬浮球支持设置中的自定义快捷键
 * 3. 悬浮球无背景文字（HTML title为空）
 */

const fs = require('fs');
const path = require('path');

// 测试结果统计
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileContent(filePath, description, checks) {
  log(`\n检查文件: ${filePath}`, 'cyan');
  
  if (!fs.existsSync(filePath)) {
    log(`  ✗ 文件不存在`, 'red');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let allPassed = true;

  checks.forEach(({ name, pattern, shouldExist = true, explanation }) => {
    totalTests++;
    const exists = pattern.test(content);
    const passed = exists === shouldExist;

    if (passed) {
      passedTests++;
      log(`  ✓ ${name}`, 'green');
    } else {
      failedTests++;
      allPassed = false;
      log(`  ✗ ${name}`, 'red');
      if (explanation) {
        log(`    说明: ${explanation}`, 'yellow');
      }
      if (shouldExist) {
        log(`    预期: 应该存在匹配模式`, 'yellow');
        log(`    实际: 未找到匹配`, 'yellow');
      } else {
        log(`    预期: 不应该存在匹配模式`, 'yellow');
        log(`    实际: 找到了匹配`, 'yellow');
      }
    }
  });

  return allPassed;
}

// ============================================================================
// 问题1：托盘退出按钮修复
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('问题1：托盘退出按钮正确退出程序', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('main.js', '主进程退出标志', [
  {
    name: '设置app.isQuitting标志',
    pattern: /app\.on\(\s*["']before-quit["']\s*,\s*\(\)\s*=>\s*\{[\s\S]*?app\.isQuitting\s*=\s*true/,
    explanation: '在before-quit事件中设置app.isQuitting标志'
  }
]);

checkFileContent('src/helpers/windowManager.js', '悬浮球窗口关闭逻辑', [
  {
    name: '检查app.isQuitting标志',
    pattern: /app\.isQuitting/,
    explanation: '在close事件中检查app.isQuitting'
  },
  {
    name: '条件性阻止关闭',
    pattern: /if\s*\(\s*!app\.isQuitting\s*\)\s*\{[\s\S]*?e\.preventDefault\(\)/,
    explanation: '只在非退出状态下阻止关闭'
  }
]);

// ============================================================================
// 问题2：悬浮球快捷键支持
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('问题2：悬浮球支持自定义快捷键', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('src/helpers/ipcHandlers.js', '热键事件分发', [
  {
    name: '发送到悬浮球窗口',
    pattern: /floatBallWindow[\s\S]*?webContents\.send\(\s*["']hotkey-triggered["']/,
    explanation: '热键触发时发送事件到悬浮球窗口'
  },
  {
    name: '检查悬浮球窗口存在',
    pattern: /if\s*\([\s\S]*?floatBallWindow[\s\S]*?![\s\S]*?isDestroyed\(\)/,
    explanation: '检查悬浮球窗口是否存在且未销毁'
  }
]);

checkFileContent('src/floatBall.jsx', '悬浮球快捷键监听', [
  {
    name: '注册自定义快捷键',
    pattern: /getSetting\(\s*['"]hotkey['"]/,
    explanation: '从设置中读取自定义快捷键'
  },
  {
    name: '监听hotkey-triggered事件',
    pattern: /onHotkeyTriggered/,
    explanation: '监听自定义快捷键触发事件'
  },
  {
    name: '切换录音状态',
    pattern: /handleHotkeyTriggered[\s\S]*?if\s*\(\s*isRecording\s*\)/,
    explanation: '快捷键触发时切换录音状态'
  }
]);

// ============================================================================
// 问题3：悬浮球背景文字
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('问题3：悬浮球无背景文字', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('src/floatBall.html', 'HTML标题', [
  {
    name: 'title标签为空',
    pattern: /<title>\s*<\/title>/,
    explanation: 'HTML的title标签应该为空'
  },
  {
    name: '无"蛐蛐"文字',
    pattern: /<title>.*蛐蛐.*<\/title>/,
    shouldExist: false,
    explanation: 'title标签中不应包含"蛐蛐"文字'
  }
]);

checkFileContent('src/helpers/windowManager.js', '窗口标题配置', [
  {
    name: '窗口title为空字符串',
    pattern: /title:\s*['"]['"],/,
    explanation: 'BrowserWindow配置中title应为空字符串'
  },
  {
    name: '隐藏标题栏',
    pattern: /titleBarStyle:\s*['"]customButtonsOnHover['"]/,
    explanation: '使用customButtonsOnHover隐藏标题栏'
  }
]);

// ============================================================================
// 测试总结
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('测试总结', 'blue');
log('='.repeat(80), 'blue');

const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

log(`\n总测试数: ${totalTests}`, 'cyan');
log(`通过: ${passedTests}`, 'green');
log(`失败: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
log(`成功率: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

if (failedTests === 0) {
  log('\n✓ 所有测试通过！悬浮球关键问题已全部修复。', 'green');
  log('\n建议手动验证：', 'cyan');
  log('1. 运行 pnpm run dev', 'yellow');
  log('2. 切换到悬浮球模式', 'yellow');
  log('3. 验证悬浮球无背景文字', 'yellow');
  log('4. 在设置中修改快捷键（如F3）', 'yellow');
  log('5. 按F3测试录音功能', 'yellow');
  log('6. 右键托盘图标，选择"退出"', 'yellow');
  log('7. 验证程序完全退出（不只是隐藏）', 'yellow');
  process.exit(0);
} else {
  log('\n✗ 部分测试失败，请检查上述问题。', 'red');
  process.exit(1);
}

