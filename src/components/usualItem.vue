<template>
    <li :class="`usual-item ${ activeStyle }`" @click="itemUsual(prop.usualItem)">
      <span :class="`${ prop.fontSize }`">{{ prop.usualItem.text }}</span>
    </li>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

const prop = defineProps({
  usualItem: {
    type: Object,
    default: () => {}
  },
  usualIndex: {
    type: Number,
    default: 0
  },
  usualActive: {
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

const em = defineEmits(['itemUsual'])

const itemUsual = txt => {
  em('itemUsual', txt)
}

const activeStyle = computed(() => {
  let style = ''
  if (prop.mode === 1) {
    style += 'usual-disable '
  }
  if (prop.usualActive === prop.usualIndex) {
    style += 'usual-active '
  }
  return style
})
</script>

<style scoped lang="scss">
.container .usual-active {
  color: #2c3e50;
  background-color: #fff;
  box-shadow: 0px 2px 40px 4px rgba(137, 159, 185, .3);
}

.usual-disable {
  box-shadow: none !important;
  background-color: #fafafa !important;
}

.usual-item {
  display: flex;
  align-items: center;
  max-width: 180px;
  height: 26px;
  line-height: 26px;
  box-sizing: border-box;
  font-weight: 500;
  margin-right: 15px;
  padding: 6px;
  border-radius: 6px;
  background-color: #fafafa;
  text-align: center;
  line-height: 20px;
  color: #757d85;
  cursor: pointer;
  box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .3);
  transition: color .4s, background-color .6s, box-shadow .6s;

  span {
    font-size: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &.small {
      font-size: 14px;
    }

    &.large {
      font-size: 20px;
    }
  }

  &:active {
    box-shadow: 0px 2px 8px 0px rgba(137, 159, 185, .3);
  }

  &:hover {
    color: #2c3e50;
  }
}

</style>
