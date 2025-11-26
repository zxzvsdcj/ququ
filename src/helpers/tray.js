const { Tray, Menu, nativeImage } = require("electron");
const path = require("path");

class TrayManager {
  constructor(logger = null) {
    this.tray = null;
    this.mainWindow = null;
    this.controlPanelWindow = null;
    this.createControlPanelCallback = null;
    this.logger = logger;
  }

  setWindows(mainWindow, controlPanelWindow) {
    this.mainWindow = mainWindow;
    this.controlPanelWindow = controlPanelWindow;
  }

  setCreateControlPanelCallback(callback) {
    this.createControlPanelCallback = callback;
  }

  async createTray() {
    try {
      // 创建托盘图标
      const iconPath = this.getTrayIconPath();
      let trayIcon;
      
      if (iconPath && require("fs").existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath);
        if (process.platform === "darwin") {
          trayIcon = trayIcon.resize({ width: 16, height: 16 });
          trayIcon.setTemplateImage(true);
        }
      } else {
        // 如果图标文件不存在，创建一个简单的图标
        trayIcon = nativeImage.createEmpty();
      }

      this.tray = new Tray(trayIcon);
      this.tray.setToolTip("蛐蛐 - 中文语音转文字");

      // 创建上下文菜单
      this.updateContextMenu();

      // 设置点击事件
      this.tray.on("click", () => {
        if (this.mainWindow) {
          if (this.mainWindow.isVisible()) {
            this.mainWindow.hide();
          } else {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        }
      });

      this.tray.on("right-click", () => {
        this.tray.popUpContextMenu();
      });

    } catch (error) {
      if (this.logger && this.logger.error) {
        this.logger.error("创建托盘失败:", error);
      }
    }
  }

  getTrayIconPath() {
    const isDev = process.env.NODE_ENV === "development";
    
    if (isDev) {
      return path.join(__dirname, "..", "..", "assets", "icon.png");
    } else {
      // 生产环境路径
      return path.join(process.resourcesPath, "assets", "icon.png");
    }
  }

  updateContextMenu(windowManager = null) {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "显示主窗口",
        click: () => {
          if (windowManager && windowManager.switchUIMode) {
            windowManager.switchUIMode('full');
          } else if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        }
      },
      {
        label: "显示悬浮球",
        click: () => {
          if (windowManager && windowManager.switchUIMode) {
            windowManager.switchUIMode('float');
          }
        }
      },
      {
        label: "控制面板",
        click: () => {
          // 始终通过回调函数来处理，确保获取最新的窗口引用
          if (this.createControlPanelCallback) {
            this.createControlPanelCallback().then((window) => {
              if (window) {
                window.show();
                window.focus();
              }
            });
          }
        }
      },
      { type: "separator" },
      {
        label: "设置",
        click: () => {
          if (this.openSettingsCallback) {
            this.openSettingsCallback();
          } else if (windowManager && windowManager.showSettingsWindow) {
            windowManager.showSettingsWindow();
          }
        }
      },
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
      },
      { type: "separator" },
      {
        label: "退出",
        click: () => {
          require("electron").app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  setStatus(status) {
    if (!this.tray) return;

    switch (status) {
      case "recording":
        this.tray.setToolTip("蛐蛐 - 正在录音...");
        break;
      case "processing":
        this.tray.setToolTip("蛐蛐 - 正在处理...");
        break;
      case "ready":
      default:
        this.tray.setToolTip("蛐蛐 - 中文语音转文字");
        break;
    }
  }
}

module.exports = TrayManager;