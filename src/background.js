'use strict'

import { app, protocol, BrowserWindow, screen, Tray, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'

import { clip } from './main/clip'
import { initTray } from './main/tray'
import { initFontSize } from './main/font'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')

const global = {
  tray: null,
  win: null,
  app
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  const { size, workAreaSize } = screen.getPrimaryDisplay()
  console.log(workAreaSize.height)
  // Create the browser window.
  global.win = new BrowserWindow({
    width: size.width - 50,
    height: 240,
    x: workAreaSize.width,
    y: workAreaSize.height,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    },
    // 窗口是否总是显示在其他窗口之前
    alwaysOnTop: true,
    // 是否可全屏
    fullscreen: false,
    // 全屏化按钮是否可用
    fullscreenable: false,
    // 标题
    title: 'Skywalker',
    // 窗口标题栏样式
    titleBarStyle: 'hidden',
    // 是否可以改变窗口size
    resizable: false
    // transparent: true
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await global.win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) global.win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    global.win.loadURL('app://./index.html')
  }

  global.win.on('closed', () => {
    global.win = null
  })

  // 初始化字体
  initFontSize(global.win)

  // 执行 clip
  clip(global.win)
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  // 系统托盘
  const trayIcon = path.resolve(__dirname, './icon_48x48@3x.png')
  global.tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate(initTray.call(global))
  global.tray.setContextMenu(contextMenu)
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
