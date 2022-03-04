<template>
  <ul class="toolbar">
    <li class="help">
      <img src="@/assets/icon/alarm-warning-line.svg" />
    </li>
    <li class="code" @click="gotoCode">
      <img src="@/assets/icon/github-fill.svg" />
    </li>
    <li class="back" @click="itemActive">
      <img src="@/assets/icon/arrow-go-back-line.svg" />
    </li>
    <li class="clear" @click="clear">
      <img src="@/assets/icon/delete-bin-line.svg" />
    </li>
  </ul>
</template>

<script setup>
import { defineEmits } from 'vue'

const em = defineEmits(['itemActive', 'clear', 'gotoCode'])

const itemActive = () => {
  em('itemActive', 0)
}

// 清除数据
const clear = () => {
  em('clear')
}

// 查看代码
const gotoCode = () => {
  em('gotoCode')
}

</script>

<style scoped lang="scss">
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
</style>
