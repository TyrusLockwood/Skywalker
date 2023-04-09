const Store = require('electron-store')
const store = new Store()

export const setFontSize = function (size = 'normal') {
  console.log('this:', this)
  this.win.webContents.send('font-size', { fontSize: size })
  store.set('font-size', size)
}

export const initFontSize = function (win) {
  const fontSize = store.get('font-size', 'normal')
  if (fontSize !== 'normal') {
    win.webContents.send('font-size', { fontSize: fontSize })
  }
}
