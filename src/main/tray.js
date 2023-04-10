import { setFontSize, getFontSize } from './font'

// 初始化时回显字体大小设置
const fontSize = getFontSize()

// 键盘监听
export const initTray = function () {
  const contextMenu = [
    {
      label: '关于 Skywalker',
      sublabel: 'version',
      role: 'about'
    },
    {
      label: '显示面板',
      click: () => {
        this.win.show()
        this.win.focus()
      }
    },
    {
      label: '刷新应用',
      role: 'reload'
    },
    { type: 'separator' },
    {
      label: '字体大小',
      submenu: [
        {
          label: '小',
          type: 'radio',
          checked: fontSize === 'small',
          click: () => {
            setFontSize(this.win, 'small')
          }
        },
        {
          label: '中',
          type: 'radio',
          checked: fontSize === 'normal',
          click: () => {
            setFontSize(this.win, 'normal')
          }
        },
        {
          label: '大',
          type: 'radio',
          checked: fontSize === 'large',
          click: () => {
            setFontSize(this.win, 'large')
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => this.app.exit()
    }
  ]

  return contextMenu
}
