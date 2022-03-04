<template>
  <li class="list-item"
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
</template>

<script setup>
const itemActive = index => {

}
</script>

<style scoped>

</style>
