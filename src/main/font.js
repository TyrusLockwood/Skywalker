const Store = require('electron-store')
const store = new Store()

// 设置字体大小
export const setFontSize = (win, size = 'normal') => {
  win.webContents.send('font-size', { fontSize: size })
  store.set('font-size', size)
}

// 初始化字体大小
export const initFontSize = win => {
  const fontSize = getFontSize()
  if (fontSize !== 'normal') {
    win.webContents.send('font-size', { fontSize: fontSize })
  }
  return fontSize
}

// 从存储中获取字体大小
export const getFontSize = () => {
  return store.get('font-size', 'normal')
}
