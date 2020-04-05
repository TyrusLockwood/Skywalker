import { clipboard, globalShortcut, ipcMain } from 'electron'
const os = require('os')
const storage = require('electron-json-storage')

// 设置存储路径
storage.setDataPath(os.tmpdir())

// 设置存储数组
let skywalkerArr = []

// 默认文本
const defaultArr = [
  '欢迎使用 Skywalker !',
  '你可以尝试多次复制文本',
  '然后通过快捷键调起面板',
  '查找你刚刚复制过的文本',
  'Cmd+C或者双击选项',
  '遇到问题请与我联系',
  'tyrusl@163.com'
]

export function skywalker (win) {
  watcher()
  hotKey()
  listener()

  // 观察剪贴板内容变化
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
            skywalkerArr = data.skywalkerArr ? data.skywalkerArr : defaultArr

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

  // 监听事件
  function listener () {
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

  // 快捷键绑定
  function hotKey () {
    globalShortcut.register('CommandOrControl+Alt+s', () => {
      console.log('CommandOrControl+Alt+s is clicked')

      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    })
  }
}
