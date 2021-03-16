import Vue from 'vue'
import VueRouter from 'vue-router'
import Sign from '../components/Sign.vue'
import Transact from '../components/Transact.vue'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'sign',
      component: Sign,
    },
    {
      path: '/transact',
      name: 'transact',
      component: Transact,
    },
  ]
})
