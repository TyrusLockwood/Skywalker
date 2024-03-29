<template>
  <li :class="`list-item ${ activeStyle }`"
    @click="itemActive(prop.listIndex)">
    <div class="list-item-mask">
      <div class="item-content">
        <span :class="`${ prop.fontSize }`">{{ prop.listItem.text }}</span>
      </div>
      <div class="item-info">
        <div v-show="prop.date !== ''" class="item-time" :class="`${ prop.fontSize }`">{{ itemTime(prop.listItem.date) }}</div>
        <div class="item-info-operation">
          <div v-show="prop.listIndex === prop.listActive" class="item-copy" @click="onUsual(prop.listItem)">
            <i class="ri-star-line"></i>
          </div>
          <div v-show="prop.listIndex === prop.listActive" class="item-copy" @click="writeDataAndClose(prop.listItem)">
            <i class="ri-file-copy-line"></i>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup>
import { defineEmits, defineProps, computed } from 'vue'
import { dateFormatter, periodTime } from '@/utils/utils'

const prop = defineProps({
  listItem: {
    type: Object,
    default: () => {}
  },
  listIndex: {
    type: Number,
    default: 0
  },
  listActive: {
    type: Number,
    default: 0
  },
  fontSize: {
    type: String,
    default: 'normal'
  },
  mode: {
    type: Number,
    default: 1
  }
})
const em = defineEmits(['itemActive', 'writeDataAndClose'])

const itemActive = idx => {
  em('itemActive', idx)
}

const writeDataAndClose = item => {
  em('writeDataAndClose', item)
}

const onUsual = item => {
  em('onUsual', item)
}

const itemTime = computed(() => {
  return time => {
    return periodTime(dateFormatter('YYYY-MM-DD HH:mm:ss', time))
  }
})

const activeStyle = computed(() => {
  let style = ''
  if (prop.mode === 2) {
    style += 'list-disable '
  }
  if (prop.listActive === prop.listIndex) {
    style += 'item-acitve '
  }
  return style
})
</script>

<style scoped lang="scss">
.list-disable {
  box-shadow: none !important;
  background-color: #fafafa !important;
}

.list-item {
  color: #757d85;
  width: 160px;
  height: 180px;
  margin: 36px 8px 0;
  border-radius: 10px;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .3);
  background-color: #fafafa;
  background-position: 160px 180px;
  transition: transform .3s, color .4s, border .6s, background-position .6s, background-color .6s, box-shadow .6s;

  .list-item-mask {
    width: 100%;
    height: 100%;
    padding: 12px 12px 6px;
    box-sizing: border-box;
  }

  &.item-acitve {
    transform: scale(1.04, 1.04);
    color: #2c3e50;
    background-color: #fff;
    box-shadow: 0px 2px 40px 4px rgba(137, 159, 185, .3);
    background: radial-gradient(circle closest-corner at 120px 120px, #66cbff 10%, #fff);
    background-position: center;
    background-repeat: no-repeat;

    .list-item-mask {
      backdrop-filter: blur(40px);
      background-color: rgba(255, 255, 255, .6);
    }
  }

  &:hover {
    color: #2c3e50;
  }

  .item-content {
    width: 100%;
    display: block;
    overflow-y: auto;
    font-weight: 500;
    overflow-x: hidden;
    height: calc(100% - 24px);

    span {
      font-size: 16px;
      display: block;
      overflow: hidden;
      // word-break: break-all;
      word-wrap: break-word;

      &.small {
        font-size: 14px;
      }

      &.large {
        font-size: 20px;
      }
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
    height: 24px;
    position: relative;
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .item-time {
      top: 0;
      left: 0;
      font-size: 12px;
      font-weight: 500;
      user-select: none;
      line-height: 20px;

      &.small {
        font-size: 10px;
      }

      &.large {
        font-size: 14px;
      }
    }

    .item-info-operation {
      display: flex;
    }

    .item-copy {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 30px;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      margin-left: 6px;

      i {
        font-size: 16px;
      }

      &:active {
        box-shadow: inset 0px 1px 3px rgba(137, 159, 185, .3)
      }

      &:hover {
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
