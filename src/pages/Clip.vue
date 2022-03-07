<template>
  <div class="container" ref="wrap">
    <ul class="list" :style="`width: ${ listWidth }px`">
      <listItem
        @itemActive="itemActive"
        @toUsual="toUsual"
        @writeDataAndClose="writeDataAndClose"
        v-for="(item, index) in state.listData"
        :listItem="item"
        :listIndex="index"
        :listActive="active"
        :mode="mode"
        :key="index">
      </listItem>
    </ul>
    <ul class="usual-list" v-show="state.usualData.length">
      <usualItem
        @itemUsual="writeDataAndClose"
        v-for="(item, index) in state.usualData"
        :usualItem="item"
        :usualIndex="index"
        :usualActive="usual"
        :mode="mode"
        :key="index">
      </usualItem>
    </ul>
    <toolbar
      @itemActive="itemActive(0)"
      @clear="clear"
      @gotoCode="gotoCode">
    </toolbar>
    <div class="tips" v-show="isShowTips">
      <img src="@/assets/icon/checkbox-multiple-line.svg" />
      复制成功
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, nextTick } from 'vue'
import BScroll from '@better-scroll/core'
import { ipcRenderer, shell } from 'electron'
import keyCode from '@/utils/keyCode'
import listItem from '@/components/listItem.vue'
import toolbar from '@/components/toolbar.vue'
import usualItem from '@/components/usualItem.vue'
const { clipboard } = require('electron')

const active = ref(0)
const usual = ref(0)
const scrollX = ref(null)
const isShowTips = ref(false)
const listItemEL = ref(null)
const wrap = ref(null)
const mode = ref(1)
const state = reactive({
  listData: [],
  usualData: []
})

const listWidth = computed(() => {
  return state.listData.length * (160 + 16)
})

onMounted(() => {
  const doc = document
  onCopyListen(doc)
  onIpcListen()
})

// 滚动初始化
const betterScrollInit = () => {
  scrollX.value = new BScroll(wrap.value, {
    probeType: 0,
    scrollX: true,
    scrollY: false,
    tap: true
  })

  listItemEL.value = document.querySelectorAll('.list-item')
  console.log('listItemEL.length:', listItemEL.value.length)
}

// 监听主/渲染进程交互
const onIpcListen = () => {
  // 监听初始化数据
  ipcRenderer.on('init-data', (event, message) => {
    state.listData = message.clipArr
    state.usualData = message.usualArr

    // 数据渲染完成后 初始化滚动
    nextTick(() => {
      betterScrollInit()
    })
  })

  // 监听新的剪贴板数据
  ipcRenderer.on('clip', (event, message) => {
    console.log('msg:', message)

    // 更新数据
    state.listData = message.clipArr
    console.log('state.listData:', state.listData)

    // 数据渲染完成后 初始化滚动
    nextTick(() => {
      betterScrollInit()
    })

    // 如果有新数据 跳到起始位置
    if (active.value !== 0) {
      itemActive(0)
    }
  })

  // 监听新的常用数据
  ipcRenderer.on('usual', (event, message) => {
    state.usualData = message.usualArr
  })
}

const onCopyListen = d => {
  d.addEventListener('keydown', e => {
    if (keyCode.cmdCOrReturnOrSpace(e)) {
      // 选中当前
      writeData(mode.value === 1
        ? state.listData[active.value]
        : state.usualData[usual.value])
      close()
    } else if (keyCode.escOrX(e)) {
      // 主进程关闭面板
      close()
    } else if (keyCode.aOrLeft(e)) {
      // 向左
      mode.value === 1
        ? itemActive(active.value !== 0 ? active.value - 1 : 0)
        : itemUsual(usual.value !== 0 ? usual.value - 1 : 0)
    } else if (keyCode.dOrRight(e)) {
      // 向右
      mode.value === 1
        ? itemActive(active.value !== state.listData.length - 1 ? active.value + 1 : active.value)
        : itemUsual(usual.value !== state.usualData.length - 1 ? usual.value + 1 : usual.value)
    } else if (keyCode.upOrW(e)) {
      // 切换到常用模式
      mode.value = 2
    } else if (keyCode.downOrS(e)) {
      // 切换到剪贴板模式
      mode.value = 1
    } else if (keyCode.justF(e)) {
      // 将当前项添加到常用模式
      toUsual(state.listData[active.value])
    } else if (keyCode.cmdOptionI(e)) {
      // 生产环境下 禁止打开控制台
      e.preventDefault()
    }
  })
}

// 当前选中项：常用模式
const itemUsual = idx => {
  usual.value = idx
}

// 当前选中项：剪贴板模式
const itemActive = idx => {
  // 选中项滚动到屏幕中间
  scrollX.value.scrollToElement(listItemEL.value[idx], 300, true, false)
  active.value = idx
}

// 写入剪贴板
const writeData = data => {
  clipboard.writeText(data.text)
  isShowTips.value = true
}

// 关闭面板
const close = (delay = 400) => {
  let closeTimer = null
  mode.value = 1
  closeTimer = setTimeout(() => {
    if (isShowTips.value) isShowTips.value = false
    ipcRenderer.send('close-window', 1)
    clearTimeout(closeTimer)
  }, delay)
}

// 把当前项存入常用
const toUsual = data => {
  console.log(data)
  ipcRenderer.send('usual-data', data.text)
}

// 点击回调合并方法
const writeDataAndClose = data => {
  writeData(data)
  close()
}

// 清除数据
const clear = () => {
  // 主进程清除数据
  ipcRenderer.send('clear-data', 1)

  // 重新获取所有item
  nextTick(() => {
    listItemEL.value = document.querySelectorAll('.list-item')
    scrollX.value.scrollToElement(listItemEL.value[0], 300, true, false)
    // 选中第一项
    active.value = 0
  })
}

// 查看代码
const gotoCode = () => {
  shell.openExternal('https://github.com/Tyrus1113/Skywalker')
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
  }

  .usual-list {
    position: fixed;
    top: 10px;
    left: 80px;
    width: 1000px;
    height: 30px;
    display: flex;
    align-items: center;
  }

  .tips {
    position: fixed;
    bottom: 10px;
    right: 20px;
    width: 140px;
    line-height: 40px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-radius: 6px;
    background-color: #2c3e50;
    box-shadow: 0px 1px 10px 0px rgba(44, 62, 80, .6);

    img {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
  }
}
</style>
