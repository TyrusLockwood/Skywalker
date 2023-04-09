<template>
  <div class="container" ref="wrap">
    <ul class="list" :style="`width: ${ listWidth }px`">
      <listItem
        @itemActive="itemActive"
        @onUsual="onUsual"
        @writeDataAndClose="writeDataAndClose"
        v-for="(item, index) in state.listData"
        :listItem="item"
        :listIndex="index"
        :listActive="active"
        :fontSize="fontSize"
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
        :fontSize="fontSize"
        :mode="mode"
        :key="index">
      </usualItem>
    </ul>
    <toolbar
      @itemActive="itemActive(0)"
      @clear="clear"
      @gotoCode="gotoCode">
    </toolbar>
    <div class="tips" :class="`${ isShowCopiedTips ? 'active' : '' }`">
      <i class="ri-check-line"></i>
      复制成功
    </div>
    <div class="tips" :class="`${ isShowCollectTips ? 'active' : '' }`">
      <i class="ri-star-line red"></i>
      收藏成功
    </div>
    <div class="tips" :class="`${ isShowSettingTips ? 'active' : '' }`">
      <i class="ri-check-line"></i>
      设置成功
    </div>
    <div class="tips" :class="`${ isShowRemoveTips ? 'active' : '' }`">
      <i class="ri-check-line"></i>
      删除成功
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
const isShowCopiedTips = ref(false)
const isShowCollectTips = ref(false)
const isShowSettingTips = ref(false)
const isShowRemoveTips = ref(false)
const listItemEL = ref(null)
const wrap = ref(null)
const mode = ref(1)
const fontSize = ref('normal')
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
    tap: true,
    // bounceTime: 200
    // swipeBounceTime: 100
    bounce: {
      left: false,
      right: false
    }
  })

  listItemEL.value = document.querySelectorAll('.list-item')
  console.log('listItemEL.length:', listItemEL.value.length)
}

// 监听主/渲染进程交互
const onIpcListen = () => {
  // 监听设置文字大小
  ipcRenderer.on('font-size', (event, message) => {
    const fontSizeType = message.fontSize
    console.log('fontSizeType:', fontSizeType)
    if (fontSizeType) {
      fontSize.value = fontSizeType

      isShowSettingTips.value = true
      setTimeout(() => {
        isShowSettingTips.value = false
      }, 2000)
    }
  })

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
      onUsual(state.listData[active.value])
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
  isShowCopiedTips.value = true
}

// 关闭面板
const close = (delay = 400) => {
  let closeTimer = null
  closeTimer = setTimeout(() => {
    if (isShowCopiedTips.value) isShowCopiedTips.value = false
    ipcRenderer.send('close-window', 1)
    mode.value = 1
    clearTimeout(closeTimer)
  }, delay)
}

// 把当前项存入常用
const onUsual = data => {
  console.log(data)
  isShowCollectTips.value = true
  setTimeout(() => {
    isShowCollectTips.value = false
  }, 2000)
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

    isShowRemoveTips.value = true
    setTimeout(() => {
      isShowRemoveTips.value = false
    }, 2000)
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
    width: 88px;
    height: 24px;
    position: fixed;
    top: -40px;
    left: 0;
    right: 0;
    margin: auto;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #2c3e50;
    border-radius: 6px;
    background-color: #fff;
    padding: 4px 12px;
    box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .3);
    transition: top .4s;

    &.active {
      top: 18px;
    }

    i {
      font-size: 18px;
      color: #0fe370;

      &.red {
        color: #ff2626;
      }
    }
  }
}
</style>
