const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: '#f8fafb', // 添加背景色，防止白屏
    webPreferences: {
      nodeIntegration: false, // 禁用 nodeIntegration
      contextIsolation: true, // 启用上下文隔离
      webSecurity: true,     // 启用 web 安全性
      sandbox: true,         // 启用沙箱
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 设置 CSP
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* data:"]
      }
    })
  })

  // 创建菜单
  const template = isDev ? [
    {
      label: '开发',
      submenu: [
        {
          label: '开发者工具',
          accelerator: process.platform === 'darwin' ? 'Cmd+I' : 'Ctrl+I',
          click: () => {
            mainWindow.webContents.openDevTools()
          }
        },
        { type: 'separator' },
        {
          label: '重新加载',
          accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
          click: () => {
            mainWindow.reload()
          }
        }
      ]
    }
  ] : [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit()
          }
        }
      ]
    }
  ]

  // 设置菜单
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // 添加加载状态监听
  mainWindow.webContents.on('did-start-loading', () => {
    // 可以在这里添加加载动画
  })

  mainWindow.webContents.on('did-finish-load', () => {
    // 确保内容完全加载后再显示窗口
    setTimeout(() => {
      mainWindow.show()
    }, 100)
  })

  // 处理加载错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('页面加载失败:', errorCode, errorDescription)
    if (isDev) {
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173')
      }, 1000)
    }
  })

  // 添加开发者工具快捷键
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'i') {
      mainWindow.webContents.openDevTools()
      event.preventDefault()
    }
  })

  // 修改开发环境加载逻辑
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      // 如果加载失败，等待一段时间后重试
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173')
      }, 1000)
    })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return mainWindow
}

// 当 Electron 完成初始化时创建窗口
app.whenReady().then(() => {
  const mainWindow = createWindow()
})

// 激活应用时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 关闭所有窗口时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 