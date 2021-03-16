<template>
  <div id="app">
    <p>
      <router-link to="/">Create signer's signatures</router-link>
      |
      <router-link to="/transact">Accomplish transaction</router-link>
    </p>
    <router-view/>
    <!--Sign/-->
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
