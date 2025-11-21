# 控制面板Bug修复

## 修复日期
2025-11-14

## 问题描述

用户报告了两个关键问题：

### 问题1：控制面板显示"模型未就绪"
- **现象**：打开控制面板时显示"模型未就绪，请稍候..."
- **实际情况**：模型已经就绪并正常工作
- **影响**：用户无法使用控制面板功能

### 问题2：控制面板关闭后无法再次打开
- **现象**：
  1. 第一次从托盘菜单打开控制面板 → 正常显示
  2. 关闭控制面板窗口
  3. 再次从托盘菜单点击"控制面板" → 没有任何反应
- **影响**：用户必须重启应用才能再次使用控制面板

---

## 问题根源分析

### 问题1根源：模型状态检查被跳过

**位置**：`src/hooks/useModelStatus.js` 第233-237行和第244行

**原因**：
```javascript
// 错误的逻辑
useEffect(() => {
  if (isControlPanelOrSettings()) {
    console.log('控制面板或设置页面，跳过模型状态检查');
    return; // ❌ 直接返回，不检查模型状态
  }
  checkModelStatus();
}, [checkModelStatus]);
```

**分析**：
- 原设计意图：减少控制面板和设置页面的资源消耗
- 副作用：控制面板永远不会检查模型状态
- 结果：`modelStatus.isReady` 始终为 `false`
- 导致：界面显示"模型未就绪"

---

### 问题2根源：窗口引用未更新

**位置**：`src/helpers/tray.js` 第92-107行

**原因**：
```javascript
// 错误的逻辑
{
  label: "控制面板",
  click: () => {
    if (this.controlPanelWindow) {
      // ❌ 使用托盘管理器中缓存的窗口引用
      this.controlPanelWindow.show();
      this.controlPanelWindow.focus();
    } else if (this.createControlPanelCallback) {
      // 只在窗口不存在时创建
    }
  }
}
```

**分析**：
1. 窗口创建时，`windowManager.controlPanelWindow` 被赋值
2. 托盘管理器通过 `setWindows()` 获取窗口引用
3. 用户关闭窗口时，触发 `closed` 事件
4. `windowManager.controlPanelWindow` 被设置为 `null`
5. **但是**托盘管理器中的 `this.controlPanelWindow` 仍然指向旧对象
6. 再次点击菜单时，条件 `if (this.controlPanelWindow)` 为 `true`
7. 尝试调用 `show()` 方法，但窗口已销毁 → 无效操作

---

## 修复方案

### 修复1：允许控制面板检查模型状态

**修改文件**：`src/hooks/useModelStatus.js`

**修改前**：
```javascript
// 初始化时检查状态
useEffect(() => {
  if (isControlPanelOrSettings()) {
    console.log('控制面板或设置页面，跳过模型状态检查');
    return; // ❌ 跳过检查
  }
  checkModelStatus();
}, [checkModelStatus]);

// 设置定期检查（仅在主窗口且模型未就绪时）
useEffect(() => {
  if (isControlPanelOrSettings() || modelStatus.isReady || modelStatus.isDownloading) {
    return; // ❌ 控制面板不进行定期检查
  }
  // ...
}, [modelStatus.isReady, modelStatus.isDownloading, checkModelStatus]);
```

**修改后**：
```javascript
// 初始化时检查状态
useEffect(() => {
  checkModelStatus(); // ✅ 所有窗口都检查
}, [checkModelStatus]);

// 设置定期检查（所有窗口都检查，但频率不同）
useEffect(() => {
  if (modelStatus.isReady || modelStatus.isDownloading) {
    return;
  }

  // 控制面板和设置页面使用较长的检查间隔（减少资源消耗）
  const interval = isControlPanelOrSettings() ? 5000 : 3000;
  
  const timer = setInterval(() => {
    if (!modelStatus.isReady && !modelStatus.isDownloading) {
      checkModelStatus();
    }
  }, interval);

  return () => clearInterval(timer);
}, [modelStatus.isReady, modelStatus.isDownloading, checkModelStatus]);
```

**改进点**：
1. ✅ 移除了跳过检查的逻辑
2. ✅ 所有窗口都会检查模型状态
3. ✅ 控制面板使用5秒间隔（vs 主窗口3秒）
4. ✅ 平衡了功能性和资源消耗

---

### 修复2：始终通过回调获取最新窗口引用

**修改文件**：`src/helpers/tray.js`

**修改前**：
```javascript
{
  label: "控制面板",
  click: () => {
    if (this.controlPanelWindow) {
      // ❌ 使用缓存的引用
      this.controlPanelWindow.show();
      this.controlPanelWindow.focus();
    } else if (this.createControlPanelCallback) {
      // 只在引用为空时创建
      this.createControlPanelCallback().then(() => {
        if (this.controlPanelWindow) {
          this.controlPanelWindow.show();
          this.controlPanelWindow.focus();
        }
      });
    }
  }
}
```

**修改后**：
```javascript
{
  label: "控制面板",
  click: () => {
    // ✅ 始终通过回调函数来处理，确保获取最新的窗口引用
    if (this.createControlPanelCallback) {
      this.createControlPanelCallback().then((window) => {
        if (window) {
          window.show();
          window.focus();
        }
      });
    }
  }
}
```

**改进点**：
1. ✅ 移除了对缓存引用的依赖
2. ✅ 始终通过回调函数获取窗口
3. ✅ `createControlPanelWindow()` 方法会自动处理：
   - 窗口存在 → 返回现有窗口并聚焦
   - 窗口不存在 → 创建新窗口
4. ✅ 使用回调返回的窗口对象，确保引用有效

---

## 技术要点

### 1. 窗口生命周期管理
```javascript
// windowManager.js
async createControlPanelWindow() {
  if (this.controlPanelWindow) {
    this.controlPanelWindow.focus(); // 窗口存在，聚焦
    return this.controlPanelWindow;
  }
  
  // 创建新窗口
  this.controlPanelWindow = new BrowserWindow({...});
  
  // 监听关闭事件
  this.controlPanelWindow.on("closed", () => {
    this.controlPanelWindow = null; // 清空引用
  });
  
  return this.controlPanelWindow;
}
```

### 2. 回调函数模式的优势
- **解耦**：托盘管理器不直接持有窗口引用
- **动态**：每次调用都获取最新状态
- **可靠**：避免引用失效问题

### 3. 模型状态检查策略
- **主窗口**：3秒间隔检查（频繁，快速响应）
- **控制面板/设置**：5秒间隔检查（降低资源消耗）
- **已就绪/下载中**：停止检查（避免不必要的请求）

---

## 测试验证

### 测试步骤1：模型状态显示
1. 确保模型已下载并就绪
2. 从托盘菜单打开控制面板
3. ✅ 确认显示正确的模型状态（不是"模型未就绪"）
4. ✅ 确认录音按钮可用

### 测试步骤2：重复打开控制面板
1. 从托盘菜单打开控制面板 → 窗口显示
2. 关闭控制面板窗口
3. 再次从托盘菜单打开控制面板 → ✅ 窗口再次显示
4. 重复步骤2-3多次 → ✅ 每次都能正常打开

### 测试步骤3：窗口焦点
1. 打开控制面板
2. 点击其他窗口（失去焦点）
3. 从托盘菜单再次点击"控制面板"
4. ✅ 确认窗口获得焦点并置顶

---

## 相关文件
- `src/hooks/useModelStatus.js`：模型状态监控（修复检查逻辑）
- `src/helpers/tray.js`：托盘菜单（修复窗口引用）
- `src/helpers/windowManager.js`：窗口管理（生命周期处理）

## 经验教训

### 1. 避免缓存窗口引用
- ❌ 不要在外部组件中缓存窗口对象
- ✅ 使用回调函数动态获取窗口引用
- ✅ 让窗口管理器负责生命周期管理

### 2. 资源优化要谨慎
- ❌ 完全跳过检查可能导致功能失效
- ✅ 使用不同的检查频率来平衡性能和功能
- ✅ 在模型就绪后停止检查

### 3. 窗口事件处理
- ✅ 监听 `closed` 事件清理引用
- ✅ 使用 `show()` 和 `focus()` 组合确保可见性
- ✅ 检查窗口是否存在再操作