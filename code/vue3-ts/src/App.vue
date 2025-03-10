<script lang="ts">
import { defineComponent } from 'vue';
import TodoList from './components/TodoList.vue';
import { provideTodoStore } from './composables/useTodoStore';

export default defineComponent({
  name: 'App',
  components: {
    TodoList
  },
  setup() {
    // 提供TodoStore给整个应用
    provideTodoStore();
  }
});
</script>

<template>
  <div class="app">
    <TodoList />
  </div>
</template>

<style>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
