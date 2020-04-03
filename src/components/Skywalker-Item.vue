<template>
  <li class="item" @click="asd(index)">{{ text }}</li>
</template>

<script>

export default {
  name: 'Skywalker-Item',
  props: {
    text: {
      type: Number,
      default: 0
    }
  },
  methods: {
    asd (idx) {
      console.log(idx)
      this.active = idx
    }
  }
}
</script>

<style lang="scss" scoped>
  .item {
    width: 300px;
    height: 400px;
    margin: 0 10px;
    padding: 20px 14px;
    float: left;
    border-radius: 10px;
    box-sizing: border-box;
    box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
    background-color: #fff;
  }
</style>
