const { contextBridge, ipcRenderer } = require('electron')

// 安全地暴露特定的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露必要的 API
  platform: process.platform,
  versions: {
    node: process.versions.node,
    electron: process.versions.electron
  },
  // 安全的 IPC 通信
  send: (channel, data) => {
    // 白名单频道
    const validChannels = ['toMain', 'fileOperation']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain', 'fileOperationResult']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  invoke: async (channel, data) => {
    const validChannels = ['dialog:openFile', 'dialog:saveFile']
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data)
    }
  }
}) 