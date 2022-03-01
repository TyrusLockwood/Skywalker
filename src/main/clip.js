import { clipboard, ipcMain, globalShortcut } from 'electron'
import introduce from '../utils/introduce'
const Store = require('electron-store')

const store = new Store()

// 设置存储数组
let clipArr = []

// 存储的数量限制 超出删除
const limit = 30

// 默认文本
const defaultArr = introduce

// 去除所有空格
const trimAll = _s => _s.replace(/\s/g, '')

// 监听剪贴板内容变化
const watcher = win => {
  let currentValue = clipboard.readText()

  setInterval(() => {
    const newValue = clipboard.readText()

    if (currentValue !== newValue && trimAll(newValue) !== '') {
      currentValue = newValue

      // 先从storage中取出原有数据
      clipArr = store.get('clip', defaultArr)

      // 去重原始值
      const uniIndex = clipArr.findIndex(i => i.text === currentValue)
      console.log('------', uniIndex)
      if (uniIndex > -1) {
        clipArr.splice(uniIndex, 1)
      }

      // 存入新值
      clipArr.unshift({
        text: currentValue,
        date: Date.now()
      })

      // 存储数量限制 清除多余数据
      if (clipArr.length > limit) {
        clipArr.pop()
      }

      store.set('clip', clipArr)
      win.webContents.send('clip', { clipArr })
    }
  }, 1000)
}

// 监听事件
const listener = win => {
  // 监听清除storage事件
  ipcMain.on('clear-data', (event, arg) => {
    // 这里只是清空storage中的clip 不要清空storage所有的数据
    store.set('clip', defaultArr)
    // 发送默认数据 到渲染进程
    win.webContents.send('clip', { clipArr: defaultArr })
  })

  // 监听copy事件
  ipcMain.on('close-window', (event, arg) => {
    win.hide()
  })

  // 加载完成后把storage传给渲染进程
  win.webContents.on('did-finish-load', () => {
    const origin = store.get('clip', defaultArr)
    // 发送数据到渲染进程
    win.webContents.send('clip', { clipArr: origin })
  })

  // 监听关闭主窗口 不退出应用
  win.on('close', e => {
    e.preventDefault()
    win.hide()
  })

  // 失去焦点时隐藏窗口
  win.on('blur', () => {
    win.hide()
  })
}

// 键盘监听
const hotKey = win => {
  globalShortcut.register('CommandOrControl+Shift+v', () => {
    console.log('CommandOrControl+Shift+v is clicked')
    // if (win.isMinimized()) win.restore()
    win.show()
  })
}

export const clip = win => {
  watcher(win)
  listener(win)
  hotKey(win)
}
