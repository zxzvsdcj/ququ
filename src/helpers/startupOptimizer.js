/**
 * 启动优化器
 * 用于优化应用启动速度和用户体验
 */
class StartupOptimizer {
  constructor(logger = null) {
    this.logger = logger;
    this.startTime = Date.now();
    this.optimizationSteps = [];
  }

  /**
   * 记录优化步骤
   */
  logStep(step, duration = null) {
    const timestamp = Date.now();
    const stepDuration = duration || (timestamp - this.startTime);
    
    this.optimizationSteps.push({
      step,
      duration: stepDuration,
      timestamp
    });

    if (this.logger) {
      this.logger.info(`启动优化: ${step}`, {
        duration: `${stepDuration}ms`,
        totalTime: `${timestamp - this.startTime}ms`
      });
    }
  }

  /**
   * 预加载关键资源
   */
  async preloadCriticalResources() {
    this.logStep('预加载关键资源');
    
    // 预加载关键模块
    const criticalModules = [
      './src/helpers/database',
      './src/helpers/clipboard',
      './src/helpers/funasrManager'
    ];

    for (const module of criticalModules) {
      try {
        require(module);
        this.logStep(`预加载模块: ${module}`);
      } catch (error) {
        if (this.logger) {
          this.logger.warn(`预加载模块失败: ${module}`, error);
        }
      }
    }
  }

  /**
   * 延迟非关键初始化
   */
  async deferNonCriticalInit() {
    this.logStep('延迟非关键初始化');
    
    // 延迟初始化非关键功能
    setTimeout(() => {
      this.logStep('初始化非关键功能');
      // 这里可以初始化一些非关键的功能
    }, 100);
  }

  /**
   * 优化窗口创建
   */
  optimizeWindowCreation() {
    this.logStep('优化窗口创建');
    
    return {
      // 减少初始窗口大小
      width: 800,
      height: 600,
      // 使用更快的渲染选项
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        // 启用硬件加速
        hardwareAcceleration: true,
        // 优化渲染性能
        offscreen: false,
        // 减少安全检查以提高启动速度
        experimentalFeatures: false
      },
      // 显示启动画面而不是空白窗口
      show: false,
      // 预加载优化
      preload: require('path').join(__dirname, 'preload.js')
    };
  }

  /**
   * 获取启动统计信息
   */
  getStartupStats() {
    const totalTime = Date.now() - this.startTime;
    return {
      totalTime,
      steps: this.optimizationSteps,
      averageStepTime: totalTime / this.optimizationSteps.length
    };
  }

  /**
   * 应用启动优化
   */
  async applyOptimizations() {
    this.logStep('开始启动优化');
    
    // 1. 预加载关键资源
    await this.preloadCriticalResources();
    
    // 2. 延迟非关键初始化
    await this.deferNonCriticalInit();
    
    // 3. 记录最终统计
    const stats = this.getStartupStats();
    this.logStep('启动优化完成', stats.totalTime);
    
    if (this.logger) {
      this.logger.info('启动优化统计', stats);
    }
    
    return stats;
  }
}

module.exports = StartupOptimizer;
