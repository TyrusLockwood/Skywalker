import { clipboard, globalShortcut, ipcMain } from 'electron'
const os = require('os')
const fs = require('fs')
const storage = require('electron-json-storage')

// 设置存储路径
storage.setDataPath(os.tmpdir())

// 设置存储数组
let skywalkerArr = []

// 存储的数量限制 超出删除
const limit = 20

// 默认文本
const defaultArr = [
  '欢迎使用 Skywalker !',
  '你可以尝试多次复制文本',
  '然后通过快捷键调起面板',
  '查找你刚刚复制过的文本',
  'Enter或者点击左下角的copy',
  '遇到问题请与我联系',
  'tyrusl@163.com'
]

// 去除所有空格
// const trimAll = _s => _s.replace(/\s/g, '')

function isImg () {
  // [ 'text/plain', 'image/png' ]
  const type = clipboard.availableFormats()
  console.log('type:', type)
  return type.some(i => i.split('/')[0] === 'image')
}

// 观察剪贴板内容变化
function watcher (win, app) {
  let currentValue = null
  if (isImg()) {
    const nativeImage = clipboard.readImage()
    currentValue = nativeImage.toJPEG(30)
    console.log('toJPEG:', currentValue)
  } else {
    currentValue = clipboard.readText()
  }
  // currentValue = clipboard.readText()

  const hostPath = `${app.getPath('userData')}/tempImg`

  setInterval(async () => {
    let newValue = null

    newValue = isImg() ? clipboard.readImage() : clipboard.readText()

    if (currentValue !== newValue) {
    // if (currentValue !== newValue && trimAll(newValue)) {
      if (isImg()) {
        if (!fs.existsSync(hostPath)) {
          fs.mkdirSync(hostPath)
        }
        fs.writeFileSync(`${hostPath}/image${Date.now()}.jpeg`, currentValue)
      } else {
        console.log('text:', currentValue)
        currentValue = newValue
      }

      // 先从storage中取出原有数据
      storage.get('skywalker', (err, data) => {
        if (err) throw err
        console.log('storage:', data)
        skywalkerArr = data.skywalkerArr ? data.skywalkerArr : defaultArr

        // 存入新值
        skywalkerArr.unshift(currentValue)

        // 存储数量限制 清除多余数据
        if (skywalkerArr.length > limit) {
          skywalkerArr.pop()
        }

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
  }, 400)
}

// 监听事件
function listener (win) {
  // 监听清除storage事件
  ipcMain.on('clear-data', function (event, arg) {
    // 这里只是清空storage中的skywalker 不要清空storage所有的数据
    storage.set('skywalker', {
      skywalkerArr: defaultArr
    }, err => {
      if (err) throw err
      console.log('clear successed')

      // 发送默认数据 到渲染进程
      win.webContents.send('skywalker', { skywalkerArr: defaultArr })
    })
  })

  // 监听copy事件
  ipcMain.on('close-window', function (event, arg) {
    win.hide()
  })

  // 加载完成后把storage传给渲染进程
  win.webContents.on('did-finish-load', () => {
    storage.get('skywalker', (err, data) => {
      if (err) throw err

      const origin = data.skywalkerArr && data.skywalkerArr.length > 0 ? data.skywalkerArr : defaultArr
      console.log('origin:', origin)

      // 发送数据到渲染进程
      win.webContents.send('skywalker', { skywalkerArr: origin })
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
    app.hide()
  })
}

export function skywalker (win, app) {
  watcher(win, app)
  listener(win)
  hotKey(win)
  windowConfig(win, app)
}
