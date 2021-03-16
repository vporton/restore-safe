import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import router from './router'

Vue.use(VueRouter)

Vue.config.productionTip = false

new Vue({
  el: "#app",
  router: router,
  render: h => h(App)
})
