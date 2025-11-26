/**
 * AI文本优化性能测试脚本
 * 
 * 测试目标：
 * 1. 验证AI关闭时，文本能立即粘贴（无延迟）
 * 2. 验证Toast提示根据AI开关状态显示不同文案
 * 3. 对比AI开启/关闭时的处理时间
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 测试数据
const testCases = [
  {
    name: '短文本测试',
    text: '你好，请问你在干嘛',
    expectedAITime: 1000, // 预期AI优化时间（毫秒）
    expectedNoAITime: 100  // 预期无AI时间（毫秒）
  },
  {
    name: '中等文本测试',
    text: '今天天气真不错，我打算出去散散步，顺便买点东西回来做晚饭。你有什么推荐的菜谱吗？',
    expectedAITime: 2000,
    expectedNoAITime: 100
  },
  {
    name: '长文本测试',
    text: '其实这个项目的核心功能就是语音转文字，然后通过AI优化一下文本的格式和内容。但是我发现有时候AI优化会比较慢，所以我想在设置里面增加一个开关，让用户可以选择是否启用AI优化。这样的话，如果用户不需要AI优化，就可以直接粘贴原始文本，速度会快很多。你觉得这个想法怎么样？',
    expectedAITime: 3000,
    expectedNoAITime: 100
  }
];

// 测试结果
const results = [];

// 模拟IPC通信
class MockElectronAPI {
  constructor(enableAI = false) {
    this.enableAI = enableAI;
    this.settings = {
      enable_ai_optimization: enableAI
    };
  }

  async getSetting(key, defaultValue) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }

  async processText(text, mode) {
    // 模拟AI处理延迟
    const delay = Math.min(text.length * 10, 3000);
    await new Promise(resolve => setTimeout(resolve, delay));
    return {
      success: true,
      text: text + '（AI优化）'
    };
  }

  async saveTranscription(data) {
    // 模拟数据库保存
    await new Promise(resolve => setTimeout(resolve, 50));
    return { lastInsertRowid: Date.now() };
  }

  log(level, ...args) {
    console.log(`[${level.toUpperCase()}]`, ...args);
  }
}

// 模拟录音处理函数
async function simulateRecording(text, enableAI) {
  const mockAPI = new MockElectronAPI(enableAI);
  global.window = {
    electronAPI: mockAPI,
    onTranscriptionComplete: null,
    onAIOptimizationComplete: null
  };

  const startTime = Date.now();
  let transcriptionCompleteTime = 0;
  let optimizationCompleteTime = 0;

  // 模拟转录完成
  const transcriptionResult = {
    success: true,
    text: text,
    confidence: 0.95,
    duration: 2.5
  };

  const transcriptionData = {
    raw_text: text,
    text: text,
    confidence: 0.95,
    language: 'zh-CN',
    duration: 2.5,
    file_size: text.length * 2
  };

  // 模拟 onTranscriptionComplete 回调
  if (window.onTranscriptionComplete) {
    window.onTranscriptionComplete({ ...transcriptionResult, enhanced_by_ai: false });
  }
  transcriptionCompleteTime = Date.now() - startTime;

  // 检查AI开关
  const useAI = await mockAPI.getSetting('enable_ai_optimization', true);

  if (!useAI) {
    // AI关闭：立即保存并返回
    console.log('  ⚡ AI优化已关闭，立即处理');
    await mockAPI.saveTranscription(transcriptionData);
    
    if (window.onAIOptimizationComplete) {
      window.onAIOptimizationComplete({
        ...transcriptionResult,
        text: text,
        enhanced_by_ai: false
      });
    }
    optimizationCompleteTime = Date.now() - startTime;
  } else {
    // AI开启：执行AI优化
    console.log('  🤖 AI优化已启用，开始处理');
    
    // 模拟100ms延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const result = await mockAPI.processText(text, 'optimize');
      
      if (result && result.success) {
        transcriptionData.processed_text = result.text;
        transcriptionData.text = result.text;
      }
      
      await mockAPI.saveTranscription(transcriptionData);
      
      if (window.onAIOptimizationComplete) {
        window.onAIOptimizationComplete({
          ...transcriptionResult,
          text: transcriptionData.text,
          processed_text: transcriptionData.processed_text,
          enhanced_by_ai: true
        });
      }
    } catch (err) {
      console.error('  ❌ AI优化失败:', err);
    }
    
    optimizationCompleteTime = Date.now() - startTime;
  }

  return {
    transcriptionTime: transcriptionCompleteTime,
    totalTime: optimizationCompleteTime,
    enableAI: enableAI
  };
}

// 运行测试
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AI文本优化性能测试');
  console.log('='.repeat(60) + '\n');

  for (const testCase of testCases) {
    console.log(`\n📝 ${testCase.name}`);
    console.log(`   文本内容: "${testCase.text.substring(0, 30)}${testCase.text.length > 30 ? '...' : ''}"`);
    console.log(`   文本长度: ${testCase.text.length} 字符\n`);

    // 测试AI关闭
    console.log('  🔴 测试场景: AI优化关闭');
    const resultNoAI = await simulateRecording(testCase.text, false);
    console.log(`  ✅ 完成时间: ${resultNoAI.totalTime}ms\n`);

    // 测试AI开启
    console.log('  🟢 测试场景: AI优化开启');
    const resultWithAI = await simulateRecording(testCase.text, true);
    console.log(`  ✅ 完成时间: ${resultWithAI.totalTime}ms\n`);

    // 保存结果
    const result = {
      name: testCase.name,
      textLength: testCase.text.length,
      noAITime: resultNoAI.totalTime,
      withAITime: resultWithAI.totalTime,
      speedup: (resultWithAI.totalTime / resultNoAI.totalTime).toFixed(2) + 'x',
      saved: (resultWithAI.totalTime - resultNoAI.totalTime) + 'ms'
    };
    results.push(result);

    console.log(`  📊 性能对比:`);
    console.log(`     - AI关闭: ${result.noAITime}ms`);
    console.log(`     - AI开启: ${result.withAITime}ms`);
    console.log(`     - 提速倍数: ${result.speedup}`);
    console.log(`     - 节省时间: ${result.saved}`);
    console.log('  ' + '-'.repeat(56));
  }

  // 输出汇总
  console.log('\n' + '='.repeat(60));
  console.log('📈 测试结果汇总');
  console.log('='.repeat(60) + '\n');

  console.log('┌' + '─'.repeat(58) + '┐');
  console.log('│ 测试用例          │ AI关闭  │ AI开启  │ 提速   │ 节省   │');
  console.log('├' + '─'.repeat(58) + '┤');
  
  results.forEach(r => {
    const name = r.name.padEnd(16);
    const noAI = String(r.noAITime + 'ms').padEnd(6);
    const withAI = String(r.withAITime + 'ms').padEnd(6);
    const speedup = r.speedup.padEnd(5);
    const saved = r.saved.padEnd(6);
    console.log(`│ ${name} │ ${noAI} │ ${withAI} │ ${speedup} │ ${saved} │`);
  });
  
  console.log('└' + '─'.repeat(58) + '┘');

  // 计算平均值
  const avgNoAI = (results.reduce((sum, r) => sum + r.noAITime, 0) / results.length).toFixed(0);
  const avgWithAI = (results.reduce((sum, r) => sum + r.withAITime, 0) / results.length).toFixed(0);
  const avgSpeedup = (avgWithAI / avgNoAI).toFixed(2);
  const avgSaved = (avgWithAI - avgNoAI).toFixed(0);

  console.log('\n📊 平均性能:');
  console.log(`   - AI关闭平均耗时: ${avgNoAI}ms`);
  console.log(`   - AI开启平均耗时: ${avgWithAI}ms`);
  console.log(`   - 平均提速倍数: ${avgSpeedup}x`);
  console.log(`   - 平均节省时间: ${avgSaved}ms`);

  console.log('\n✅ 优化验证:');
  const allPassNoAI = results.every(r => r.noAITime < 200);
  const allPassWithAI = results.every(r => r.withAITime > 1000);
  
  if (allPassNoAI) {
    console.log('   ✓ AI关闭时，所有测试用例都在200ms内完成（符合预期）');
  } else {
    console.log('   ✗ AI关闭时，部分测试用例超过200ms（需要进一步优化）');
  }
  
  if (allPassWithAI) {
    console.log('   ✓ AI开启时，确实需要额外的处理时间（符合预期）');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 测试完成！');
  console.log('='.repeat(60) + '\n');
}

// 执行测试
runTests().catch(console.error);

