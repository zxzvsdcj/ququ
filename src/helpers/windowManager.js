const { BrowserWindow } = require("electron");
const path = require("path");

class WindowManager {
  constructor() {
    this.mainWindow = null;
    this.controlPanelWindow = null;
    this.historyWindow = null;
    this.settingsWindow = null;
    this.floatBallWindow = null;
  }

  async createMainWindow(showWindow = true) {
    if (this.mainWindow) {
      if (showWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 500,
      frame: false,
      transparent: true,
      alwaysOnTop: false, // 默认不置顶，由用户控制
      resizable: false,
      skipTaskbar: true,
      movable: true,
      show: showWindow, // 根据参数决定是否显示
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "..", "..", "preload.js"),
      },
    });

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      await this.mainWindow.loadURL("http://localhost:5173");
    } else {
      await this.mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    }

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  async createControlPanelWindow() {
    if (this.controlPanelWindow) {
      this.controlPanelWindow.focus();
      return this.controlPanelWindow;
    }

    this.controlPanelWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "..", "..", "preload.js"),
      },
    });

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      await this.controlPanelWindow.loadURL("http://localhost:5173?panel=control");
    } else {
      await this.controlPanelWindow.loadFile(
        path.join(__dirname, "..", "dist", "index.html"),
        { query: { panel: "control" } }
      );
    }

    this.controlPanelWindow.on("closed", () => {
      this.controlPanelWindow = null;
    });

    return this.controlPanelWindow;
  }

  async createHistoryWindow() {
    if (this.historyWindow) {
      this.historyWindow.focus();
      return this.historyWindow;
    }

    this.historyWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      show: false,
      title: "转录历史 - 蛐蛐",
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "..", "..", "preload.js"),
      },
    });

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      await this.historyWindow.loadURL("http://localhost:5173/history.html");
    } else {
      await this.historyWindow.loadFile(
        path.join(__dirname, "..", "dist", "history.html")
      );
    }

    this.historyWindow.on("closed", () => {
      this.historyWindow = null;
    });

    return this.historyWindow;
  }

  async createSettingsWindow() {
    if (this.settingsWindow) {
      this.settingsWindow.focus();
      return this.settingsWindow;
    }

    this.settingsWindow = new BrowserWindow({
      width: 700,
      height: 600,
      show: false,
      title: "设置 - 蛐蛐",
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "..", "..", "preload.js"),
      },
    });

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      await this.settingsWindow.loadURL("http://localhost:5173?page=settings");
    } else {
      await this.settingsWindow.loadFile(
        path.join(__dirname, "..", "dist", "settings.html")
      );
    }

    this.settingsWindow.on("closed", () => {
      this.settingsWindow = null;
    });

    return this.settingsWindow;
  }

  showControlPanel() {
    if (this.controlPanelWindow) {
      this.controlPanelWindow.show();
      this.controlPanelWindow.focus();
    } else {
      this.createControlPanelWindow().then(() => {
        this.controlPanelWindow.show();
      });
    }
  }

  hideControlPanel() {
    if (this.controlPanelWindow) {
      this.controlPanelWindow.hide();
    }
  }

  showHistoryWindow() {
    if (this.historyWindow) {
      this.historyWindow.show();
      this.historyWindow.focus();
      this.historyWindow.setAlwaysOnTop(true);
    } else {
      this.createHistoryWindow().then(() => {
        this.historyWindow.show();
        this.historyWindow.focus();
        this.historyWindow.setAlwaysOnTop(true);
      });
    }
  }

  hideHistoryWindow() {
    if (this.historyWindow) {
      this.historyWindow.hide();
    }
  }

  closeHistoryWindow() {
    if (this.historyWindow) {
      this.historyWindow.close();
    }
  }

  showSettingsWindow() {
    if (this.settingsWindow) {
      this.settingsWindow.show();
      this.settingsWindow.focus();
      this.settingsWindow.setAlwaysOnTop(true);
    } else {
      this.createSettingsWindow().then(() => {
        this.settingsWindow.show();
        this.settingsWindow.focus();
        this.settingsWindow.setAlwaysOnTop(true);
      });
    }
  }

  hideSettingsWindow() {
    if (this.settingsWindow) {
      this.settingsWindow.hide();
    }
  }

  closeSettingsWindow() {
    if (this.settingsWindow) {
      this.settingsWindow.close();
    }
  }

  async createFloatBallWindow() {
    if (this.floatBallWindow) {
      this.floatBallWindow.show();
      this.floatBallWindow.focus();
      return this.floatBallWindow;
    }

    // 获取屏幕信息
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // 悬浮球边缘隐藏状态
    this.floatBallEdgeState = {
      isHidden: false,
      hiddenEdge: null, // 'left', 'right', 'top', 'bottom'
      originalPosition: null,
      indicatorWindow: null
    };

    // 透明窗口配置
    this.floatBallWindow = new BrowserWindow({
      width: 80,
      height: 80,
      x: screenWidth - 150,  // 屏幕右侧
      y: screenHeight / 2 - 40,  // 屏幕中间
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      movable: true,
      show: false,
      hasShadow: false,
      focusable: true,
      // Windows关键配置
      ...(process.platform === 'win32' && {
        // 不使用任何可能导致标题栏的选项
      }),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "..", "..", "preload.js"),
        backgroundThrottling: false,
      },
    });

    // Windows上额外设置
    if (process.platform === 'win32') {
      this.floatBallWindow.setSkipTaskbar(true);
      // 尝试移除窗口菜单
      this.floatBallWindow.setMenu(null);
      this.floatBallWindow.setMenuBarVisibility(false);
    }

    // macOS配置
    if (process.platform === 'darwin') {
      this.floatBallWindow.setWindowButtonVisibility(false);
    }

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      await this.floatBallWindow.loadURL("http://localhost:5173/floatBall.html");
    } else {
      await this.floatBallWindow.loadFile(
        path.join(__dirname, "..", "dist", "floatBall.html")
      );
    }

    // 加载完成后处理
    this.floatBallWindow.webContents.on('did-finish-load', () => {
      // 注入JavaScript清理和透明化
      this.floatBallWindow.webContents.executeJavaScript(`
        (function() {
          // 移除Vite注入的元素
          document.querySelectorAll('vite-error-overlay').forEach(el => el.remove());
          
          // 确保透明
          document.documentElement.style.background = 'transparent';
          document.body.style.background = 'transparent';
          
          // 检查并移除任何非预期的白色元素
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.tagName === 'VITE-ERROR-OVERLAY') {
                  node.remove();
                }
              });
            });
          });
          observer.observe(document.body, { childList: true, subtree: true });
        })();
      `);
      
      this.floatBallWindow.show();
    });

    // 备用显示
    setTimeout(() => {
      if (this.floatBallWindow && !this.floatBallWindow.isVisible()) {
        this.floatBallWindow.show();
      }
    }, 1000);

    // 悬浮球窗口关闭时隐藏而不是销毁
    this.floatBallWindow.on("close", (e) => {
      const { app } = require("electron");
      if (!app.isQuitting) {
        e.preventDefault();
        this.floatBallWindow.hide();
      }
    });

    this.floatBallWindow.on("closed", () => {
      this.floatBallWindow = null;
    });

    return this.floatBallWindow;
  }

  showFloatBallWindow() {
    if (this.floatBallWindow) {
      this.floatBallWindow.show();
      this.floatBallWindow.focus();
    } else {
      this.createFloatBallWindow();
    }
  }

  hideFloatBallWindow() {
    if (this.floatBallWindow) {
      this.floatBallWindow.hide();
    }
    // 同时隐藏边缘指示器
    this.hideEdgeIndicator();
  }

  /**
   * 检查悬浮球是否在屏幕边缘，如果是则隐藏到边缘
   * @param {number} x - 窗口x坐标
   * @param {number} y - 窗口y坐标
   * @returns {Object} { shouldHide: boolean, edge: string|null }
   */
  checkFloatBallEdge(x, y) {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const workArea = primaryDisplay.workArea;
    
    const EDGE_THRESHOLD = 20; // 边缘检测阈值（像素）
    const ballSize = 80;
    
    // 检测四个边缘
    if (x <= workArea.x + EDGE_THRESHOLD) {
      return { shouldHide: true, edge: 'left' };
    }
    if (x + ballSize >= workArea.x + screenWidth - EDGE_THRESHOLD) {
      return { shouldHide: true, edge: 'right' };
    }
    if (y <= workArea.y + EDGE_THRESHOLD) {
      return { shouldHide: true, edge: 'top' };
    }
    if (y + ballSize >= workArea.y + screenHeight - EDGE_THRESHOLD) {
      return { shouldHide: true, edge: 'bottom' };
    }
    
    return { shouldHide: false, edge: null };
  }

  /**
   * 将悬浮球隐藏到边缘
   * @param {string} edge - 边缘方向: 'left', 'right', 'top', 'bottom'
   */
  hideFloatBallToEdge(edge) {
    if (!this.floatBallWindow || this.floatBallWindow.isDestroyed()) return;
    
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const workArea = primaryDisplay.workArea;
    
    // 保存原始位置
    const [currentX, currentY] = this.floatBallWindow.getPosition();
    this.floatBallEdgeState = {
      isHidden: true,
      hiddenEdge: edge,
      originalPosition: { x: currentX, y: currentY },
      indicatorWindow: null
    };
    
    // 隐藏悬浮球
    this.floatBallWindow.hide();
    
    // 创建边缘指示器
    this.createEdgeIndicator(edge, currentX, currentY, screenWidth, screenHeight, workArea);
  }

  /**
   * 创建边缘指示器窗口
   */
  createEdgeIndicator(edge, ballX, ballY, screenWidth, screenHeight, workArea) {
    // 如果已存在指示器，先销毁
    this.hideEdgeIndicator();
    
    let indicatorWidth, indicatorHeight, indicatorX, indicatorY;
    
    // 根据边缘方向设置指示器位置和大小
    switch (edge) {
      case 'left':
        indicatorWidth = 6;
        indicatorHeight = 60;
        indicatorX = workArea.x;
        indicatorY = ballY + 10;
        break;
      case 'right':
        indicatorWidth = 6;
        indicatorHeight = 60;
        indicatorX = workArea.x + screenWidth - indicatorWidth;
        indicatorY = ballY + 10;
        break;
      case 'top':
        indicatorWidth = 60;
        indicatorHeight = 6;
        indicatorX = ballX + 10;
        indicatorY = workArea.y;
        break;
      case 'bottom':
        indicatorWidth = 60;
        indicatorHeight = 6;
        indicatorX = ballX + 10;
        indicatorY = workArea.y + screenHeight - indicatorHeight;
        break;
    }
    
    // 创建指示器窗口 - 使用更大的尺寸便于点击
    const clickAreaSize = 20; // 点击区域大小
    let finalWidth = edge === 'left' || edge === 'right' ? clickAreaSize : 80;
    let finalHeight = edge === 'top' || edge === 'bottom' ? clickAreaSize : 80;
    
    // 调整位置使指示条居中
    let finalX = indicatorX;
    let finalY = indicatorY;
    if (edge === 'left') {
      finalY = ballY;
    } else if (edge === 'right') {
      finalX = workArea.x + screenWidth - finalWidth;
      finalY = ballY;
    } else if (edge === 'top') {
      finalX = ballX;
    } else if (edge === 'bottom') {
      finalX = ballX;
      finalY = workArea.y + screenHeight - finalHeight;
    }
    
    const indicatorWindow = new BrowserWindow({
      width: finalWidth,
      height: finalHeight,
      x: finalX,
      y: finalY,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      focusable: true, // 必须可聚焦才能接收点击
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    
    // 根据边缘方向设置指示条样式
    const isVertical = edge === 'left' || edge === 'right';
    const borderRadius = edge === 'left' ? '0 8px 8px 0' : 
                         edge === 'right' ? '8px 0 0 8px' : 
                         edge === 'top' ? '0 0 8px 8px' : '8px 8px 0 0';
    
    // 加载指示器HTML - 更明显的样式
    const indicatorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { 
              background: transparent !important;
              overflow: hidden;
              width: 100%;
              height: 100%;
            }
            .indicator {
              width: ${isVertical ? '8px' : '100%'};
              height: ${isVertical ? '100%' : '8px'};
              background: linear-gradient(${isVertical ? '180deg' : '90deg'}, #667eea 0%, #764ba2 50%, #667eea 100%);
              border-radius: ${borderRadius};
              cursor: pointer;
              position: absolute;
              ${edge === 'left' ? 'left: 0;' : ''}
              ${edge === 'right' ? 'right: 0;' : ''}
              ${edge === 'top' ? 'top: 0;' : ''}
              ${edge === 'bottom' ? 'bottom: 0;' : ''}
              box-shadow: ${edge === 'left' ? '2px 0 8px rgba(102, 126, 234, 0.5)' : 
                           edge === 'right' ? '-2px 0 8px rgba(102, 126, 234, 0.5)' :
                           edge === 'top' ? '0 2px 8px rgba(102, 126, 234, 0.5)' :
                           '0 -2px 8px rgba(102, 126, 234, 0.5)'};
              animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
            .click-area {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="click-area" id="clickArea"></div>
          <div class="indicator"></div>
          <script>
            document.getElementById('clickArea').addEventListener('click', function() {
              const { ipcRenderer } = require('electron');
              ipcRenderer.send('edge-indicator-clicked');
            });
            document.getElementById('clickArea').addEventListener('mouseenter', function() {
              const { ipcRenderer } = require('electron');
              ipcRenderer.send('edge-indicator-hover');
            });
          </script>
        </body>
      </html>
    `;
    
    indicatorWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(indicatorHtml)}`);
    indicatorWindow.show();
    
    // 保存指示器窗口引用
    this.floatBallEdgeState.indicatorWindow = indicatorWindow;
    
    // 监听指示器的IPC事件
    const { ipcMain } = require('electron');
    
    // 移除之前的监听器（如果有）
    ipcMain.removeAllListeners('edge-indicator-clicked');
    ipcMain.removeAllListeners('edge-indicator-hover');
    
    // 点击指示器 - 显示悬浮球
    ipcMain.on('edge-indicator-clicked', () => {
      console.log('边缘指示器被点击，显示悬浮球');
      this.showFloatBallFromEdge();
    });
    
    // 鼠标进入指示器 - 也显示悬浮球
    ipcMain.on('edge-indicator-hover', () => {
      console.log('鼠标进入边缘指示器，显示悬浮球');
      this.showFloatBallFromEdge();
    });
    
    // 监听加载完成
    indicatorWindow.webContents.on('did-finish-load', () => {
      console.log('边缘指示器加载完成');
    });
    
    // 监听指示器关闭
    indicatorWindow.on('closed', () => {
      if (this.floatBallEdgeState) {
        this.floatBallEdgeState.indicatorWindow = null;
      }
      // 清理IPC监听器
      const { ipcMain } = require('electron');
      ipcMain.removeAllListeners('edge-indicator-clicked');
      ipcMain.removeAllListeners('edge-indicator-hover');
    });
  }

  /**
   * 隐藏边缘指示器
   */
  hideEdgeIndicator() {
    if (this.floatBallEdgeState && this.floatBallEdgeState.indicatorWindow) {
      try {
        if (!this.floatBallEdgeState.indicatorWindow.isDestroyed()) {
          this.floatBallEdgeState.indicatorWindow.close();
        }
      } catch (e) {
        // 忽略关闭错误
      }
      this.floatBallEdgeState.indicatorWindow = null;
    }
  }

  /**
   * 从边缘显示悬浮球
   */
  showFloatBallFromEdge() {
    if (!this.floatBallWindow || this.floatBallWindow.isDestroyed()) return;
    if (!this.floatBallEdgeState || !this.floatBallEdgeState.isHidden) return;
    
    // 隐藏指示器
    this.hideEdgeIndicator();
    
    // 恢复悬浮球位置
    const { originalPosition, hiddenEdge } = this.floatBallEdgeState;
    
    if (originalPosition) {
      // 稍微偏移一点，避免立即触发再次隐藏
      let newX = originalPosition.x;
      let newY = originalPosition.y;
      
      switch (hiddenEdge) {
        case 'left':
          newX = Math.max(originalPosition.x, 30);
          break;
        case 'right':
          const { screen } = require('electron');
          const { width } = screen.getPrimaryDisplay().workAreaSize;
          newX = Math.min(originalPosition.x, width - 110);
          break;
        case 'top':
          newY = Math.max(originalPosition.y, 30);
          break;
        case 'bottom':
          const { height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
          newY = Math.min(originalPosition.y, height - 110);
          break;
      }
      
      this.floatBallWindow.setPosition(Math.round(newX), Math.round(newY));
    }
    
    // 显示悬浮球
    this.floatBallWindow.show();
    this.floatBallWindow.focus();
    
    // 重置状态
    this.floatBallEdgeState = {
      isHidden: false,
      hiddenEdge: null,
      originalPosition: null,
      indicatorWindow: null
    };
  }

  /**
   * 获取悬浮球边缘隐藏状态
   */
  getFloatBallEdgeState() {
    return this.floatBallEdgeState || { isHidden: false, hiddenEdge: null };
  }

  closeFloatBallWindow() {
    if (this.floatBallWindow) {
      // 移除close事件监听，真正关闭窗口
      this.floatBallWindow.removeAllListeners("close");
      this.floatBallWindow.close();
    }
  }

  // 切换UI模式
  async switchUIMode(mode) {
    if (mode === 'float') {
      // 切换到悬浮球模式
      if (this.mainWindow) {
        this.mainWindow.hide();
      }
      await this.showFloatBallWindow();
    } else {
      // 切换到完整模式
      if (this.floatBallWindow) {
        this.floatBallWindow.hide();
      }
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
      } else {
        await this.createMainWindow(true);
      }
    }
  }

  closeAllWindows() {
    if (this.mainWindow) {
      this.mainWindow.close();
    }
    if (this.controlPanelWindow) {
      this.controlPanelWindow.close();
    }
    if (this.historyWindow) {
      this.historyWindow.close();
    }
    if (this.settingsWindow) {
      this.settingsWindow.close();
    }
    if (this.floatBallWindow) {
      this.floatBallWindow.close();
    }
  }
}

module.exports = WindowManager;