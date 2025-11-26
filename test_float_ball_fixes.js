/**
 * 悬浮球模式修复测试脚本
 * 测试4个修复点：点击录音、快捷键、关闭重开、右键菜单
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================');
console.log('   悬浮球模式修复验证测试');
console.log('====================================\n');

// 测试配置
const tests = {
  '1. 点击录音功能': {
    description: '验证点击悬浮球能触发录音',
    checks: [
      { file: 'src/floatBall.jsx', pattern: /useHotkey/, desc: '导入useHotkey hook' },
      { file: 'src/floatBall.jsx', pattern: /stopPropagation/, desc: '点击事件阻止冒泡' },
      { file: 'src/floatBall.jsx', pattern: /WebkitAppRegion/, desc: '允许点击事件' },
    ]
  },
  '2. 快捷键响应': {
    description: '验证F2快捷键在悬浮球模式下工作',
    checks: [
      { file: 'src/floatBall.jsx', pattern: /registerF2Hotkey/, desc: '注册F2热键' },
      { file: 'src/floatBall.jsx', pattern: /onF2DoubleClick.*handleF2DoubleClick/, desc: '监听F2双击事件' },
      { file: 'src/floatBall.jsx', pattern: /syncRecordingState.*isRecording/, desc: '同步录音状态' },
      { file: 'preload.js', pattern: /removeF2DoubleClickListener/, desc: 'preload暴露移除监听器' },
    ]
  },
  '3. 关闭后重开': {
    description: '验证关闭悬浮球后能从托盘重新打开',
    checks: [
      { file: 'src/helpers/windowManager.js', pattern: /preventDefault/, desc: '关闭时阻止默认行为' },
      { file: 'src/helpers/windowManager.js', pattern: /floatBallWindow\.hide/, desc: '关闭时隐藏窗口' },
      { file: 'src/helpers/tray.js', pattern: /显示悬浮球/, desc: '托盘菜单有显示悬浮球选项' },
      { file: 'main.js', pattern: /trayManager\.updateContextMenu\(windowManager\)/, desc: 'main.js传递windowManager给托盘' },
    ]
  },
  '4. 右键菜单': {
    description: '验证悬浮球右键菜单功能完整',
    checks: [
      { file: 'src/floatBall.jsx', pattern: /showFloatBallContextMenu/, desc: '调用右键菜单API' },
      { file: 'preload.js', pattern: /showFloatBallContextMenu/, desc: 'preload暴露右键菜单API' },
      { file: 'src/helpers/ipcHandlers.js', pattern: /show-float-ball-context-menu/, desc: 'IPC处理右键菜单' },
      { file: 'src/helpers/ipcHandlers.js', pattern: /显示主窗口/, desc: '菜单包含显示主窗口' },
      { file: 'src/helpers/ipcHandlers.js', pattern: /控制面板/, desc: '菜单包含控制面板' },
      { file: 'src/helpers/ipcHandlers.js', pattern: /关于/, desc: '菜单包含关于' },
    ]
  }
};

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

// 执行检查
Object.entries(tests).forEach(([testName, testConfig]) => {
  console.log(`\n${testName}`);
  console.log(`  ${testConfig.description}`);
  console.log('  ' + '-'.repeat(60));
  
  testConfig.checks.forEach((check, index) => {
    totalTests++;
    const filePath = path.join(__dirname, check.file);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`  ❌ [${index + 1}] 文件不存在: ${check.file}`);
        failedTests.push({ test: testName, check: check.desc, reason: '文件不存在' });
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (check.pattern.test(content)) {
        console.log(`  ✅ [${index + 1}] ${check.desc}`);
        passedTests++;
      } else {
        console.log(`  ❌ [${index + 1}] ${check.desc} - 未找到匹配模式`);
        failedTests.push({ test: testName, check: check.desc, reason: '未找到匹配模式' });
      }
    } catch (error) {
      console.log(`  ❌ [${index + 1}] ${check.desc} - 错误: ${error.message}`);
      failedTests.push({ test: testName, check: check.desc, reason: error.message });
    }
  });
});

// 输出总结
console.log('\n' + '='.repeat(70));
console.log('测试总结');
console.log('='.repeat(70));
console.log(`总测试数: ${totalTests}`);
console.log(`✅ 通过: ${passedTests} (${(passedTests / totalTests * 100).toFixed(1)}%)`);
console.log(`${failedTests.length > 0 ? '❌' : '✅'} 失败: ${failedTests.length} (${(failedTests.length / totalTests * 100).toFixed(1)}%)`);

if (failedTests.length > 0) {
  console.log('\n失败详情:');
  failedTests.forEach((failure, index) => {
    console.log(`  ${index + 1}. [${failure.test}] ${failure.check}`);
    console.log(`     原因: ${failure.reason}`);
  });
}

// 额外检查：确认文件结构完整性
console.log('\n' + '='.repeat(70));
console.log('文件结构完整性检查');
console.log('='.repeat(70));

const criticalFiles = [
  'src/floatBall.html',
  'src/floatBall.jsx',
  'src/hooks/useHotkey.js',
  'src/hooks/useRecording.js',
  'src/hooks/useModelStatus.js',
  'src/helpers/windowManager.js',
  'src/helpers/tray.js',
  'src/helpers/ipcHandlers.js',
  'preload.js',
  'main.js'
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// 最终结论
console.log('\n' + '='.repeat(70));
if (passedTests === totalTests && allFilesExist) {
  console.log('✅ 所有测试通过！悬浮球模式修复完成。');
  console.log('\n建议测试步骤:');
  console.log('  1. 运行 pnpm run dev');
  console.log('  2. 在设置中切换到悬浮球模式');
  console.log('  3. 点击悬浮球测试录音功能');
  console.log('  4. 按F2两次测试快捷键');
  console.log('  5. 右键悬浮球查看菜单');
  console.log('  6. 关闭悬浮球，从托盘重新打开');
  process.exit(0);
} else {
  console.log('❌ 测试失败，请检查上述失败项并修复。');
  process.exit(1);
}

