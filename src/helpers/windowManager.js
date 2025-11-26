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

    this.floatBallWindow = new BrowserWindow({
      width: 80,
      height: 80,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      movable: true,
      show: true,
      hasShadow: false, // 移除窗口阴影，避免背景
      title: '', // 移除窗口标题
      titleBarStyle: 'customButtonsOnHover', // 隐藏标题栏
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "..", "..", "preload.js"),
      },
    });

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      await this.floatBallWindow.loadURL("http://localhost:5173/floatBall.html");
    } else {
      await this.floatBallWindow.loadFile(
        path.join(__dirname, "..", "dist", "floatBall.html")
      );
    }

    // 悬浮球窗口关闭时隐藏而不是销毁（但app退出时允许关闭）
    this.floatBallWindow.on("close", (e) => {
      // 检查是否是app退出导致的关闭
      const { app } = require("electron");
      if (!app.isQuitting) {
        e.preventDefault();
        this.floatBallWindow.hide();
      }
      // 如果app正在退出，允许窗口正常关闭
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