/**
 * UI模式性能对比测试
 * 
 * 测试对比：
 * 1. 完整模式 vs 悬浮球模式
 * 2. AI开启 vs AI关闭
 * 3. 各种组合的性能表现
 */

// 模拟不同UI模式的性能特征
class PerformanceSimulator {
  constructor() {
    this.testResults = [];
  }

  // 模拟DOM渲染开销
  async simulateDOMRendering(mode) {
    const renderCost = {
      full: 15,        // 完整模式：500个节点
      simplified: 10,  // 精简模式：500个节点但多数隐藏
      float: 2         // 悬浮球：<10个节点
    };
    await this.delay(renderCost[mode]);
    return renderCost[mode];
  }

  // 模拟React状态更新
  async simulateReactUpdate(mode) {
    const updateCost = {
      full: 12,        // 完整组件树更新
      simplified: 8,   // 部分组件树更新
      float: 1         // 极简组件
    };
    await this.delay(updateCost[mode]);
    return updateCost[mode];
  }

  // 模拟Toast显示
  async simulateToast(mode, show) {
    if (!show) return 0;
    
    const toastCost = {
      full: 5,         // 完整Toast + 动画
      simplified: 3,   // 简化Toast
      float: 0         // 无Toast
    };
    await this.delay(toastCost[mode]);
    return toastCost[mode];
  }

  // 模拟AI处理（如果开启）
  async simulateAIProcessing(enableAI, textLength) {
    if (!enableAI) return 0;
    
    const processingTime = Math.min(textLength * 10, 3000);
    await this.delay(processingTime);
    return processingTime;
  }

  // 模拟数据库保存
  async simulateDatabaseSave() {
    await this.delay(50);
    return 50;
  }

  // 模拟粘贴操作
  async simulatePaste() {
    await this.delay(10);
    return 10;
  }

  // 辅助延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 完整流程测试
  async testWorkflow(config) {
    const startTime = Date.now();
    const { mode, enableAI, text, showToast } = config;

    const timing = {
      domRender: 0,
      reactUpdate: 0,
      toast: 0,
      aiProcessing: 0,
      dbSave: 0,
      paste: 0,
      total: 0
    };

    // 1. DOM渲染
    timing.domRender = await this.simulateDOMRendering(mode);

    // 2. FunASR识别完成，更新UI
    timing.reactUpdate = await this.simulateReactUpdate(mode);

    // 3. 显示Toast（如果需要）
    timing.toast = await this.simulateToast(mode, showToast);

    // 4. AI处理（如果开启）
    timing.aiProcessing = await this.simulateAIProcessing(enableAI, text.length);

    // 5. 数据库保存
    timing.dbSave = await this.simulateDatabaseSave();

    // 6. 粘贴操作
    timing.paste = await this.simulatePaste();

    timing.total = Date.now() - startTime;

    return timing;
  }
}

// 测试用例
const testCases = [
  {
    name: '完整模式 + AI开启',
    config: { mode: 'full', enableAI: true, text: '你好，请问你在干嘛？', showToast: true }
  },
  {
    name: '完整模式 + AI关闭',
    config: { mode: 'full', enableAI: false, text: '你好，请问你在干嘛？', showToast: true }
  },
  {
    name: '精简模式 + AI开启',
    config: { mode: 'simplified', enableAI: true, text: '你好，请问你在干嘛？', showToast: true }
  },
  {
    name: '精简模式 + AI关闭',
    config: { mode: 'simplified', enableAI: false, text: '你好，请问你在干嘛？', showToast: true }
  },
  {
    name: '悬浮球模式 + AI开启',
    config: { mode: 'float', enableAI: true, text: '你好，请问你在干嘛？', showToast: false }
  },
  {
    name: '悬浮球模式 + AI关闭 ⚡',
    config: { mode: 'float', enableAI: false, text: '你好，请问你在干嘛？', showToast: false }
  },
];

// 长文本测试
const longTextCases = [
  {
    name: '完整模式 + AI开启 (长文本)',
    config: { 
      mode: 'full', 
      enableAI: true, 
      text: '其实这个项目的核心功能就是语音转文字，然后通过AI优化一下文本的格式和内容。但是我发现有时候AI优化会比较慢，所以我想在设置里面增加一个开关。', 
      showToast: true 
    }
  },
  {
    name: '悬浮球模式 + AI关闭 (长文本) ⚡',
    config: { 
      mode: 'float', 
      enableAI: false, 
      text: '其实这个项目的核心功能就是语音转文字，然后通过AI优化一下文本的格式和内容。但是我发现有时候AI优化会比较慢，所以我想在设置里面增加一个开关。', 
      showToast: false 
    }
  },
];

// 运行测试
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 UI模式性能对比测试');
  console.log('='.repeat(70) + '\n');

  const simulator = new PerformanceSimulator();
  const results = [];

  // 基础测试
  console.log('📊 基础场景测试（短文本）\n');
  for (const testCase of testCases) {
    console.log(`🔹 ${testCase.name}`);
    const timing = await simulator.testWorkflow(testCase.config);
    results.push({ name: testCase.name, timing });
    
    console.log(`   DOM渲染:    ${timing.domRender}ms`);
    console.log(`   React更新:  ${timing.reactUpdate}ms`);
    console.log(`   Toast提示:  ${timing.toast}ms`);
    console.log(`   AI处理:     ${timing.aiProcessing}ms`);
    console.log(`   数据库保存: ${timing.dbSave}ms`);
    console.log(`   粘贴操作:   ${timing.paste}ms`);
    console.log(`   ✅ 总耗时:   ${timing.total}ms\n`);
  }

  // 长文本测试
  console.log('\n' + '─'.repeat(70) + '\n');
  console.log('📊 长文本场景测试\n');
  for (const testCase of longTextCases) {
    console.log(`🔹 ${testCase.name}`);
    const timing = await simulator.testWorkflow(testCase.config);
    results.push({ name: testCase.name, timing });
    
    console.log(`   ✅ 总耗时: ${timing.total}ms\n`);
  }

  // 生成对比表格
  console.log('\n' + '='.repeat(70));
  console.log('📈 性能对比汇总');
  console.log('='.repeat(70) + '\n');

  console.log('┌' + '─'.repeat(68) + '┐');
  console.log('│ 测试场景                    │ DOM │ React │ Toast │ AI    │ 总耗时 │');
  console.log('├' + '─'.repeat(68) + '┤');
  
  results.forEach(r => {
    const t = r.timing;
    const name = r.name.padEnd(26);
    const dom = String(t.domRender + 'ms').padEnd(4);
    const react = String(t.reactUpdate + 'ms').padEnd(6);
    const toast = String(t.toast + 'ms').padEnd(6);
    const ai = String(t.aiProcessing + 'ms').padEnd(6);
    const total = String(t.total + 'ms').padEnd(7);
    console.log(`│ ${name} │ ${dom} │ ${react} │ ${toast} │ ${ai} │ ${total} │`);
  });
  
  console.log('└' + '─'.repeat(68) + '┘');

  // 关键对比
  console.log('\n🎯 关键性能对比:\n');

  const fullWithAI = results.find(r => r.name.includes('完整模式 + AI开启') && !r.name.includes('长文本'));
  const fullWithoutAI = results.find(r => r.name.includes('完整模式 + AI关闭') && !r.name.includes('长文本'));
  const floatWithoutAI = results.find(r => r.name.includes('悬浮球模式 + AI关闭 ⚡') && !r.name.includes('长文本'));

  console.log('1. 完整模式对比：');
  console.log(`   • AI开启: ${fullWithAI.timing.total}ms`);
  console.log(`   • AI关闭: ${fullWithoutAI.timing.total}ms`);
  console.log(`   • 提速: ${(fullWithAI.timing.total / fullWithoutAI.timing.total).toFixed(2)}x\n`);

  console.log('2. 最优模式对比（AI关闭）：');
  console.log(`   • 完整模式:   ${fullWithoutAI.timing.total}ms`);
  console.log(`   • 悬浮球模式: ${floatWithoutAI.timing.total}ms`);
  console.log(`   • 提速: ${(fullWithoutAI.timing.total / floatWithoutAI.timing.total).toFixed(2)}x`);
  console.log(`   • 节省: ${fullWithoutAI.timing.total - floatWithoutAI.timing.total}ms\n`);

  // 内存占用估算
  console.log('💾 内存占用估算:');
  console.log('   • 完整模式:   ~80MB (500+ DOM节点)');
  console.log('   • 精简模式:   ~70MB (节点隐藏但存在)');
  console.log('   • 悬浮球模式: ~15MB (<10 DOM节点) ⭐\n');

  // 推荐建议
  console.log('💡 推荐配置:');
  console.log('   ┌─────────────────────────────────────────────┐');
  console.log('   │ 场景               │ 推荐配置                │');
  console.log('   ├─────────────────────────────────────────────┤');
  console.log('   │ 需要查看文本       │ 完整模式 + AI可选       │');
  console.log('   │ 快速输入           │ 悬浮球 + AI关闭 ⚡      │');
  console.log('   │ 长时间挂机使用     │ 悬浮球 + AI关闭         │');
  console.log('   │ 低配置电脑         │ 悬浮球模式              │');
  console.log('   └─────────────────────────────────────────────┘\n');

  console.log('='.repeat(70));
  console.log('🎉 测试完成！');
  console.log('='.repeat(70) + '\n');
}

// 执行测试
runTests().catch(console.error);

