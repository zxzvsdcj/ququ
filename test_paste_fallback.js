#!/usr/bin/env node
/**
 * 粘贴功能多重回退机制验证脚本
 * 
 * 验证改进后的粘贴功能：
 * 1. Windows平台的SendKeys实现
 * 2. 失败时的优雅降级（剪贴板回退）
 * 3. 返回值包含requiresManualPaste标志
 * 4. 前端正确处理回退结果并显示提示
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
// 测试1：Windows粘贴方法改进
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('测试1：Windows粘贴方法改进', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('src/helpers/clipboard.js', 'ClipboardManager - pasteWindows', [
  {
    name: '添加延迟确保剪贴板更新',
    pattern: /setTimeout\(\s*\(\)\s*=>\s*\{[\s\S]*?pasteProcess\s*=\s*spawn/,
    explanation: '在spawn前添加延迟'
  },
  {
    name: '捕获stderr输出',
    pattern: /pasteProcess\.stderr\.on\(\s*['"]data['"]/,
    explanation: '监听错误输出以便调试'
  },
  {
    name: 'SendKeys成功时返回详细结果',
    pattern: /resolve\(\s*\{\s*success:\s*true,\s*method:\s*['"]sendkeys['"]/,
    explanation: '成功时返回method标识'
  },
  {
    name: 'SendKeys失败时优雅降级',
    pattern: /resolve\(\s*\{[\s\S]*?success:\s*true[\s\S]*?method:\s*['"]clipboard['"][\s\S]*?requiresManualPaste:\s*true/,
    explanation: '失败时不抛出错误，而是返回成功+手动粘贴标志'
  },
  {
    name: '失败时提供用户友好消息',
    pattern: /message:\s*['"]文本已复制到剪贴板，请按\s*Ctrl\+V\s*粘贴['"]/,
    explanation: '提示用户手动粘贴'
  },
  {
    name: '进程错误时也优雅降级',
    pattern: /pasteProcess\.on\(\s*['"]error['"][\s\S]*?resolve\(\s*\{[\s\S]*?requiresManualPaste:\s*true/,
    explanation: 'PowerShell启动失败时也返回成功'
  }
]);

// ============================================================================
// 测试2：pasteText方法改进
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('测试2：pasteText方法改进', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('src/helpers/clipboard.js', 'ClipboardManager - pasteText', [
  {
    name: '返回粘贴结果对象',
    pattern: /return\s+result\s*\|\|\s*\{\s*success:\s*true,\s*method:\s*['"]auto['"]/,
    explanation: '返回详细的结果对象'
  },
  {
    name: 'macOS权限不足时返回回退结果',
    pattern: /return\s*\{[\s\S]*?success:\s*true[\s\S]*?method:\s*['"]clipboard['"][\s\S]*?requiresManualPaste:\s*true/,
    explanation: 'macOS无权限时也返回成功+手动粘贴'
  },
  {
    name: 'catch块中返回回退结果',
    pattern: /catch[\s\S]*?return\s*\{[\s\S]*?success:\s*true[\s\S]*?method:\s*['"]clipboard['"][\s\S]*?requiresManualPaste:\s*true/,
    explanation: '异常时也返回成功+手动粘贴'
  }
]);

// ============================================================================
// 测试3：前端处理回退结果
// ============================================================================
log('\n' + '='.repeat(80), 'blue');
log('测试3：前端处理回退结果', 'blue');
log('='.repeat(80), 'blue');

checkFileContent('src/App.jsx', 'App.jsx - safePaste', [
  {
    name: '接收pasteText返回值',
    pattern: /const\s+result\s*=\s*await\s+window\.electronAPI\.pasteText\(text\)/,
    explanation: '获取粘贴结果'
  },
  {
    name: '检查requiresManualPaste标志',
    pattern: /if\s*\(\s*result\s*&&\s*result\.requiresManualPaste\s*\)/,
    explanation: '判断是否需要手动粘贴'
  },
  {
    name: '手动粘贴时显示info提示',
    pattern: /toast\.info\(\s*["']文本已复制到剪贴板["'][\s\S]*?description:\s*result\.message/,
    explanation: '显示友好的提示信息'
  },
  {
    name: '自动粘贴成功时显示success提示',
    pattern: /toast\.success\(\s*["']文本已自动粘贴到当前输入框["']\)/,
    explanation: '成功时的提示'
  }
]);

checkFileContent('src/floatBall.jsx', 'floatBall.jsx - onAIOptimizationComplete', [
  {
    name: '接收pasteText返回值',
    pattern: /const\s+pasteResult\s*=\s*await\s+window\.electronAPI\.pasteText\(result\.text\)/,
    explanation: '获取粘贴结果'
  },
  {
    name: '检查requiresManualPaste标志',
    pattern: /if\s*\(\s*pasteResult\s*&&\s*pasteResult\.requiresManualPaste\s*\)/,
    explanation: '判断是否需要手动粘贴'
  },
  {
    name: '悬浮球模式记录到控制台',
    pattern: /console\.log\(.*需要手动粘贴.*pasteResult\.message/,
    explanation: '悬浮球模式不显示Toast，只记录日志'
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
  log('\n✓ 所有测试通过！粘贴功能多重回退机制已实现。', 'green');
  log('\n实现的改进：', 'cyan');
  log('1. ✅ SendKeys失败时不抛出错误，优雅降级到剪贴板', 'green');
  log('2. ✅ 返回详细结果对象（success, method, requiresManualPaste）', 'green');
  log('3. ✅ 前端根据标志显示不同提示（自动粘贴 vs 手动粘贴）', 'green');
  log('4. ✅ 添加延迟和错误捕获提高可靠性', 'green');
  
  log('\n建议手动验证：', 'cyan');
  log('1. 运行 pnpm run dev', 'yellow');
  log('2. 测试在不同应用中粘贴（浏览器、记事本、VSCode等）', 'yellow');
  log('3. 验证自动粘贴成功时显示"文本已自动粘贴"', 'yellow');
  log('4. 验证自动粘贴失败时显示"文本已复制到剪贴板，请按Ctrl+V粘贴"', 'yellow');
  log('5. 验证手动Ctrl+V确实能粘贴文本', 'yellow');
  
  process.exit(0);
} else {
  log('\n✗ 部分测试失败，请检查上述问题。', 'red');
  process.exit(1);
}

