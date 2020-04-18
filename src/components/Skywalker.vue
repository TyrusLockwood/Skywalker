<template>
  <div class="container" ref="wrap">
    <ul class="skywalkerBox" :style="`width: ${skywalkerBoxWidth}px`">
      <li class="item"
        @click="itemActive(index)"
        :class="index === active ? 'item-acitve' : ''"
        v-for="(item, index) in listData"
        :key="index" >
        <div class="item-container">
          <span>{{ item.text }}</span>
        </div>
        <div class="item-info">
          <div v-show="item.date !== ''" class="item-time">{{ itemTime(item.date) }}</div>
          <div v-show="index === active" class="item-copy" @click="copy">Copy</div>
        </div>
      </li>
    </ul>
    <ul class="toolbar">
      <li @click="itemActive(0)">Back</li>
      <li class="clear" @click="clear">Clear</li>
    </ul>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { ipcRenderer } from 'electron'
import { dateFormatter, periodTime } from '../utils/utils'
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
    },
    itemTime () {
      return time => {
        return periodTime(dateFormatter('YYYY-MM-DD HH:mm:ss', time))
      }
    }
  },

  mounted () {
    const doc = document
    this.onIpcListen()
    this.onCopyListen(doc)
  },

  methods: {
    // 滚动初始化
    betterScrollInit () {
      this.scrollX = new BScroll(this.$refs.wrap, {
        probeType: 0,
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

        // 如果有新数据 跳到起始位置
        if (this.active !== 0) {
          this.itemActive(0)
        }
      })
    },

    // 监听copy/enter/esc/left/right事件
    onCopyListen (d) {
      d.addEventListener('keydown', e => {
        if ((e.keyCode === 67 && e.metaKey) || e.keyCode === 13) {
          this.writeDataAndClose(this.listData[this.active])
        } else if (e.keyCode === 27) {
          ipcRenderer.send('close-window', 1)
        } else if (e.keyCode === 37) {
          const moveItem = this.active !== 0 ? this.active - 1 : 0
          this.itemActive(moveItem)
        } else if (e.keyCode === 39) {
          const moveItem = this.active !== this.listData.length - 1
            ? this.active + 1
            : this.active
          this.itemActive(moveItem)
        } else if (e.keyCode === 73 && e.metaKey && e.altKey) {
          console.log('devtool')
          // 生产环境下 禁止打开控制台
          // e.preventDefault()
        }
      })
    },

    // copy
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
      clipboard.writeText(data.text)

      // 主进程关闭窗口
      ipcRenderer.send('close-window', 1)
    },

    // 清除数据
    clear () {
      // 主进程清除数据
      ipcRenderer.send('clear-data', 1)

      // 重新获取所有item
      this.$nextTick(() => {
        this.listItem = document.querySelectorAll('.item')
        this.scrollX.scrollToElement(this.listItem[0], 300, true, false)

        // 选中第一项
        this.active = 0
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
      padding: 0 20px;
      overflow: hidden;
      display: flex;
      align-items: center;

      .item {
        width: 300px;
        height: 360px;
        margin: 40px 10px 0;
        padding: 20px 14px 6px;
        border-radius: 10px;
        box-sizing: border-box;
        box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
        background-color: #f5f5f5;
        transition: transform .3s, color .4s, border .6s, background-color .6s;
        color: #999;

        &.item-acitve {
          transform: scale(1.04, 1.04);
          color: #2c3e50;
          // border: 2px solid rgb(44, 62, 80);
          // background-color: rgba(44, 62, 80, 0.2);
          background-color: #fff;
        }

        &:hover {
          color: #2c3e50;
        }

        .item-container {
          display: block;
          width: 100%;
          height: calc(100% - 35px);
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

        .item-info {
          width: 100%;
          height: 30px;
          display: flex;
          justify-content: space-between;
          margin-top: 5px;

          .item-time {
            line-height: 30px;
            font-size: 14px;
          }

          .item-copy {
            width: 50px;
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
            text-align: center;
            background-color: #fff;
            box-shadow: 0px 1px 4px 0px rgba(137, 159, 185, .5);

            &:active {
              box-shadow: inset 0px 1px 3px rgba(137, 159, 185, .5)
            }

            &:hover {
              animation: hover-back .3s;
            }
          }
        }

      }
    }

    .toolbar {
      position: fixed;
      top: 20px;
      right: 20px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .clear {
        color: deeppink;

        &:hover {
          color: deeppink;
        }
      }

      li {
        font-size: 12px;
        margin-left: 15px;
        padding: 4px 10px;
        border-radius: 6px;
        background-color: #fff;
        text-align: center;
        line-height: 20px;
        color: #999;
        cursor: pointer;
        box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);

        &:active {
          box-shadow: 0px 2px 8px 0px rgba(137, 159, 185, .5);
        }

        &:hover {
          color: #2c3e50;
          transform: scale(1.04, 1.04);
          animation: hover-back .3s;
        }

        @keyframes hover-back {
          25% {
            transform: scale(1.2);
          }

          50% {
            transform: scale(1);
          }

          75% {
            transform: scale(1.1);
          }
        }
      }
    }
  }
</style>
