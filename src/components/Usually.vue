<template>
  <div class="container" ref="wrapUsually">
    <ul class="list" :style="`width: ${ listWidth }px`">
      <li class="list-item-usually"
        @click="itemActive(index)"
        :class="index === active ? 'item-acitve' : ''"
        v-for="(item, index) in state.listData"
        :key="index">
        <div class="item-container">
          <span>{{ item.text }}</span>
        </div>
        <div class="item-info">
          <div v-show="item.date !== ''" class="item-time">{{ itemTime(item.date) }}</div>
          <div v-show="index === active" class="item-copy" @click="writeDataAndClose(active)">
            <img height="16" width="16" src="@/assets/icon/file-copy-line.svg" />
          </div>
        </div>
      </li>
    </ul>
    <ul class="toolbar">
      <li class="help" @click="emit('changeList')">
        <img src="@/assets/icon/alarm-warning-line.svg" />
      </li>
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

<script setup>
import { computed, onMounted, reactive, ref, nextTick, defineEmits, defineProps } from 'vue'
import { ipcRenderer } from 'electron'
import { dateFormatter, periodTime } from '@/utils/utils'
const { clipboard } = require('electron')

const active = ref(0)
const isShowTips = ref(false)
const listItem = ref(null)
const wrapUsually = ref(null)
const state = reactive({
  listData: []
})

const emit = defineEmits(['changeList'])
const prop = defineProps({
  chainCode: {
    type: Number,
    default: 0
  }
})

const listWidth = computed(() => {
  return state.listData.length * (160 + 16)
})

const itemTime = computed(() => {
  return time => {
    return periodTime(dateFormatter('YYYY-MM-DD HH:mm:ss', time))
  }
})

onMounted(() => {
  const doc = document
  nIpcListen()
  console.log(prop.chainCode)
  if (prop.chainCode === 0) {
    onCopyListen(doc)
  }
})

// 监听主/渲染进程交互
const nIpcListen = () => {
  ipcRenderer.on('clip', (event, message) => {
    console.log('msg:', message)

    // 更新数据
    state.listData = message.clipArr
    console.log('state.listData:', state.listData)

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
    } else if (e.keyCode === 27) {
      ipcRenderer.send('close-window', 1)
    } else if (e.keyCode === 37 || e.keyCode === 65) {
      const moveItem = active.value !== 0 ? active.value - 1 : 0
      itemActive(moveItem)
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      const moveItem = active.value !== state.listData.length - 1
        ? active.value + 1
        : active.value
      itemActive(moveItem)
    } else if (e.keyCode === 73 && e.metaKey && e.altKey) {
      console.log('devtool')
      // 生产环境下 禁止打开控制台
      e.preventDefault()
    }
  })
}

// 当前选中项
const itemActive = idx => {
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
    listItem.value = document.querySelectorAll('.list-item-usually')

    // 选中第一项
    active.value = 0
  })
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

      .list-item-usually {
        width: 160px;
        height: 180px;
        margin: 36px 8px 0;
        padding: 12px 12px 6px;
        font-size: 12px;
        border-radius: 10px;
        box-sizing: border-box;
        text-align: center;
        background-color: #1acaff;
        box-shadow: 0px 1px 10px 2px rgba(26, 202, 255, .8);
        // box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
        // background-color: #f9f9f9;
        transition: transform .3s, color .4s, background-color .6s, box-shadow .6s;
        // transition: transform .3s, color .4s, border .6s, background-color .6s, box-shadow .6s;
        color: #fff;
        font-weight: 600;

        &.item-acitve {
          transform: scale(1.04, 1.04);
          color: #fff;
          // border: 2px solid rgb(44, 62, 80);
          // background-color: rgba(44, 62, 80, 0.2);
          // background-color: #1acaff;
          // box-shadow: 0px 1px 10px 0px rgba(26, 202, 255, .8);

          background-color: #ff7bb0;
          box-shadow: 0px 1px 10px 4px rgba(255, 123, 176, .8);
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
      top: 10px;
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
