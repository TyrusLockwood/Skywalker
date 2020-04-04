<template>
  <div class="container" ref="wrap">
    <ul class="skywalkerBox">
      <li class="item"
        @click="itemActive(index)"
        :class="index === active ? 'item-acitve' : ''"
        v-for="(item, index) in listData"
        :key="index" >{{ item }}</li>
    </ul>
    <div class="clear" @click="clear">clear</div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { ipcRenderer } from 'electron'
export default {
  name: 'Skywalker',
  data () {
    return {
      active: 0,
      listData: [],
      scrollX: null
    }
  },
  mounted () {
    const doc = document
    this.onKeyDownListen(doc, 37)
    this.onKeyDownListen(doc, 39)

    ipcRenderer.on('skywalker', (event, message) => {
      console.log('msg:', message)

      // 空数据判断
      !message.skywalkerArr || message.skywalkerArr.length === 0
        ? this.listData = ['欢迎使用 Skywalker !', '你可以尝试多次复制文本', '通过快捷键调起面板', '查找你刚刚复制过的文本', '遇到问题请与我联系', 'tyrusl@163.com']
        : this.listData = message.skywalkerArr

      console.log('this.listData:', this.listData)

      // 数据渲染完成后 初始化滚动
      this.$nextTick(() => {
        this.betterScrollInit()
      })
    })
  },
  methods: {
    // 滚动初始化
    betterScrollInit () {
      this.scrollX = new BScroll(this.$refs.wrap, {
        probeType: 3,
        scrollX: true,
        scrollY: false,
        click: true
      })

      // 获取所有item
      this.tabItem = document.querySelectorAll('.item')
      console.log('tabItem.length:', this.tabItem.length)
    },
    onKeyDownListen (d, k) {
      d.addEventListener('keydown', e => {
        if (e.keyCode === k) {
          if (k === 37) {
            console.log('<-')
          } else if (k === 39) {
            console.log('->')
          }
        }
      })
    },
    itemActive (idx) {
      // 选中项滚动到屏幕中间
      this.scrollX.scrollToElement(this.tabItem[idx], 500, true, false)
      this.active = idx
    },
    clear () {
      ipcRenderer.send('clear-data', 1)
      this.listData = ['欢迎使用 Skywalker !', '你可以尝试多次复制文本', '通过快捷键调起面板', '查找你刚刚复制过的文本', '遇到问题请与我联系', 'tyrusl@163.com']
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
        padding: 20px 14px;
        border-radius: 10px;
        box-sizing: border-box;
        box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
        background-color: #fff;
        transition: transform .5s, color .4s;
        color: #999;

        &.item-acitve {
          transform: scale(1.04, 1.04);
          color: #2c3e50;
        }

        &:hover {
          color: #2c3e50;
        }
      }
    }

    .clear {
      position: fixed;
      top: 10px;
      left: 10px;
      height: 20px;
      padding: 4px 10px;
      border-radius: 10px;
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
