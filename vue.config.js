module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Skywalker',
        directories: {
          buildResources: 'src/assets',
          output: 'dist_electron'
        }
        // mac: {
        //   target: 'dmg',
        //   icon: './resources/icons/icon.icns'
        // }
      }
    }
  }
}
