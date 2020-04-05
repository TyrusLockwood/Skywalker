<template>
  <div class="container" ref="wrap">
    <ul class="skywalkerBox" :style="`width: ${skywalkerBoxWidth}px`">
      <li class="item"
        @click="itemActive(index)"
        :class="index === active ? 'item-acitve' : ''"
        v-for="(item, index) in listData"
        :key="index" >
        <div class="item-container">
          <span>{{ item }}</span>
        </div>
        <div v-show="index === active" class="item-copy" @click="copy">Copy</div>
      </li>
    </ul>
    <div class="clear" @click="clear">Clear</div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { ipcRenderer } from 'electron'
const { clipboard } = require('electron').remote

export default {
  name: 'Skywalker',

  data () {
    return {
      active: 0,
      listData: [],
      scrollX: null
    }
  },

  computed: {
    skywalkerBoxWidth () {
      return this.listData.length * 310
    }
  },

  mounted () {
    const doc = document
    this.onIpcListen()
    this.onKeyDownListen(doc, 37)
    this.onKeyDownListen(doc, 39)
    this.onCopyListen(doc)
  },

  methods: {
    // 滚动初始化
    betterScrollInit () {
      this.scrollX = new BScroll(this.$refs.wrap, {
        probeType: 3,
        scrollX: true,
        scrollY: false,
        tap: true
      })

      // 获取所有item
      this.listItem = document.querySelectorAll('.item')
      console.log('listItem.length:', this.listItem.length)
    },

    // 监听主/渲染进程交互
    onIpcListen () {
      ipcRenderer.on('skywalker', (event, message) => {
        console.log('msg:', message)

        // 更新数据
        this.listData = message.skywalkerArr
        console.log('this.listData:', this.listData)

        // 数据渲染完成后 初始化滚动
        this.$nextTick(() => {
          this.betterScrollInit()
        })
      })
    },

    // 监听键盘事件
    onKeyDownListen (d, k) {
      d.addEventListener('keydown', e => {
        if (e.keyCode === k) {
          if (k === 37) {
            // 左箭头
            const moveItem = this.active !== 0 ? this.active - 1 : 0
            this.itemActive(moveItem)
          } else if (k === 39) {
            // 右箭头
            const moveItem = this.active !== this.listData.length - 1
              ? this.active + 1
              : this.active
            this.itemActive(moveItem)
          }
        }
      })
    },

    // 监听复制事件
    onCopyListen (d) {
      d.addEventListener('keydown', e => {
        if (e.keyCode === 67 && e.metaKey) {
          this.writeDataAndClose(this.listData[this.active])
        }
      })
    },

    // 复制
    copy () {
      this.writeDataAndClose(this.listData[this.active])
    },

    // 当前选中项
    itemActive (idx) {
      // 选中项滚动到屏幕中间
      this.scrollX.scrollToElement(this.listItem[idx], 300, true, false)
      this.active = idx
    },

    // 写入数据并关闭窗口
    writeDataAndClose (data) {
      console.log('writeDataAndClose:', data)

      // 写入剪贴板
      clipboard.writeText(data)

      // 主进程关闭窗口
      ipcRenderer.send('close-window', 1)
    },

    // 清除数据
    clear () {
      // 主进程清除数据
      ipcRenderer.send('clear-data', 1)

      // 选中第一项
      this.active = 0

      // 重新获取所有item
      this.$nextTick(() => {
        this.listItem = document.querySelectorAll('.item')
        this.scrollX.scrollToElement(this.listItem[0], 300, true, false)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    .skywalkerBox {
      width: 10000px;
      height: 100%;
      padding: 0 5px;
      overflow: hidden;
      display: flex;
      align-items: center;

      .item {
        width: 300px;
        height: 400px;
        margin: 0 10px;
        padding: 20px 14px 6px;
        border-radius: 10px;
        box-sizing: border-box;
        box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
        background-color: #fff;
        transition: transform .3s, color .4s;
        color: #999;

        &.item-acitve {
          transform: scale(1.04, 1.04);
          color: #2c3e50;
        }

        &:hover {
          color: #2c3e50;
        }

        .item-container {
          display: block;
          width: 100%;
          height: calc(100% - 30px);
          overflow-x: hidden;
          overflow-y: auto;

          span {
            display: block;
            overflow: hidden;
          }

          &::-webkit-scrollbar {
              /*滚动条整体样式*/
              width: 1px;
              background-color: #fff;
          }
          &::-webkit-scrollbar-thumb {
              /*滚动条整体样式*/
              width: 1px;
              background: rgba(44, 62, 80, .2);
          }
        }

        .item-copy {
          width: 50px;
          height: 20px;
          line-height: 20px;
          margin-top: 10px;
          font-size: 12px;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          background-color: #fff;
          box-shadow: 0px 1px 4px 0px rgba(137, 159, 185, .5);

          &:active {
            box-shadow: inset 0px 1px 3px rgba(137, 159, 185, .5)
          }
        }
      }
    }

    .clear {
      position: fixed;
      top: 10px;
      left: 10px;
      height: 20px;
      padding: 4px 10px;
      border-radius: 6px;
      background-color: #fff;
      text-align: center;
      line-height: 20px;
      color: #999;
      cursor: pointer;
      box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);

      &:hover {
        color: #2c3e50;
        transform: scale(1.04, 1.04);
      }

      &:active {
        box-shadow: 0px 2px 8px 0px rgba(137, 159, 185, .5);
      }
    }
  }
</style>
