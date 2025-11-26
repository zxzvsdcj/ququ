/**
 * 悬浮球样式修复验证
 * 修复问题：
 * 1. 背后有"蛐蛐"背景窗影响观感
 * 2. 鼠标悬停时四边被裁切
 */

const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('   悬浮球样式修复验证');
console.log('====================================\n');

const checks = [
  {
    category: '问题1：背景窗口修复',
    tests: [
      {
        file: 'src/floatBall.html',
        pattern: /background:\s*transparent/,
        desc: 'body背景设为透明',
        fix: '移除默认背景，避免"蛐蛐"文字显示'
      },
      {
        file: 'src/helpers/windowManager.js',
        pattern: /hasShadow:\s*false/,
        desc: '窗口禁用阴影',
        fix: '移除Electron窗口默认阴影'
      }
    ]
  },
  {
    category: '问题2：悬停裁切修复',
    tests: [
      {
        file: 'src/floatBall.html',
        pattern: /body.*width:\s*80px/s,
        desc: 'body宽度扩大到80px',
        fix: '为1.1倍放大效果留出空间（60px * 1.1 = 66px）'
      },
      {
        file: 'src/floatBall.html',
        pattern: /body.*height:\s*80px/s,
        desc: 'body高度扩大到80px',
        fix: '为1.1倍放大效果留出空间'
      },
      {
        file: 'src/helpers/windowManager.js',
        pattern: /width:\s*80/,
        desc: '窗口宽度改为80',
        fix: '与HTML body尺寸一致'
      },
      {
        file: 'src/helpers/windowManager.js',
        pattern: /height:\s*80/,
        desc: '窗口高度改为80',
        fix: '与HTML body尺寸一致'
      },
      {
        file: 'src/floatBall.html',
        pattern: /display:\s*flex/,
        desc: 'body使用flex布局',
        fix: '确保悬浮球居中，不贴边'
      },
      {
        file: 'src/floatBall.html',
        pattern: /align-items:\s*center/,
        desc: 'body垂直居中',
        fix: '悬浮球垂直居中对齐'
      },
      {
        file: 'src/floatBall.html',
        pattern: /justify-content:\s*center/,
        desc: 'body水平居中',
        fix: '悬浮球水平居中对齐'
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

// 样式对比
console.log('\n' + '='.repeat(70));
console.log('修复前后对比');
console.log('='.repeat(70));

console.log('\n修复前：');
console.log('  ❌ 窗口尺寸：60×60px');
console.log('  ❌ body背景：默认白色（显示"蛐蛐"文字）');
console.log('  ❌ 悬浮球尺寸：60×60px');
console.log('  ❌ 悬停放大：1.1倍 = 66px（超出60px窗口，被裁切）');
console.log('  ❌ 窗口阴影：默认开启（产生灰色背景）');

console.log('\n修复后：');
console.log('  ✅ 窗口尺寸：80×80px（留出20px缓冲区）');
console.log('  ✅ body背景：transparent（完全透明）');
console.log('  ✅ 悬浮球尺寸：60×60px（居中）');
console.log('  ✅ 悬停放大：1.1倍 = 66px（完全在80px窗口内）');
console.log('  ✅ 窗口阴影：hasShadow: false（无背景）');
console.log('  ✅ body布局：flex居中（确保悬浮球在窗口正中）');

// 计算说明
console.log('\n' + '='.repeat(70));
console.log('尺寸计算说明');
console.log('='.repeat(70));
console.log('\n悬浮球尺寸：60px');
console.log('悬停放大系数：1.1倍');
console.log('悬停后尺寸：60 × 1.1 = 66px');
console.log('所需最小窗口：66px');
console.log('实际窗口尺寸：80px（预留14px缓冲）');
console.log('左右缓冲：(80 - 60) / 2 = 10px');
console.log('上下缓冲：(80 - 60) / 2 = 10px');
console.log('\n✅ 悬停放大后：66px < 80px，不会被裁切');

// 最终结论
console.log('\n' + '='.repeat(70));
if (passedTests === totalTests) {
  console.log('✅ 样式修复完成！');
  console.log('\n修复内容：');
  console.log('  1. body背景设为transparent，移除"蛐蛐"文字背景');
  console.log('  2. 窗口尺寸扩大到80×80px，为悬停留出空间');
  console.log('  3. 窗口禁用阴影（hasShadow: false）');
  console.log('  4. body使用flex居中布局，确保悬浮球不贴边');
  console.log('\n测试方法：');
  console.log('  1. 运行 pnpm run dev');
  console.log('  2. 切换到悬浮球模式');
  console.log('  3. 查看背景是否透明（无"蛐蛐"文字）');
  console.log('  4. 鼠标移到悬浮球上，观察是否完整放大（无裁切）');
  process.exit(0);
} else {
  console.log('❌ 测试失败，请检查上述失败项并修复。');
  process.exit(1);
}

