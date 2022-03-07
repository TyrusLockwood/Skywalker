import { clipboard, ipcMain, globalShortcut } from 'electron'
import introduce from '../utils/introduce'
const Store = require('electron-store')

const store = new Store()

// 设置剪贴板的数组
let clipArr = []

// 剪贴板的存储数量限制 超出删除
const limit = 30

// 常用的存储数量限制 超出删除
const limitUsual = 5

// 默认剪贴板文本
const defaultArr = introduce.clip

// 默认常用文本
const defaultUsualArr = introduce.usual

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
  // 监听清除store事件
  ipcMain.on('clear-data', (event, arg) => {
    // 这里只是清空store中的clip 不要清空store所有的数据
    store.set('clip', defaultArr)
    store.set('usual', defaultUsualArr)
    // 发送默认数据 到渲染进程
    win.webContents.send('init-data', {
      clipArr: defaultArr,
      usualArr: defaultUsualArr
    })
  })

  // 监听copy事件 关闭面板
  ipcMain.on('close-window', (event, arg) => {
    win.hide()
  })

  // 监听常用文本存储
  ipcMain.on('usual-data', (event, arg) => {
    const usualOrigin = store.get('usual', defaultUsualArr)

    // 去重原始值
    const uniIndex = usualOrigin.findIndex(i => i.text === arg)
    if (uniIndex > -1) {
      usualOrigin.splice(uniIndex, 1)
    }

    // 存入数据
    usualOrigin.unshift({ text: arg })
    if (usualOrigin.length > limitUsual) {
      usualOrigin.pop()
    }
    store.set('usual', usualOrigin)

    // 发送常用数据 到渲染进程
    win.webContents.send('usual', { usualArr: usualOrigin })
  })

  // 加载完成后把store传给渲染进程
  win.webContents.on('did-finish-load', () => {
    const origin = store.get('clip', defaultArr)
    const originUsual = store.get('usual', defaultUsualArr)
    // 发送数据到渲染进程
    win.webContents.send('init-data', {
      clipArr: origin,
      usualArr: originUsual
    })
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
