// import { Menu } from 'electron'
import { setFontSize } from './font'

// 键盘监听
export const initTray = function () {
  const contextMenu = [
    {
      label: '显示面板',
      click: () => {
        this.win.show()
        this.win.focus()
      }
    },
    {
      label: '字体大小',
      submenu: [
        {
          label: '小',
          click: () => {
            setFontSize(this.win, 'small')
          }
        },
        {
          label: '中',
          click: () => {
            setFontSize(this.win, 'normal')
          }
        },
        {
          label: '大',
          click: () => {
            setFontSize(this.win, 'large')
          }
        }
      ]
    },
    {
      label: '退出 Skywalker',
      click: () => this.app.exit()
    }
  ]
  return contextMenu
}
