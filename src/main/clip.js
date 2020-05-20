import { clipboard, globalShortcut, ipcMain } from 'electron'
const os = require('os')
const storage = require('electron-json-storage')

// 设置存储路径
storage.setDataPath(os.tmpdir())

// 设置存储数组
let clipArr = []

// 存储的数量限制 超出删除
const limit = 30

// 默认文本
const defaultArr = [
  {
    text: '欢迎使用 Skywalker !',
    date: ''
  },
  {
    text: '你可以尝试多次复制文本',
    date: ''
  },
  {
    text: '然后通过Cmd+Shift+V调起面板',
    date: ''
  },
  {
    text: '查找你刚刚复制过的文本',
    date: ''
  },
  {
    text: 'Enter/Space或点击左下角的icon获取内容到系统剪贴板',
    date: ''
  },
  {
    text: '遇到问题请与我联系',
    date: ''
  },
  {
    text: 'tyrusl@163.com',
    date: ''
  }
]

// 去除所有空格
const trimAll = _s => _s.replace(/\s/g, '')

// 观察剪贴板内容变化
function watcher (win) {
  let currentValue = clipboard.readText()

  setInterval(async () => {
    const newValue = clipboard.readText()
    if (currentValue !== newValue && trimAll(newValue) !== '') {
      currentValue = newValue

      // 先从storage中取出原有数据
      storage.get('clip', (err, data) => {
        if (err) throw err
        // console.log('storage:', data)
        clipArr = data && data.clipArr ? data.clipArr : defaultArr

        // 去重原始值
        const uniIndex = clipArr.findIndex(i => i.text === currentValue)
        // console.log('------', uniIndex)
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

        // 存入带有新值的数组到storage中
        storage.set('clip', {
          clipArr: clipArr
        }, err => {
          if (err) throw err

          // 发送数据到渲染进程
          win.webContents.send('clip', data)
        })
      })
    }
  }, 400)
}

// 监听事件
function listener (win) {
  // 监听清除storage事件
  ipcMain.on('clear-data', (event, arg) => {
    // 这里只是清空storage中的clip 不要清空storage所有的数据
    storage.set('clip', {
      clipArr: defaultArr
    }, err => {
      if (err) throw err
      console.log('clear successed')

      // 发送默认数据 到渲染进程
      win.webContents.send('clip', { clipArr: defaultArr })
    })
  })

  // 监听copy事件
  ipcMain.on('close-window', (event, arg) => {
    win.hide()
  })

  // 加载完成后把storage传给渲染进程
  win.webContents.on('did-finish-load', () => {
    storage.get('clip', (err, data) => {
      if (err) throw err

      const origin = data.clipArr && data.clipArr.length > 0 ? data.clipArr : defaultArr
      // console.log('origin:', origin)

      // 发送数据到渲染进程
      win.webContents.send('clip', { clipArr: origin })
    })
  })

  // 监听关闭主窗口 不退出应用
  win.on('close', e => {
    e.preventDefault()
    win.hide()
  })
}

// 键盘监听
function hotKey (win) {
  globalShortcut.register('CommandOrControl+Shift+v', () => {
    console.log('CommandOrControl+Shift+v is clicked')
    // if (win.isMinimized()) win.restore()
    win.show()
  })
}

// 窗口设置
function windowConfig (win, app) {
  // 默认最大化 可使窗口贴底
  win.maximize()

  // 失去焦点时隐藏窗口
  win.on('blur', () => {
    win.hide()
  })
}

export function clip (win, app) {
  watcher(win)
  listener(win)
  hotKey(win)
  windowConfig(win, app)
}
