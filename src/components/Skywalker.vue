<template>
  <div class="container" ref="wrap">
    <ul class="list" :style="`width: ${listWidth}px`">
      <li class="list-item"
        @click="itemActive(index)"
        :class="index === active ? 'item-acitve' : ''"
        v-for="(item, index) in listData"
        :key="index">
        <div class="item-container">
          <span>{{ item.text }}</span>
        </div>
        <div class="item-info">
          <div v-show="item.date !== ''" class="item-time">{{ itemTime(item.date) }}</div>
          <div v-show="index === active" class="item-copy" @click="copy">
            <img height="16" width="16" src="@/assets/icon/file-copy-line.svg" />
          </div>
        </div>
      </li>
    </ul>
    <ul class="toolbar">
      <!-- <li class="help">
        <img src="@/assets/icon/alarm-warning-line.svg" />
      </li>
      <li class="code" @click="gotoCode">
        <img src="@/assets/icon/github-fill.svg" />
      </li> -->
      <li class="back" @click="itemActive(0)">
        <img src="@/assets/icon/arrow-go-back-line.svg" />
      </li>
      <li class="clear" @click="clear">
        <img src="@/assets/icon/delete-bin-line.svg" />
      </li>
    </ul>
    <div class="tips" v-show="isShowTips">
      <img src="@/assets/icon/check-line.svg" />
      复制完成
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { ipcRenderer, shell } from 'electron'
import { dateFormatter, periodTime } from '../utils/utils'
const { clipboard } = require('electron').remote

export default {
  name: 'Skywalker',

  data () {
    return {
      active: 0,
      listData: [],
      scrollX: null,
      isShowTips: false,
      listItem: null
    }
  },

  computed: {
    // 滚动区域宽度
    listWidth () {
      return this.listData.length * 212
    },

    // 时间间隔
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

      this.listItem = document.querySelectorAll('.list-item')
      console.log('listItem.length:', this.listItem.length)
    },

    // 监听主/渲染进程交互
    onIpcListen () {
      ipcRenderer.on('clip', (event, message) => {
        console.log('msg:', message)

        // 更新数据
        this.listData = message.clipArr
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
        if ((e.keyCode === 67 && e.metaKey) || e.keyCode === 13 || e.keyCode === 32) {
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

      this.isShowTips = true

      setTimeout(() => {
        if (this.isShowTips) {
          // 主进程关闭窗口
          ipcRenderer.send('close-window', 1)
        }
        // 提示框显示200毫秒即可
        this.isShowTips = false
      }, 200)
    },

    // 清除数据
    clear () {
      // 主进程清除数据
      ipcRenderer.send('clear-data', 1)

      // 重新获取所有item
      this.$nextTick(() => {
        this.listItem = document.querySelectorAll('.list-item')

        this.scrollX.scrollToElement(this.listItem[0], 300, true, false)

        // 选中第一项
        this.active = 0
      })
    },

    // 查看代码
    gotoCode () {
      shell.openExternal('https://github.com/Tyrus1113')
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    .list {
      width: 10000px;
      height: 100%;
      padding: 0 20px;
      overflow: hidden;
      display: flex;
      align-items: center;

      .list-item {
        width: 200px;
        height: 220px;
        // width: 260px;
        // height: 300px;
        margin: 40px 10px 0;
        padding: 12px 12px 6px;
        border-radius: 10px;
        box-sizing: border-box;
        text-align: center;
        box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
        background-color: #f9f9f9;
        transition: transform .3s, color .4s, border .6s, background-color .6s, box-shadow .6s;
        color: #999;
        font-size: 14px;

        &.item-acitve {
          transform: scale(1.04, 1.04);
          color: #2c3e50;
          // border: 2px solid rgb(44, 62, 80);
          // background-color: rgba(44, 62, 80, 0.2);
          background-color: #fff;

          box-shadow: 0px 2px 40px 4px rgba(137, 159, 185, .5);
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
          position: relative;
          margin-top: 5px;

          .item-time {
            line-height: 30px;
            font-size: 12px;
            position: absolute;
            top: 0;
            left: 0;
          }

          .item-copy {
            display: flex;
            align-items: center;
            justify-content: center;
            // width: 50px;
            // height: 30px;
            position: absolute;
            padding: 6px;
            top: 0;
            right: 0;
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
      top: 16px;
      right: 20px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      img {
        width: 14px;
        height: 14px;
      }

      .back {
        background-color: #1acaff;
        box-shadow: 0px 1px 10px 0px rgba(26, 202, 255, .8);
      }

      .clear {
        background-color: #ff7bb0;
        box-shadow: 0px 1px 10px 0px rgba(255, 123, 176, .8);
      }

      .code {
        background-color: #2c3e50;
        box-shadow: 0px 1px 10px 0px rgba(44, 62, 80, .6);
      }

      .help {
        background-color: #26ef5c;
        box-shadow: 0px 1px 10px 0px rgba(38, 239, 92, .8);
      }

      li {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 12px;
        margin-left: 15px;
        padding: 6px;
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

    .tips {
      position: fixed;
      top: 16px;
      left: 0;
      right: 0;
      margin: auto;
      width: 100px;
      line-height: 30px;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: space-around;

      img {
        width: 18px;
        height: 18px;
      }
    }
  }
</style>
