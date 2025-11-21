# 置顶按钮功能与AI提示逻辑修复

## 实现日期
2025-11-21

## 任务1：主窗口置顶功能按钮

### 功能描述
在主窗口添加置顶功能按钮，位于历史记录按钮左侧，允许用户自由控制窗口是否置顶。

### 实现细节

#### 前端 (src/App.jsx)
1. **图标导入**：从 lucide-react 导入 `Pin` 图标
2. **状态管理**：
   - 添加 `isAlwaysOnTop` 状态，默认为 false
   - 通过 `useEffect` 从数据库加载保存的置顶状态
3. **切换函数**：
   - `toggleAlwaysOnTop()` 函数处理置顶状态切换
   - 调用 IPC 接口设置窗口置顶状态
   - 保存状态到数据库（键：`mainWindowAlwaysOnTop`）
   - 显示 toast 提示反馈
4. **UI组件**：
   - 置顶按钮位于历史记录按钮左侧
   - 图标颜色：蓝色（置顶）/ 灰色（非置顶）
   - Tooltip 提示："窗口置顶" / "取消置顶"

#### IPC 通信 (preload.js)
- 添加 `setMainWindowAlwaysOnTop(value)` 接口

#### 主进程处理 (src/helpers/ipcHandlers.js)
- 添加 `set-main-window-always-on-top` IPC 处理器
- 调用 `mainWindow.setAlwaysOnTop(value)` 设置窗口置顶

#### 窗口管理器 (src/helpers/windowManager.js)
- 将主窗口默认 `alwaysOnTop` 从 `true` 改为 `false`
- 由用户通过按钮控制置顶状态

### 用户体验
- 默认状态：不置顶（避免遮挡其他窗口）
- 状态持久化：关闭应用后重新打开，记住上次的置顶状态
- 视觉反馈：按钮颜色变化 + toast 提示
- 仅针对主窗口，不影响其他窗口（历史记录、设置等）

---

## 任务2：AI优化提示逻辑修复

### 问题描述
当 AI 文本优化功能关闭时，主窗口仍然弹出"AI优化失败，已粘贴原始识别文本"提示，这不合逻辑且降低效率。

### 解决方案

#### 修改 App.jsx 中的 AI 优化完成回调
在 `handleAIOptimizationComplete` 函数中：
1. 读取 AI 优化设置状态（`enable_ai_optimization`）
2. 根据设置状态显示不同的提示：
   - **AI 已启用但失败**：显示 "AI优化失败，已粘贴原始识别文本"（info）
   - **AI 已关闭**：显示 "已粘贴识别文本"（success）

#### 设置键统一
确认所有地方使用统一的设置键 `enable_ai_optimization`：
- `useRecording.js`：读取设置判断是否调用 AI
- `App.jsx`：读取设置判断显示哪种提示
- `settings.jsx`：完整设置页面
- `SettingsPanel.jsx`：快速设置面板

### 历史记录窗口
历史记录窗口 (src/history.jsx) 的显示逻辑已经是合理的：
- 根据 `processed_text` 是否存在判断是否显示"AI优化"部分
- 区分"最终结果"、"AI优化"、"原始识别"三个部分
- 无需修改

### 验收标准
- ✅ AI 优化关闭时，直接显示"已粘贴识别文本"，不提及 AI
- ✅ AI 优化开启但失败时，显示"AI优化失败，已粘贴原始识别文本"
- ✅ 历史记录窗口正确区分有/无 AI 优化的记录

---

## 技术要点

### 状态持久化
- 使用数据库设置表存储用户偏好
- 键名：`mainWindowAlwaysOnTop`（布尔值）
- 通过 `getSetting` / `setSetting` IPC 接口读写

### IPC 通信模式
- 前端调用：`window.electronAPI.setMainWindowAlwaysOnTop(value)`
- 主进程处理：`ipcMain.handle("set-main-window-always-on-top", ...)`
- 返回值：`true` 表示成功

### 条件提示逻辑
```javascript
if (useAI) {
  // AI 已启用但失败
  toast.info("AI优化失败，已粘贴原始识别文本");
} else {
  // AI 已关闭
  toast.success("已粘贴识别文本");
}
```

---

## 相关文件
- `src/App.jsx`：主窗口组件，置顶按钮 UI 和 AI 提示逻辑
- `preload.js`：IPC 接口定义
- `src/helpers/ipcHandlers.js`：IPC 处理器
- `src/helpers/windowManager.js`：窗口管理器，默认置顶状态
- `src/hooks/useRecording.js`：录音和 AI 优化流程
- `src/history.jsx`：历史记录窗口
- `src/settings.jsx`：完整设置页面
- `src/components/SettingsPanel.jsx`：快速设置面板

---

## 测试要点
1. 置顶按钮点击后图标颜色正确变化（蓝色/灰色）
2. 置顶状态正确应用到窗口（窗口保持在最前/允许被遮挡）
3. 关闭应用后重新打开，置顶状态被正确恢复
4. AI 优化关闭时，提示为"已粘贴识别文本"
5. AI 优化开启但失败时，提示为"AI优化失败，已粘贴原始识别文本"
6. 历史记录窗口正确显示有/无 AI 优化的记录
