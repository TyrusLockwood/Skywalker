module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Skywalker',
        directories: {
          buildResources: 'src/assets',
          output: 'dist_electron'
        },
        extraResources: ['icons/']
        // mac: {
        //   target: 'dmg',
        //   icon: './resources/icons/icon.icns'
        // }
      }
    }
  }
}
