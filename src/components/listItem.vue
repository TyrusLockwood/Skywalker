<template>
  <li class="list-item"
    @click="itemActive(index)"
    :class="prop.listIndex === prop.listActive ? 'item-acitve' : ''">
    <div class="item-container">
      <span>{{ prop.listItem.text }}</span>
    </div>
    <div class="item-info">
      <div v-show="prop.date !== ''" class="item-time">{{ itemTime(prop.listItem.date) }}</div>
      <div v-show="prop.listIndex === prop.listActive" class="item-copy" @click="writeDataAndClose(prop.listActive)">
        <img height="16" width="16" src="@/assets/icon/file-copy-line.svg" />
      </div>
    </div>
  </li>
</template>

<script setup>
import { defineEmits, defineProps, computed } from 'vue'
import { dateFormatter, periodTime } from '@/utils/utils'

const em = defineEmits(['itemActive', 'writeDataAndClose'])
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
  }
})

const itemActive = idx => {
  em('itemActive', idx)
}

const writeDataAndClose = act => {
  em('writeDataAndClose', act)
}

const itemTime = computed(() => {
  return time => {
    return periodTime(dateFormatter('YYYY-MM-DD HH:mm:ss', time))
  }
})
</script>

<style scoped lang="scss">
.list-item {
  width: 160px;
  height: 180px;
  margin: 36px 8px 0;
  padding: 12px 12px 6px;
  font-size: 12px;
  border-radius: 10px;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
  background-color: #f9f9f9;
  transition: transform .3s, color .4s, border .6s, background-color .6s, box-shadow .6s;
  color: #999;

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
</style>
