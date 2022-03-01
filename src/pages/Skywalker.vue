<template>
  <div>
    <Clip v-show="chainCode" :chainCode="1" @changeList="changeList" />
    <Usually v-show="!chainCode" :chainCode="0" @changeList="changeList" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Clip from '@/components/Clip'
import Usually from '@/components/Usually'
const chainCode = ref(true)
const changeList = a => {
  chainCode.value = !chainCode.value
}
</script>

<style lang="scss">

</style>
