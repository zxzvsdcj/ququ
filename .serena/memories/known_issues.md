# 已知问题和待修复项

## 代码质量问题

### 1. ESLint 错误 (337个问题)
- **未使用的导入和变量**: 大量未使用的 React 导入、图标组件、工具函数
- **React Hooks 规则违反**: 在条件语句中调用 Hooks，违反 React 规则
- **Node.js 环境变量**: 在浏览器代码中使用了 `require`、`process`、`__dirname` 等 Node.js 变量

### 2. 主要问题文件
- `src/App.jsx`: 大量未使用的导入和变量，Hooks 调用问题
- `src/helpers/*.js`: Node.js 环境变量在浏览器环境中使用
- `src/components/*.jsx`: 未使用的 React 导入
- `src/hooks/*.js`: Hooks 依赖项缺失

### 3. 需要修复的问题类型

#### 未使用的导入
```javascript
// 需要移除未使用的导入
import { LoadingDots } from './components/ui/loading-dots';
import { usePermissions } from './hooks/usePermissions';
```

#### React Hooks 规则
```javascript
// 错误：在条件语句中调用 Hooks
if (condition) {
  const [state, setState] = useState(initialValue);
}

// 正确：Hooks 必须在组件顶层调用
const [state, setState] = useState(initialValue);
```

#### 环境变量问题
```javascript
// 错误：在浏览器代码中使用 Node.js 变量
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// 正确：使用 Vite 环境变量
const isDev = import.meta.env.DEV;
```

## 修复优先级

### 高优先级
1. **React Hooks 规则违反** - 可能导致运行时错误
2. **环境变量问题** - 可能导致构建失败

### 中优先级
3. **未使用的导入** - 影响代码质量和包大小
4. **未使用的变量** - 影响代码可读性

### 低优先级
5. **代码格式问题** - 影响代码风格一致性

## 修复建议

### 1. 创建 ESLint 配置
- 为不同环境（Node.js vs 浏览器）创建不同的 ESLint 配置
- 使用 `eslint.config.js` 替代旧的 `.eslintrc` 格式

### 2. 代码重构
- 移除未使用的导入和变量
- 修复 React Hooks 调用顺序
- 分离 Node.js 和浏览器代码

### 3. 环境变量处理
- 使用 Vite 的环境变量替代 Node.js 的 `process.env`
- 为不同环境创建适当的配置

## 临时解决方案
在修复这些问题之前，可以：
1. 禁用 ESLint 检查：`// eslint-disable-next-line`
2. 使用 `--no-lint` 参数跳过检查
3. 创建更宽松的 ESLint 配置