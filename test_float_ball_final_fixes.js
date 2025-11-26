/**
 * 悬浮球最终修复验证
 * 1. 移除背景文字（任何状态下都不显示）
 * 2. 悬浮球可拖拽（不限制在中心）
 * 3. 右键菜单"退出"改为"关闭"
 */

const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('   悬浮球最终修复验证');
console.log('====================================\n');

const checks = [
  {
    category: '问题1：移除背景文字',
    tests: [
      {
        file: 'src/floatBall.html',
        pattern: /body.*-webkit-app-region:\s*no-drag/s,
        desc: 'body设置为no-drag',
        fix: 'body不可拖拽，避免显示背景文字'
      },
      {
        file: 'src/floatBall.html',
        pattern: /#float-ball.*-webkit-app-region:\s*drag/s,
        desc: '悬浮球本身可拖拽',
        fix: '只有悬浮球圆形区域可拖拽'
      },
      {
        file: 'src/floatBall.html',
        pattern: /\.icon.*-webkit-app-region:\s*no-drag/s,
        desc: '图标区域不可拖拽',
        fix: '图标区域允许点击事件'
      },
      {
        file: 'src/floatBall.jsx',
        pattern: /id="float-ball"(?!.*WebkitAppRegion)/s,
        desc: 'JSX中移除inline style',
        fix: '使用CSS控制拖拽区域，不用inline style'
      }
    ]
  },
  {
    category: '问题2：悬浮球可拖拽',
    tests: [
      {
        file: 'src/floatBall.html',
        pattern: /#float-ball.*cursor:\s*move/s,
        desc: '悬浮球显示拖拽光标',
        fix: '鼠标移到悬浮球上显示move光标'
      },
      {
        file: 'src/floatBall.html',
        pattern: /#float-ball.*-webkit-app-region:\s*drag/s,
        desc: '悬浮球区域可拖拽',
        fix: '悬浮球可以在屏幕任意位置拖动'
      },
      {
        file: 'src/helpers/windowManager.js',
        pattern: /movable:\s*true/,
        desc: '窗口允许移动',
        fix: 'BrowserWindow配置允许移动'
      }
    ]
  },
  {
    category: '问题3：右键菜单区分',
    tests: [
      {
        file: 'src/helpers/ipcHandlers.js',
        pattern: /label:\s*["']关闭["'].*hideFloatBallWindow/s,
        desc: '悬浮球右键菜单改为"关闭"',
        fix: '点击"关闭"隐藏悬浮球，不退出程序'
      },
      {
        file: 'src/helpers/tray.js',
        pattern: /label:\s*["']退出["'].*app\.quit/s,
        desc: '托盘菜单保持"退出"',
        fix: '托盘的"退出"直接退出程序'
      }
    ]
  }
];

let totalTests = 0;
let passedTests = 0;
const failedTests = [];

checks.forEach(({ category, tests }) => {
  console.log(`\n${category}`);
  console.log('  ' + '-'.repeat(60));
  
  tests.forEach((test, index) => {
    totalTests++;
    const filePath = path.join(__dirname, test.file);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`  ❌ [${index + 1}] ${test.desc} - 文件不存在`);
        failedTests.push({ category, test: test.desc, reason: '文件不存在' });
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (test.pattern.test(content)) {
        console.log(`  ✅ [${index + 1}] ${test.desc}`);
        console.log(`      └─ 修复说明: ${test.fix}`);
        passedTests++;
      } else {
        console.log(`  ❌ [${index + 1}] ${test.desc} - 未找到修复`);
        console.log(`      └─ 需要: ${test.fix}`);
        failedTests.push({ category, test: test.desc, reason: '未找到修复' });
      }
    } catch (error) {
      console.log(`  ❌ [${index + 1}] ${test.desc} - 错误: ${error.message}`);
      failedTests.push({ category, test: test.desc, reason: error.message });
    }
  });
});

// 测试总结
console.log('\n' + '='.repeat(70));
console.log('测试总结');
console.log('='.repeat(70));
console.log(`总测试数: ${totalTests}`);
console.log(`✅ 通过: ${passedTests} (${(passedTests / totalTests * 100).toFixed(1)}%)`);
console.log(`${failedTests.length > 0 ? '❌' : '✅'} 失败: ${failedTests.length} (${(failedTests.length / totalTests * 100).toFixed(1)}%)`);

if (failedTests.length > 0) {
  console.log('\n失败详情:');
  failedTests.forEach((failure, index) => {
    console.log(`  ${index + 1}. [${failure.category}] ${failure.test}`);
    console.log(`     原因: ${failure.reason}`);
  });
}

// 拖拽区域说明
console.log('\n' + '='.repeat(70));
console.log('拖拽区域层级结构');
console.log('='.repeat(70));

console.log('\n修复前（错误）：');
console.log('  ❌ body: -webkit-app-region: drag');
console.log('     └─ 整个80×80px区域都可拖拽');
console.log('     └─ 导致背景文字"蛐蛐"显示');
console.log('     └─ 点击事件被拖拽覆盖');

console.log('\n修复后（正确）：');
console.log('  ✅ body: -webkit-app-region: no-drag');
console.log('     └─ 背景区域不可拖拽，无文字显示');
console.log('  ✅ #float-ball: -webkit-app-region: drag');
console.log('     └─ 只有60×60px圆形区域可拖拽');
console.log('     └─ 可以在屏幕任意位置移动');
console.log('  ✅ .icon: -webkit-app-region: no-drag');
console.log('     └─ 图标区域不可拖拽，允许点击');
console.log('     └─ 点击录音、右键菜单正常工作');

// 右键菜单对比
console.log('\n' + '='.repeat(70));
console.log('右键菜单对比');
console.log('='.repeat(70));

console.log('\n【悬浮球右键菜单】');
console.log('  - 显示主窗口');
console.log('  - 控制面板');
console.log('  - 设置');
console.log('  - 历史记录');
console.log('  - 关于');
console.log('  - 关闭 ← 隐藏悬浮球（不退出程序）');

console.log('\n【托盘右键菜单】');
console.log('  - 显示主窗口');
console.log('  - 显示悬浮球');
console.log('  - 控制面板');
console.log('  - 设置');
console.log('  - 关于');
console.log('  - 退出 ← 直接退出程序');

console.log('\n区别说明：');
console.log('  悬浮球"关闭" = 隐藏悬浮球，可从托盘重新打开');
console.log('  托盘"退出" = 完全退出应用程序');

// 使用场景
console.log('\n' + '='.repeat(70));
console.log('使用场景示例');
console.log('='.repeat(70));

console.log('\n场景1：拖动悬浮球');
console.log('  1. 鼠标移到悬浮球圆形区域（不是图标）');
console.log('  2. 光标变为move（四向箭头）');
console.log('  3. 按住鼠标左键拖动');
console.log('  4. 悬浮球跟随鼠标移动到任意位置');
console.log('  5. 释放鼠标，悬浮球固定在新位置');

console.log('\n场景2：点击录音');
console.log('  1. 鼠标移到悬浮球中心图标区域');
console.log('  2. 点击图标（不会触发拖动）');
console.log('  3. 开始录音（悬浮球变紫色脉动）');
console.log('  4. 再次点击停止录音');

console.log('\n场景3：临时隐藏悬浮球');
console.log('  1. 右键悬浮球');
console.log('  2. 选择"关闭"');
console.log('  3. 悬浮球隐藏（程序继续运行）');
console.log('  4. 右键托盘图标');
console.log('  5. 选择"显示悬浮球"重新显示');

console.log('\n场景4：完全退出程序');
console.log('  1. 右键托盘图标');
console.log('  2. 选择"退出"');
console.log('  3. 程序完全关闭');

// 修改文件列表
console.log('\n' + '='.repeat(70));
console.log('修改文件列表');
console.log('='.repeat(70));

const modifiedFiles = [
  'src/floatBall.html - 调整拖拽区域层级（body/float-ball/icon）',
  'src/floatBall.jsx - 移除inline style，使用CSS控制',
  'src/helpers/ipcHandlers.js - 悬浮球右键菜单"退出"改为"关闭"',
];

modifiedFiles.forEach((file, i) => {
  console.log(`  ${i + 1}. ${file}`);
});

// 最终结论
console.log('\n' + '='.repeat(70));
if (passedTests === totalTests) {
  console.log('✅ 悬浮球最终修复完成！');
  console.log('\n修复内容：');
  console.log('  1. ✅ 移除背景文字，任何状态下都只显示悬浮球本体');
  console.log('  2. ✅ 悬浮球可自由拖动，不限制在中心位置');
  console.log('  3. ✅ 右键菜单区分：悬浮球"关闭"，托盘"退出"');
  console.log('\n测试方法：');
  console.log('  1. 运行 pnpm run dev');
  console.log('  2. 切换到悬浮球模式');
  console.log('  3. 验证无背景文字（只有圆形悬浮球）');
  console.log('  4. 拖动悬浮球到屏幕各个位置');
  console.log('  5. 点击图标测试录音（不触发拖动）');
  console.log('  6. 右键悬浮球，验证菜单是"关闭"');
  console.log('  7. 右键托盘，验证菜单是"退出"');
  process.exit(0);
} else {
  console.log('❌ 测试失败，请检查上述失败项并修复。');
  process.exit(1);
}

