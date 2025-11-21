# AI优化开关保存问题修复

## 修复日期
2025-11-14

## 问题描述
用户反馈：在快速设置面板中关闭"AI文本优化"开关后，重新打开设置界面时，开关会自动恢复为启用状态，无法长效保存。

## 问题根源
在 `src/settings.jsx` 第55行，加载设置的逻辑有误：

```javascript
// 错误的逻辑
enable_ai_optimization: allSettings.enable_ai_optimization !== false, // 默认为true
```

**问题分析**：
- 当值为 `false` 时 → 返回 `false` ✅
- 当值为 `undefined` 时 → 返回 `true` ❌（应该使用默认值）
- 当值为 `null` 时 → 返回 `true` ❌
- 当值为 `0` 时 → 返回 `true` ❌

这导致即使在快速设置面板中保存了 `false`，完整设置页面加载时也会被错误地解析为 `true`。

## 修复方案

### 修改文件：src/settings.jsx

**修改前（第55行）**：
```javascript
enable_ai_optimization: allSettings.enable_ai_optimization !== false, // 默认为true
```

**修改后（第55行）**：
```javascript
enable_ai_optimization: allSettings.enable_ai_optimization === undefined ? true : allSettings.enable_ai_optimization,
```

**新逻辑**：
- 当值为 `undefined` 时 → 使用默认值 `true` ✅
- 当值为 `false` 时 → 返回 `false` ✅
- 当值为 `true` 时 → 返回 `true` ✅
- 当值为 `null` 时 → 返回 `null`（会被转换为 `false`）✅
- 当值为 `0` 时 → 返回 `0`（会被转换为 `false`）✅

## 测试验证

### 测试步骤
1. 打开快速设置面板
2. 关闭"AI文本优化"开关
3. 关闭设置面板
4. 重新打开快速设置面板 → 应该显示"已关闭"
5. 打开完整设置页面（AI配置） → 应该显示开关为关闭状态
6. 重启应用 → 设置应该保持

### 预期结果
- ✅ 快速设置面板和完整设置页面状态一致
- ✅ 设置持久化保存到数据库
- ✅ 重启应用后设置保持

## 相关文件
- `src/settings.jsx`：完整设置页面（已修复）
- `src/components/SettingsPanel.jsx`：快速设置面板（保存逻辑正确）
- `src/helpers/database.js`：数据库层（保存和读取逻辑正确）

## 技术要点
- 布尔值的正确判断：使用 `=== undefined` 而不是 `!== false`
- 默认值处理：只在值真正不存在时使用默认值
- 数据类型转换：注意 `null`、`0`、`false` 的区别

## 经验教训
在处理布尔类型的设置时：
1. 不要使用 `!== false` 来设置默认值，因为 `undefined !== false` 为 `true`
2. 应该明确检查 `=== undefined`，只在真正没有值时才使用默认值
3. 使用三元运算符 `value === undefined ? defaultValue : value` 更加清晰