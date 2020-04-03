<template>
  <div class="container" ref="wrap">
    <ul class="skywalkerBox">
      <li class="item"
        @click="itemActive(index)"
        :class="index === active ? 'item-acitve' : ''"
        v-for="(item, index) in listData"
        :key="index" >{{ item }}</li>
    </ul>
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
      listData: []
    }
  },
  mounted () {
    this.betterScrollInit()

    const doc = document
    this.onKeyDownListen(doc, 37)
    this.onKeyDownListen(doc, 39)

    ipcRenderer.on('skywalker', (event, message) => {
      console.log('msg:', message)
      message.length === 0
        ? this.listData = [123, 445, 453, 768, 8, 9, 234]
        : this.listData = message.skywalkerArr
      console.log('this.listData:', this.listData)
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
      this.scrollX.scrollToElement(this.tabItem[idx], 800, true, false)
      this.active = idx
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
        transition: transform .8s, color .4s;
        color: #999;

        &.item-acitve {
          transform: scale(1.02, 1.02);
          color: #2c3e50;
        }

        &:hover {
          color: #2c3e50;
        }
      }
    }
  }
</style>
