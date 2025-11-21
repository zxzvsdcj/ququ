# 托盘菜单优化实现

## 实现日期
2025-11-14

## 用户需求
1. 在托盘菜单添加"设置"选项
2. 修复"控制面板"和"关于"菜单项无响应的问题
3. 实现启动后直接进入托盘，不在桌面显示主窗口

## 实现方案

### 1. 托盘菜单添加"设置"选项

**修改文件**: `src/helpers/tray.js`

**实现内容**:
- 在"控制面板"和"关于"之间添加"设置"菜单项
- 通过回调函数 `openSettingsCallback` 调用设置窗口
- 菜单顺序：显示主窗口 → 控制面板 → [分隔线] → **设置** → 关于 → [分隔线] → 退出

**代码变更**:
```javascript
{
  label: "设置",
  click: () => {
    if (this.openSettingsCallback) {
      this.openSettingsCallback();
    }
  }
}
```

**修改文件**: `main.js`

**实现内容**:
- 在托盘管理器中注册 `openSettingsCallback` 回调
- 回调函数调用 `windowManager.showSettingsWindow()`

**代码变更**:
```javascript
trayManager.openSettingsCallback = () => {
  windowManager.showSettingsWindow();
};
```

---

### 2. 修复"关于"菜单项无响应

**修改文件**: `src/helpers/tray.js`

**问题原因**:
- 原代码中"关于"菜单项只有 `// TODO: 显示关于对话框` 注释
- 没有实际实现

**解决方案**:
- 添加回调函数支持 `showAboutCallback`
- 提供默认实现：使用 Electron 的 `dialog.showMessageBox` 显示关于信息

**代码变更**:
```javascript
{
  label: "关于",
  click: () => {
    if (this.showAboutCallback) {
      this.showAboutCallback();
    } else {
      // 显示简单的关于对话框
      const { dialog } = require("electron");
      dialog.showMessageBox({
        type: "info",
        title: "关于蛐蛐",
        message: "蛐蛐 (QuQu)",
        detail: "基于FunASR和AI的中文语音转文字应用\n\n• 高精度中文语音识别\n• AI智能文本优化\n• 实时语音处理\n• 隐私保护设计",
        buttons: ["确定"]
      });
    }
  }
}
```

---

### 3. 修复"控制面板"菜单项无响应

**修改文件**: `src/helpers/tray.js`

**问题原因**:
- 原代码在创建控制面板后没有调用 `.focus()` 方法
- 窗口创建了但没有获得焦点

**解决方案**:
- 在 `createControlPanelCallback` 的 Promise 回调中添加 `.focus()` 调用

**代码变更**:
```javascript
{
  label: "控制面板",
  click: () => {
    if (this.controlPanelWindow) {
      this.controlPanelWindow.show();
      this.controlPanelWindow.focus(); // 已有
    } else if (this.createControlPanelCallback) {
      this.createControlPanelCallback().then(() => {
        if (this.controlPanelWindow) {
          this.controlPanelWindow.show();
          this.controlPanelWindow.focus(); // 新增
        }
      });
    }
  }
}
```

---

### 4. 启动后直接进入托盘

**修改文件**: `src/helpers/windowManager.js`

**实现内容**:
- 为 `createMainWindow` 方法添加 `showWindow` 参数（默认 `true`）
- 在 BrowserWindow 配置中添加 `show: showWindow` 选项
- 当窗口已存在时，根据参数决定是否显示

**代码变更**:
```javascript
async createMainWindow(showWindow = true) {
  if (this.mainWindow) {
    if (showWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
    return this.mainWindow;
  }

  this.mainWindow = new BrowserWindow({
    // ... 其他配置
    show: showWindow, // 根据参数决定是否显示
    // ...
  });
  // ...
}
```

**修改文件**: `main.js`

**实现内容**:
- 启动时调用 `createMainWindow(false)` 创建但不显示主窗口
- 窗口在后台加载，用户通过托盘图标手动显示

**代码变更**:
```javascript
// 创建主窗口（启动时不显示，只在后台加载）
try {
  logger.info('创建主窗口（后台模式）...');
  await windowManager.createMainWindow(false); // false = 不显示窗口
  logger.info('主窗口创建成功（已隐藏）');
} catch (error) {
  logger.error("创建主窗口时出错:", error);
}
```

---

## 用户交互方式

### 显示主窗口的方式
1. **点击托盘图标**（左键单击）
   - 窗口隐藏时 → 显示窗口
   - 窗口显示时 → 隐藏窗口（切换模式）

2. **托盘右键菜单 → "显示主窗口"**
   - 始终显示并聚焦主窗口

### 打开设置的方式
1. **主窗口右上角设置按钮**（⚙️）
2. **托盘右键菜单 → "设置"**（新增）

### 托盘菜单完整结构
```
显示主窗口
控制面板
─────────────
设置          ← 新增
关于          ← 已修复
─────────────
退出
```

---

## 技术要点

### 1. 回调函数模式
使用回调函数解耦托盘管理器和窗口管理器：
- `openSettingsCallback`: 打开设置窗口
- `showAboutCallback`: 显示关于对话框（可选，有默认实现）
- `createControlPanelCallback`: 创建控制面板窗口（已有）

### 2. 窗口显示控制
- BrowserWindow 的 `show` 选项控制初始显示状态
- 使用 `show()`、`hide()`、`focus()` 方法控制窗口状态
- `isVisible()` 方法检查窗口是否可见

### 3. Electron Dialog API
使用 `dialog.showMessageBox` 显示模态对话框：
- `type`: 对话框类型（info/warning/error/question）
- `title`: 标题
- `message`: 主要消息
- `detail`: 详细信息
- `buttons`: 按钮数组

---

## 测试验证

### 测试步骤
1. **启动测试**
   - 启动应用
   - 确认桌面上没有显示主窗口
   - 确认托盘区有蛐蛐图标

2. **托盘图标点击测试**
   - 左键单击托盘图标 → 主窗口显示
   - 再次左键单击 → 主窗口隐藏
   - 再次左键单击 → 主窗口显示

3. **托盘菜单测试**
   - 右键托盘图标
   - 点击"显示主窗口" → 主窗口显示并聚焦
   - 点击"控制面板" → 控制面板窗口显示
   - 点击"设置" → 设置窗口显示
   - 点击"关于" → 显示关于对话框
   - 点击"退出" → 应用退出

4. **设置窗口测试**
   - 从托盘菜单打开设置
   - 从主窗口打开设置
   - 确认两种方式打开的是同一个窗口

---

## 相关文件
- `src/helpers/tray.js`: 托盘管理器（菜单结构和回调）
- `src/helpers/windowManager.js`: 窗口管理器（窗口创建和显示控制）
- `main.js`: 主进程入口（回调注册和启动配置）

## 用户体验提升
1. ✅ 启动后不遮挡桌面，应用静默运行在托盘
2. ✅ 快速访问设置（托盘右键 → 设置）
3. ✅ 修复了菜单项无响应的问题
4. ✅ 提供了关于信息的快速查看方式
5. ✅ 保持了原有的所有功能（显示主窗口、控制面板、退出）