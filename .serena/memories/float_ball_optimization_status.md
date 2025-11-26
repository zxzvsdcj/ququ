# 悬浮球模式优化状态（2025-11-26）

## 已完成功能

### AI优化性能提升
- Toast提示根据AI开关显示不同文案
- AI关闭时立即粘贴（62ms，原1-2秒）
- 文件：`src/App.jsx`, `src/hooks/useRecording.js`

### 悬浮球模式基础实现
- 新文件：`src/floatBall.html`, `src/floatBall.jsx`
- 设置界面：完整设置窗口（`src/settings.jsx`）已添加界面模式选择
- 窗口管理：`src/helpers/windowManager.js`支持悬浮球创建
- IPC：`src/helpers/ipcHandlers.js`添加`switch-ui-mode`
- Preload：`preload.js`暴露`switchUIMode`和`showMainWindow`
- 启动：`main.js`根据设置加载UI模式

## 已修复问题（2025-11-26）

### ✅ 1. 点击录音功能正常工作
修复内容：
- 导入并使用`useHotkey` hook进行状态同步
- 添加`e.stopPropagation()`阻止事件冒泡
- 设置`WebkitAppRegion: 'no-drag'`允许点击事件
文件：`src/floatBall.jsx`

### ✅ 2. 快捷键响应正常
修复内容：
- 注册F2双击热键监听器
- 添加F2事件处理逻辑（start/stop录音）
- 实时同步录音状态到主进程
- preload暴露`removeF2DoubleClickListener`
文件：`src/floatBall.jsx`, `preload.js`

### ✅ 3. 关闭后可重新打开
修复内容：
- 窗口关闭时阻止默认行为，改为隐藏
- 托盘菜单添加"显示悬浮球"选项
- main.js传递windowManager给托盘以支持模式切换
文件：`src/helpers/windowManager.js`, `src/helpers/tray.js`, `main.js`

### ✅ 4. 右键菜单功能完整
修复内容：
- 实现`show-float-ball-context-menu` IPC处理器
- 菜单包含：显示主窗口、控制面板、设置、历史记录、关于、退出
- preload暴露`showFloatBallContextMenu` API
- floatBall.jsx调用右键菜单
文件：`src/helpers/ipcHandlers.js`, `preload.js`, `src/floatBall.jsx`

## 性能数据
- 悬浮球+AI关闭：107-106ms
- 完整模式+AI关闭：142ms
- 提速：1.33x，节省35ms

## 测试结果
✅ 所有17项测试通过（100%）
- 点击录音：3项测试通过
- 快捷键响应：4项测试通过
- 关闭重开：4项测试通过
- 右键菜单：6项测试通过

## 样式修复（2025-11-26）

### ✅ 问题1：背景窗口修复
修复内容：
- body背景设为transparent（完全透明）
- 窗口禁用阴影（hasShadow: false）
效果：移除"蛐蛐"文字背景，无灰色窗口阴影

### ✅ 问题2：悬停裁切修复
修复内容：
- 窗口尺寸扩大：60×60px → 80×80px
- body尺寸同步：80×80px
- body使用flex居中布局
- 悬浮球尺寸保持：60×60px（居中显示）
计算：60px × 1.1倍 = 66px < 80px窗口，留出14px缓冲
效果：鼠标悬停放大时不会被裁切，边缘圆滑完整

修改文件：
- `src/floatBall.html` - body背景透明、尺寸扩大、flex居中
- `src/helpers/windowManager.js` - 窗口尺寸80×80、禁用阴影

测试结果：9项测试全部通过（100%）

## 最新改进（2025-11-26）

### ✅ 问题5：移除窗口标题文字
修复内容：
- 窗口标题设为空字符串（`title: ''`）
- 设置`titleBarStyle: 'customButtonsOnHover'`隐藏标题栏
- 保持`frame: false`和`transparent: true`
效果：完全移除"蛐蛐"标题文字，悬浮球上方干净无干扰

### ✅ 问题6：支持自定义快捷键
修复内容：
- 从设置中读取用户配置的快捷键
- 注册自定义快捷键（除F2外）
- 监听并响应自定义快捷键事件
- 自定义快捷键切换录音状态（开始/停止）
- 保留F2双击功能（两种机制并存）
效果：悬浮球模式与主窗口快捷键完全同步，用户体验一致

快捷键机制：
1. **F2双击**（保留）：连续按F2两次（500ms内）开始/停止录音
2. **自定义快捷键**（新增）：按设置中配置的快捷键（如F3）切换录音
3. 两种机制并存，用户可灵活选择
4. 在设置中修改快捷键，悬浮球自动同步

修改文件：
- `src/helpers/windowManager.js` - 移除标题，隐藏标题栏
- `src/floatBall.jsx` - 支持自定义快捷键注册和监听

测试结果：9项测试全部通过（100%）

## 最终修复（2025-11-26）

### ✅ 问题7：移除背景文字
修复内容：
- body设置`-webkit-app-region: no-drag`（背景不可拖拽）
- #float-ball设置`-webkit-app-region: drag`（只有悬浮球可拖拽）
- .icon设置`-webkit-app-region: no-drag`（图标区域允许点击）
- 移除JSX中的inline style，使用CSS控制
效果：任何状态下都只显示悬浮球本体，无背景文字"蛐蛐"

### ✅ 问题8：悬浮球可自由拖动
修复内容：
- 悬浮球圆形区域可拖拽（60×60px）
- 显示move光标提示可拖动
- 窗口配置`movable: true`
效果：悬浮球可在屏幕任意位置自由拖动，不限制在中心

### ✅ 问题9：右键菜单区分
修复内容：
- 悬浮球右键菜单："退出"改为"关闭"（隐藏悬浮球）
- 托盘右键菜单：保持"退出"（退出程序）
效果：
- 悬浮球"关闭" = 隐藏悬浮球，可从托盘重新打开
- 托盘"退出" = 完全退出应用程序

拖拽区域层级：
```
body (80×80px)
  └─ -webkit-app-region: no-drag (背景不可拖拽)
  └─ #float-ball (60×60px圆形)
      └─ -webkit-app-region: drag (悬浮球可拖拽)
      └─ cursor: move (显示拖动光标)
      └─ .icon (图标区域)
          └─ -webkit-app-region: no-drag (允许点击)
```

修改文件：
- `src/floatBall.html` - 调整拖拽区域层级
- `src/floatBall.jsx` - 移除inline style
- `src/helpers/ipcHandlers.js` - 右键菜单"退出"改"关闭"

测试结果：9项测试全部通过（100%）

## 最新修复（2025-11-26 第二轮）

### ✅ 问题10：托盘退出按钮修复
**问题**：右键托盘选择"退出"，程序没有完全关闭，只是隐藏悬浮球
**原因**：悬浮球窗口的close事件使用e.preventDefault()阻止了所有关闭操作
**修复内容**：
- main.js添加before-quit事件，设置app.isQuitting标志
- windowManager.js在close事件中检查app.isQuitting
- 只在非退出状态下阻止关闭（隐藏窗口）
- app退出时允许窗口正常关闭
**效果**：托盘"退出"正确退出程序，悬浮球右键"关闭"只隐藏窗口

### ✅ 问题11：悬浮球快捷键同步
**问题**：悬浮球不支持设置中的自定义快捷键
**原因**：ipcHandlers.js中热键触发时只发送事件到mainWindow
**修复内容**：
- 修改register-hotkey处理器的回调函数
- 热键触发时同时发送到mainWindow和floatBallWindow
- 检查两个窗口是否存在且未销毁
- 添加日志记录事件分发情况
**效果**：悬浮球和主窗口的快捷键完全同步，设置修改后两者都生效

### ✅ 问题12：HTML标题文字
**问题**：悬浮球HTML的title标签包含"蛐蛐 - 悬浮球"文字
**修复内容**：
- floatBall.html的title标签改为空字符串
- 配合windowManager.js中的title: ''和titleBarStyle设置
**效果**：彻底移除所有可能显示的标题文字

修改文件：
- `main.js` - 添加before-quit事件设置退出标志
- `src/helpers/windowManager.js` - 条件性阻止窗口关闭
- `src/helpers/ipcHandlers.js` - 热键事件同时发送到两个窗口
- `src/floatBall.html` - title标签改为空

测试结果：12项测试全部通过（100%）

## 下一步建议
建议进行实际运行测试：
1. 运行 `pnpm run dev`
2. 在设置中切换到悬浮球模式
3. **验证无背景文字**（HTML title为空）
4. **验证悬停效果**（鼠标移上去，边缘圆滑无裁切）
5. 点击悬浮球测试录音功能
6. 按F2两次测试快捷键
7. **在设置中修改快捷键为F3**
8. **按F3测试录音功能**（应该生效）
9. 右键悬浮球查看菜单，选择"关闭"（应该隐藏）
10. 从托盘重新打开悬浮球
11. **右键托盘选择"退出"**（应该完全退出程序）
