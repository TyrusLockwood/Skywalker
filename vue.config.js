const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.resolve.alias
      .set('path', false)
      .set('fs', false)
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'Skywalker',
        mac: {
          icon: './public/icon_512x512@3x.png'
        }
      }
    }
  }
})
