<template>
  <div class="container">
    <ul class="skywalkerBox">
    <!-- <ul class="skywalkerBox" :style="`width: ${boxWidth}`"> -->
      <li class="item"
        @click="asd(index)"
        :class="index === active ? 'item-acitve' : ''"
        v-for="(item, index) in listData"
        :key="index" >{{ item }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Skywalker',
  data () {
    return {
      active: 0,
      boxWidth: '3000px',
      listData: [123, 445, 453, 768, 8, 9, 234]
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
  .container {
    width: 100vw;
    height: 100vh;
    overflow-x: auto;

    .skywalkerBox {
      width: 10000px;
      height: 100%;
      padding: 0 5px;
      overflow: hidden;
      display: flex;
      align-items: center;

      .item {
        min-width: 300px;
        height: 400px;
        margin: 0 10px;
        padding: 20px 14px;
        float: left;
        border-radius: 10px;
        box-sizing: border-box;
        box-shadow: 0px 2px 20px 0px rgba(137, 159, 185, .5);
        background-color: #fff;
        transition: transform .4s, color .2s;
        color: #999;

        &.item-acitve {
          transform: scale(1.02, 1.02);
        }

        &:hover {
          color: #2c3e50;
        }
      }
    }
  }
</style>
