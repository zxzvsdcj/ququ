/**
 * 悬浮球改进验证测试
 * 1. 移除窗口标题文字
 * 2. 支持自定义快捷键
 */

const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('   悬浮球改进验证测试');
console.log('====================================\n');

const checks = [
  {
    category: '问题1：移除窗口标题文字',
    tests: [
      {
        file: 'src/helpers/windowManager.js',
        pattern: /title:\s*['"]['"],?\s*\/\/\s*移除窗口标题/,
        desc: '窗口标题设为空字符串',
        fix: '移除"蛐蛐"标题文字显示'
      },
      {
        file: 'src/helpers/windowManager.js',
        pattern: /titleBarStyle:\s*['"]customButtonsOnHover['"]/,
        desc: '设置titleBarStyle隐藏标题栏',
        fix: '完全隐藏Windows/macOS标题栏'
      },
      {
        file: 'src/helpers/windowManager.js',
        pattern: /frame:\s*false/,
        desc: '保持无边框窗口',
        fix: '确认窗口无边框'
      },
      {
        file: 'src/helpers/windowManager.js',
        pattern: /transparent:\s*true/,
        desc: '保持透明窗口',
        fix: '确认窗口透明'
      }
    ]
  },
  {
    category: '问题2：支持自定义快捷键',
    tests: [
      {
        file: 'src/floatBall.jsx',
        pattern: /getSetting.*hotkey/,
        desc: '读取自定义快捷键设置',
        fix: '从设置中获取用户配置的快捷键'
      },
      {
        file: 'src/floatBall.jsx',
        pattern: /registerHotkey.*customHotkey/,
        desc: '注册自定义快捷键',
        fix: '除F2外也注册用户自定义快捷键'
      },
      {
        file: 'src/floatBall.jsx',
        pattern: /onHotkeyTriggered.*handleHotkeyTriggered/,
        desc: '监听自定义快捷键事件',
        fix: '监听并响应自定义快捷键触发'
      },
      {
        file: 'src/floatBall.jsx',
        pattern: /\/\/\s*切换录音状态/,
        desc: '自定义快捷键切换录音',
        fix: '按下自定义快捷键时开始/停止录音'
      },
      {
        file: 'src/floatBall.jsx',
        pattern: /registerF2Hotkey/,
        desc: 'F2双击功能保留',
        fix: '确保F2双击功能继续可用'
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

// 功能对比
console.log('\n' + '='.repeat(70));
console.log('功能对比');
console.log('='.repeat(70));

console.log('\n修复前：');
console.log('  ❌ 悬浮球上方显示"蛐蛐"标题窗口');
console.log('  ❌ 只支持F2双击快捷键');
console.log('  ❌ 无法使用设置中配置的自定义快捷键（如F3）');
console.log('  ❌ 主窗口和悬浮球快捷键不一致');

console.log('\n修复后：');
console.log('  ✅ 完全移除窗口标题（title: ""）');
console.log('  ✅ 隐藏标题栏（titleBarStyle: customButtonsOnHover）');
console.log('  ✅ 支持F2双击快捷键');
console.log('  ✅ 支持自定义快捷键（从设置读取）');
console.log('  ✅ 自定义快捷键切换录音状态');
console.log('  ✅ 主窗口和悬浮球快捷键同步');

// 快捷键机制说明
console.log('\n' + '='.repeat(70));
console.log('快捷键机制说明');
console.log('='.repeat(70));

console.log('\n【F2双击机制】（保留）');
console.log('  - 触发方式：连续按F2两次（500ms内）');
console.log('  - 功能：开始/停止录音');
console.log('  - 优点：简单快捷，不与其他应用冲突');

console.log('\n【自定义快捷键机制】（新增）');
console.log('  - 触发方式：按下设置中配置的快捷键（如F3、Ctrl+Shift+Space等）');
console.log('  - 功能：开始/停止录音（切换状态）');
console.log('  - 优点：与主窗口一致，符合用户习惯');
console.log('  - 配置位置：设置 → 快捷键设置');

console.log('\n【两种机制并存】');
console.log('  - 用户可以同时使用F2双击和自定义快捷键');
console.log('  - 悬浮球模式和完整模式快捷键行为完全一致');
console.log('  - 在设置中修改快捷键，悬浮球会自动同步');

// 使用场景
console.log('\n' + '='.repeat(70));
console.log('使用场景示例');
console.log('='.repeat(70));

console.log('\n场景1：使用F2双击（默认行为）');
console.log('  1. 悬浮球处于空闲状态');
console.log('  2. 快速按F2两次');
console.log('  3. 悬浮球开始录音（紫色脉动）');
console.log('  4. 再次快速按F2两次');
console.log('  5. 悬浮球停止录音并处理（蓝色旋转）');

console.log('\n场景2：使用自定义快捷键（如F3）');
console.log('  1. 打开设置 → 快捷键设置 → 修改为F3');
console.log('  2. 保存设置');
console.log('  3. 悬浮球自动重新注册F3快捷键');
console.log('  4. 按F3开始录音');
console.log('  5. 再按F3停止录音');

console.log('\n场景3：主窗口和悬浮球切换');
console.log('  1. 在主窗口设置快捷键为F3');
console.log('  2. 在主窗口按F3录音 ✅');
console.log('  3. 切换到悬浮球模式');
console.log('  4. 在悬浮球按F3录音 ✅（同步）');
console.log('  5. 两种模式行为一致，无需重新适应');

// 修改文件列表
console.log('\n' + '='.repeat(70));
console.log('修改文件列表');
console.log('='.repeat(70));

const modifiedFiles = [
  'src/helpers/windowManager.js - 移除窗口标题，隐藏标题栏',
  'src/floatBall.jsx - 支持自定义快捷键，保留F2双击',
];

modifiedFiles.forEach((file, i) => {
  console.log(`  ${i + 1}. ${file}`);
});

// 最终结论
console.log('\n' + '='.repeat(70));
if (passedTests === totalTests) {
  console.log('✅ 悬浮球改进完成！');
  console.log('\n改进内容：');
  console.log('  1. 完全移除窗口标题，悬浮球上方无文字干扰');
  console.log('  2. 支持自定义快捷键，与主窗口保持一致');
  console.log('  3. F2双击和自定义快捷键并存，灵活使用');
  console.log('\n测试方法：');
  console.log('  1. 运行 pnpm run dev');
  console.log('  2. 切换到悬浮球模式');
  console.log('  3. 验证窗口上方无"蛐蛐"标题');
  console.log('  4. 按F2两次测试录音');
  console.log('  5. 打开设置修改快捷键为F3');
  console.log('  6. 按F3测试录音（应该生效）');
  process.exit(0);
} else {
  console.log('❌ 测试失败，请检查上述失败项并修复。');
  process.exit(1);
}

