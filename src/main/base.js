'use strict'

import { app, protocol, BrowserWindow, clipboard, globalShortcut, ipcMain } from 'electron'
import {
  createProtocol
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

const os = require('os')
const storage = require('electron-json-storage')

// 设置存储路径
storage.setDataPath(os.tmpdir())

let skywalkerArr = []

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1240,
    height: 1000,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 加载完成后把storage传给渲染进程
  win.webContents.on('did-finish-load', () => {
    storage.get('skywalker', (err, data) => {
      if (err) throw err
      console.log('storage:', data)
      win.webContents.send('skywalker', data)
    })
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  // 监听关闭主窗口 不退出应用
  win.on('close', e => {
    e.preventDefault()
    win.hide()
  })

  win.on('closed', () => {
    win = null
  })

  skywalker()
}

// skywalker start ---------
function skywalker () {
  watcher()
  hotKey()

  function watcher () {
    let currentValue = clipboard.readText()
    setInterval(async () => {
      try {
        const newValue = clipboard.readText()
        if (currentValue !== newValue) {
          currentValue = newValue

          // 先从storage中取出原有数据
          storage.get('skywalker', (err, data) => {
            if (err) throw err
            console.log('storage:', data)
            skywalkerArr = data.skywalkerArr ? data.skywalkerArr : []
            // 存入新值
            skywalkerArr.unshift(currentValue)

            // 存入带有新值的数组到storage中
            storage.set('skywalker', {
              skywalkerArr: skywalkerArr
            }, err => {
              if (err) throw err
              // 发送数据到渲染进程
              win.webContents.send('skywalker', data)
            })
          })
        }
      } catch (error) {
        console.log(error)
      }
    }, 200)
  }

  function hotKey () {
    globalShortcut.register('CommandOrControl+Alt+s', () => {
      console.log('CommandOrControl+Alt+s is clicked')
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    })
  }

  // 监听清除storage事件
  ipcMain.on('clear-data', function (event, arg) {
    // 这里只是清空storage中的skywalker 不要清空storage所有的数据
    storage.set('skywalker', {
      skywalkerArr: []
    }, err => {
      if (err) throw err
      console.log('clear successed')
    })
  })

  // 监听copy事件
  ipcMain.on('close-window', function (event, arg) {
    console.log(arg)
    win.hide()
  })
}

// skywalker end ---------

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
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
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
