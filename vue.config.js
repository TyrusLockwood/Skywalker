const glob = require('glob')

function getEntry (url) {
  const entrys = {}
  glob.sync(url).forEach(item => {
    const urlArr = item.split('/').splice(-3)
    entrys[urlArr[1]] = {
      entry: 'src/pages/' + urlArr[1] + '/' + 'index.js',
      template: 'src/pages/' + urlArr[1] + '/' + 'index.html',
      filename: urlArr[1] + '.html',
      title: 'pages-' + urlArr[1]
    }
  })
  return entrys
}
const pages = getEntry('./src/pages/**?/*.html')

module.exports = {
  pages,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Skywalker'
        // directories: {
        //   buildResources: 'src/assets',
        //   output: 'dist_electron'
        // },
        // extraResources: [
        //   'src/assets/'
        // ]
        // extraResources: [
        //   {
        //     from: 'src/assets/',
        //     to: 'icons/'
        //   }
        // ]
      }
    }
  }
}
