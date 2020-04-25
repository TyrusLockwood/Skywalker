import { BrowserWindow } from 'electron'
import {
  createProtocol
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'

function addWindow () {
  let addWin = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    // 窗口是否总是显示在其他窗口之前
    alwaysOnnTop: true,
    // 是否可全屏
    fullscreen: false,
    // 全屏化按钮是否可用
    fullscreenable: false,
    // 标题
    title: 'add'
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    addWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'pin')
    if (!process.env.IS_TEST) addWin.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    addWin.loadURL('app://./pin.html')
  }

  addWin.on('closed', () => {
    addWin = null
  })

  return addWin
}

export default addWindow
