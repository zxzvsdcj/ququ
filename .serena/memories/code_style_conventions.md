# 蛐蛐项目代码风格和约定

## 代码风格

### JavaScript/TypeScript
- **文件命名**: 使用 camelCase，组件文件使用 PascalCase (如 `App.jsx`, `useHotkey.js`)
- **变量命名**: camelCase (如 `isRecording`, `modelStatus`)
- **常量命名**: UPPER_SNAKE_CASE (如 `NODE_ENV`)
- **函数命名**: camelCase，动词开头 (如 `toggleRecording`, `handleInputChange`)

### React 组件
- **组件命名**: PascalCase (如 `SettingsPanel`, `ModelDownloadProgress`)
- **Hook 命名**: 以 `use` 开头 (如 `useHotkey`, `useRecording`)
- **Props 接口**: 使用 TypeScript 接口定义

### Python
- **文件命名**: snake_case (如 `funasr_server.py`, `download_models.py`)
- **函数命名**: snake_case (如 `initialize_models`, `load_asr_model`)
- **类命名**: PascalCase (如 `FunASRServer`, `DatabaseManager`)

## 项目结构约定

### 目录组织
```
src/
├── components/     # UI 组件
├── hooks/         # React Hooks
├── helpers/       # 主进程辅助模块
├── utils/         # 工具函数
└── lib/          # 库文件
```

### 文件命名规范
- **组件文件**: PascalCase.jsx (如 `SettingsPanel.jsx`)
- **Hook 文件**: camelCase.js (如 `useHotkey.js`)
- **工具文件**: camelCase.js (如 `logManager.js`)
- **配置文件**: kebab-case (如 `vite.config.js`)

## 代码约定

### React 组件
```jsx
// 组件定义
const ComponentName = ({ prop1, prop2 }) => {
  // 状态定义
  const [state, setState] = useState(initialValue);
  
  // 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);
  
  // 事件处理
  const handleEvent = useCallback(() => {
    // 处理逻辑
  }, [dependencies]);
  
  return (
    <div className="component-class">
      {/* JSX 内容 */}
    </div>
  );
};

export default ComponentName;
```

### Electron 主进程
```javascript
// 类定义
class ManagerName {
  constructor(logger = null) {
    this.logger = logger;
    this.initialized = false;
  }
  
  // 方法定义
  async initialize() {
    try {
      // 初始化逻辑
      this.initialized = true;
    } catch (error) {
      this.logger?.error('初始化失败:', error);
      throw error;
    }
  }
}

module.exports = ManagerName;
```

### Python 代码
```python
class ClassName:
    def __init__(self, logger=None):
        self.logger = logger
        self.initialized = False
    
    def method_name(self, param1, param2=None):
        """方法文档字符串"""
        try:
            # 方法逻辑
            return result
        except Exception as e:
            self.logger.error(f"方法执行失败: {e}")
            raise
```

## 注释规范

### JavaScript/TypeScript
```javascript
/**
 * 函数描述
 * @param {string} param1 - 参数1描述
 * @param {number} param2 - 参数2描述
 * @returns {Promise<boolean>} 返回值描述
 */
async function functionName(param1, param2) {
  // 单行注释
  return true;
}
```

### Python
```python
def function_name(param1, param2=None):
    """
    函数描述
    
    Args:
        param1 (str): 参数1描述
        param2 (int, optional): 参数2描述，默认为None
    
    Returns:
        bool: 返回值描述
    
    Raises:
        ValueError: 异常描述
    """
    # 单行注释
    return True
```

## 错误处理

### JavaScript/TypeScript
```javascript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('操作失败:', error);
  throw new Error(`操作失败: ${error.message}`);
}
```

### Python
```python
try:
    result = risky_operation()
    return result
except Exception as e:
    logger.error(f"操作失败: {e}")
    raise ValueError(f"操作失败: {str(e)}")
```

## 日志规范

### 日志级别
- **error**: 错误信息
- **warn**: 警告信息  
- **info**: 一般信息
- **debug**: 调试信息

### 日志格式
```javascript
// JavaScript
this.logger?.info('操作成功', { data: result });
this.logger?.error('操作失败', { error: error.message });

// Python
logger.info(f"操作成功: {result}")
logger.error(f"操作失败: {error}")
```