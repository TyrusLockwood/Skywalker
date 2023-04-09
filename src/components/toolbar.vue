<template>
  <ul class="toolbar">
    <!-- <li class="help">
      <i class="ri-alarm-warning-line"></i>
    </li> -->
    <li class="code" @click="gotoCode">
      <i class="ri-github-fill"></i>
    </li>
    <li class="back" @click="itemActive">
      <i class="ri-skip-back-line"></i>
    </li>
    <li class="clear" @click="clear">
      <i class="ri-delete-bin-line"></i>
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
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  i {
    color: #fff;
    font-size: 18px;
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
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    margin-left: 15px;
    border-radius: 6px;
    background-color: #fff;
    text-align: center;
    line-height: 20px;
    cursor: pointer;
    box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);

    &:active {
      box-shadow: 0px 2px 8px 0px rgba(137, 159, 185, .5);
    }

    &:hover {
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
