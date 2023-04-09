const Store = require('electron-store')
const store = new Store()

// 设置字体大小
export const setFontSize = (win, size = 'normal') => {
  win.webContents.send('font-size', { fontSize: size })
  store.set('font-size', size)
}

// 初始化字体大小
export const initFontSize = win => {
  const fontSize = store.get('font-size', 'normal')
  if (fontSize !== 'normal') {
    win.webContents.send('font-size', { fontSize: fontSize })
  }
}
