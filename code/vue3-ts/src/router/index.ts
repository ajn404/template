import { createRouter, createWebHistory } from 'vue-router'
import TodoList from '../components/TodoList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TodoList
    }
  ]
})

export default router
