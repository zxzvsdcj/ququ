# Electron透明窗口开发经验总结（2025-11-26）

## 🔴 最关键的教训：Windows透明窗口必须禁用GPU加速

这是解决Windows上透明窗口显示白色背景/标题栏的**唯一可靠方法**：

```javascript
// main.js - 必须在app初始化前执行
if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
}
```

### 尝试过但无效的方法
- `thickFrame: false` - 无效
- `type: 'toolbar'` - 无效
- `backgroundColor: '#00000000'` - 无效
- `titleBarStyle` 各种值 - 无效
- CSS `background: transparent !important` - 单独使用无效

### 正确的窗口配置
```javascript
const windowConfig = {
  frame: false,           // 无边框
  transparent: true,      // 透明
  hasShadow: false,       // 无阴影
  show: false,            // 先隐藏
  // 不要添加 type、thickFrame、backgroundColor 等
  webPreferences: { ... }
};
```

## 🔴 React闭包陷阱：useEffect中的事件监听器

### 问题
useEffect中注册的事件监听器会捕获注册时的状态值，后续状态更新不会反映到监听器中。

### 错误示例
```javascript
useEffect(() => {
  const handler = () => {
    if (isRecording) stopRecording(); // isRecording永远是初始值！
  };
  window.api.onEvent(handler);
}, []); // 空依赖，handler永远捕获初始状态
```

### 正确做法：使用useRef
```javascript
const stateRef = useRef({ isRecording });

useEffect(() => {
  stateRef.current = { isRecording };
}, [isRecording]);

useEffect(() => {
  const handler = () => {
    const { isRecording } = stateRef.current; // 始终获取最新状态
    if (isRecording) stopRecording();
  };
  const remove = window.api.onEvent(handler);
  return () => remove();
}, [stopRecording]); // 只依赖函数引用
```

## 🔴 多窗口IPC事件分发

### 问题
快捷键事件只发送到主窗口，悬浮球窗口收不到。

### 解决方案
```javascript
// 向所有窗口广播事件
BrowserWindow.getAllWindows().forEach(win => {
  if (win && !win.isDestroyed()) {
    win.webContents.send("hotkey-triggered", { hotkey });
  }
});
```

## 🔴 窗口关闭与应用退出区分

### 问题
悬浮球close事件使用`e.preventDefault()`阻止了所有关闭，包括app.quit()。

### 解决方案
```javascript
// main.js
app.on("before-quit", () => { app.isQuitting = true; });

// windowManager.js
window.on("close", (e) => {
  if (!app.isQuitting) {
    e.preventDefault();
    window.hide();
  }
});
```

## 🟡 样式最佳实践

### 内联样式更可靠
当React动态渲染时，HTML中定义的CSS类可能不生效。将样式内联到JSX中更可靠：

```jsx
<div style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  animation: 'pulse 1.5s ease-in-out infinite',
}}>
```

### 动画定义
使用内联`<style>`标签定义keyframes：
```jsx
<>
  <style>{`
    @keyframes pulse { ... }
    @keyframes wave { ... }
  `}</style>
  <div style={{ animation: 'pulse 1.5s infinite' }}>...</div>
</>
```

## 🟡 Vite开发模式注意事项

Vite在开发模式下会注入元素（如error overlay），需要主动移除：

```javascript
// 在did-finish-load事件中执行
document.querySelectorAll('vite-error-overlay').forEach(el => el.remove());
```

## 📋 完整的透明悬浮球配置清单

1. ✅ main.js: 禁用GPU加速（Windows）
2. ✅ BrowserWindow: frame:false, transparent:true, hasShadow:false
3. ✅ HTML: background:transparent, 空title
4. ✅ CSS: 所有元素background:transparent
5. ✅ React: 使用useRef避免闭包问题
6. ✅ IPC: 事件广播到所有窗口
7. ✅ 关闭: 区分隐藏和退出
8. ✅ Vite: 移除注入元素
