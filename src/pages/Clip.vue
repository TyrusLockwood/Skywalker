<template>
  <div class="container" ref="wrap">
    <ul class="list" :style="`width: ${ listWidth }px`">
      <listItem
        @itemActive="itemActive(index)"
        v-for="(item, index) in state.listData"
        :listItem="item"
        :listIndex="index"
        :listActive="active"
        :key="index">
      </listItem>
    </ul>
    <toolbar
      @itemActive="itemActive(0)"
      @clear="clear"
      @gotoCode="gotoCode">
    </toolbar>
    <div class="tips" v-show="isShowTips">
      <img src="@/assets/icon/check-line.svg" />
      复制完成
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, nextTick } from 'vue'
import BScroll from '@better-scroll/core'
import { ipcRenderer, shell } from 'electron'
import listItem from '@/components/listItem.vue'
import toolbar from '@/components/toolbar.vue'
const { clipboard } = require('electron')

const active = ref(0)
const scrollX = ref(null)
const isShowTips = ref(false)
const listItemEL = ref(null)
const wrap = ref(null)
const state = reactive({
  listData: []
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
}

const onCopyListen = d => {
  d.addEventListener('keydown', e => {
    if ((e.keyCode === 67 && e.metaKey) || e.keyCode === 13 || e.keyCode === 32) {
      writeDataAndClose(state.listData[active.value])
    } else if (e.keyCode === 27 || e.keyCode === 88) {
      // 主进程关闭窗口
      ipcRenderer.send('close-window', 1)
    } else if (e.keyCode === 37 || e.keyCode === 65) {
      const moveItem = active.value !== 0 ? active.value - 1 : 0
      itemActive(moveItem)
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      const moveItem = active.value !== state.listData.length - 1
        ? active.value + 1
        : active.value
      itemActive(moveItem)
    } else if (e.keyCode === 67) {
      // 切换模式
    } else if (e.keyCode === 73 && e.metaKey && e.altKey) {
      console.log('devtool')
      // 生产环境下 禁止打开控制台
      e.preventDefault()
    }
  })
}

// 当前选中项
const itemActive = idx => {
  // 选中项滚动到屏幕中间
  scrollX.value.scrollToElement(listItemEL.value[idx], 300, true, false)
  active.value = idx
}

// 写入数据并关闭窗口
const writeDataAndClose = data => {
  console.log('writeDataAndClose:', data)

  // 写入剪贴板
  clipboard.writeText(data.text)

  isShowTips.value = true

  setTimeout(() => {
    if (isShowTips.value) {
      // 主进程关闭窗口
      ipcRenderer.send('close-window', 1)
    }
    // 提示框显示200毫秒即可
    isShowTips.value = false
  }, 200)
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

/* 监听copy/enter/esc/left/right事件
*  JavaScript Keyboard Map (Mac layout)
*              esc—— F1——— F2——— F3——— F4——— F5——— F6——— F7——— F8——— F9——— F10—— F11—— F12—— F13—————+
*             |  27 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 |  ???  |
*            ` ——— 1———— 2———— 3———— 4———— 5———— 6———— 7———— 8———— 9———— 0———— - ——— = ——— delete——+
*           | 192 |  49 |  50 |  51 |  52 |  53 |  54 |  55 |  56 |  57 |  58 |  59 |  60 |   61  |
*          tab———— Q———— W———— E———— R———— T———— Y———— U———— I———— O———— P———— [ ——— ] ——— \ ————+
*         |   9   |  81 |  87 |  69 |  82 |  84 |  89 |  85 |  73 |  79 |  80 | 219 | 221 | 220 |
*        caps————— A———— S———— D———— F———— G———— H———— J———— K———— L———— ; ——— ' ——— return————+
*       |    20   |  65 |  83 |  68 |  70 |  71 |  72 |  74 |  75 |  76 | 186 | 222 |   13    |
*      shift—————— Z———— X———— C———— V———— B———— N———— M———— , ——— . ——— / ——— shift—————————+
*     |    16     |  90 |  88 |  67 |  86 |  66 |  78 |  77 | 188 | 190 | 191 |     16      |
*    fn—— ctrl opt— command space—————————————————————————— command opt——+—————up————+—————+
*   |    | 17 | 18 |   91  |            32                 |   93  | 18 |     |  38 |     |
*  +————+————+————+———————+———————————————————————————————+———————+————left——down——right—+
*                                                                     |  37 |  40 |  39 |
*                                                                    +—————+—————+—————+
*/
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

  .tips {
    position: fixed;
    top: 10px;
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
