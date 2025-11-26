#!/usr/bin/env node
/**
 * 悬浮球最终修复验证脚本 V2
 * 
 * 验证两个问题的修复：
 * 1. 移除悬浮球上方的白色组件（Windows标题栏问题）
 * 2. 快捷键无法切换录音状态（闭包问题）
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
    }
  });

  return allPassed;
}

// ============================================================================
// 问题1：移除白色组件（Windows标题栏）
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('问题1：移除悬浮球上方的白色组件', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('src/helpers/windowManager.js', '悬浮球窗口配置', [
  {
    name: 'Windows特定：thickFrame设置为false',
    pattern: /thickFrame:\s*false/,
    explanation: 'Windows上使用thickFrame: false移除边框'
  },
  {
    name: '初始隐藏窗口',
    pattern: /show:\s*false.*先隐藏/s,
    explanation: '先隐藏窗口，等加载完成后再显示'
  },
  {
    name: 'macOS特定配置判断',
    pattern: /if\s*\(\s*process\.platform\s*===\s*['"]darwin['"]\s*\)/,
    explanation: 'macOS使用titleBarStyle配置'
  },
  {
    name: 'Windows特定配置判断',
    pattern: /if\s*\(\s*process\.platform\s*===\s*['"]win32['"]\s*\)/,
    explanation: 'Windows使用setSkipTaskbar'
  },
  {
    name: 'ready-to-show事件处理',
    pattern: /floatBallWindow\.once\(\s*['"]ready-to-show['"]/,
    explanation: '加载完成后显示窗口'
  },
  {
    name: '延迟显示备用方案',
    pattern: /setTimeout\(\s*\(\)\s*=>\s*\{[\s\S]*?isVisible\(\)/,
    explanation: '如果ready-to-show没触发，延迟显示'
  }
]);

// ============================================================================
// 问题2：快捷键切换录音状态
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('问题2：快捷键切换录音状态（闭包问题修复）', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('src/floatBall.jsx', '悬浮球快捷键处理', [
  {
    name: '导入useRef',
    pattern: /import\s+React,\s*\{[^}]*useRef[^}]*\}/,
    explanation: '需要useRef来存储最新状态'
  },
  {
    name: '创建stateRef',
    pattern: /const\s+stateRef\s*=\s*useRef\(\s*\{/,
    explanation: '使用ref存储最新状态'
  },
  {
    name: '更新stateRef的useEffect',
    pattern: /stateRef\.current\s*=\s*\{[^}]*isRecording/,
    explanation: '每次状态变化时更新ref'
  },
  {
    name: 'handleHotkeyTriggered使用stateRef',
    pattern: /handleHotkeyTriggered[\s\S]*?const\s*\{[^}]*isRecording[^}]*\}\s*=\s*stateRef\.current/,
    explanation: '从ref获取最新状态，避免闭包问题'
  },
  {
    name: 'handleF2DoubleClick使用stateRef',
    pattern: /handleF2DoubleClick[\s\S]*?const\s*\{[^}]*isRecording[^}]*\}\s*=\s*stateRef\.current/,
    explanation: '从ref获取最新状态'
  },
  {
    name: '添加详细日志',
    pattern: /console\.log\([^)]*当前状态[^)]*isRecording/,
    explanation: '添加日志便于调试'
  },
  {
    name: 'useEffect依赖只包含函数',
    pattern: /\[\s*startRecording\s*,\s*stopRecording\s*\]/,
    explanation: '只依赖函数引用，不依赖状态'
  },
  {
    name: '正确清理监听器',
    pattern: /let\s+removeF2Listener\s*=\s*null[\s\S]*?let\s+removeHotkeyListener\s*=\s*null/,
    explanation: '保存监听器引用以便清理'
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
  log('\n✓ 所有测试通过！', 'green');
  log('\n修复内容：', 'cyan');
  log('1. ✅ Windows悬浮球窗口：使用thickFrame: false移除边框', 'green');
  log('2. ✅ 平台特定配置：macOS使用titleBarStyle，Windows使用thickFrame', 'green');
  log('3. ✅ 窗口显示优化：先隐藏，加载完成后再显示', 'green');
  log('4. ✅ 快捷键闭包问题：使用useRef存储最新状态', 'green');
  log('5. ✅ 监听器管理：正确保存和清理监听器引用', 'green');
  
  log('\n建议手动验证：', 'cyan');
  log('1. 运行 pnpm run dev', 'yellow');
  log('2. 切换到悬浮球模式', 'yellow');
  log('3. ✅ 验证悬浮球上方无白色条', 'yellow');
  log('4. ✅ 按F3开始录音', 'yellow');
  log('5. ✅ 录音完成后再按F3，验证能停止录音', 'yellow');
  log('6. ✅ 多次按F3测试切换是否正常', 'yellow');
  
  process.exit(0);
} else {
  log('\n✗ 部分测试失败，请检查上述问题。', 'red');
  process.exit(1);
}

