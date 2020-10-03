<template>
  <div class="home">
    <Skywalker />
  </div>
</template>

<script>
// @ is an alias to /src
import Skywalker from './components/Skywalker'

export default {
  name: 'Home',
  components: {
    Skywalker
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  text-decoration: none;
  list-style: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f1f1f1;
}
</style>
