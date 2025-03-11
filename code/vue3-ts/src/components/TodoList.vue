<template>
  <div class=" mx-auto p-6">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">待办事项</h1>

    <div class="mb-6">
      <div class="flex gap-2">
        <input type="text" v-model="newTodo" @keyup.enter="addTodo" placeholder="添加新的待办事项"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button @click="addTodo"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          添加
        </button>
      </div>
    </div>

    <div v-if="todoStore.todos.value.length > 0" class="space-y-3">
      <div v-for="todo in todoStore.todos.value" :key="todo.id"
        class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
        <input type="checkbox" :checked="todo.completed" @change="todoStore.toggleTodo(todo.id)"
          class="w-5 h-5 text-blue-500 rounded focus:ring-blue-500" />
        <span v-if="editingId !== todo.id" @dblclick="startEditing(todo)"
          :class="['flex-1', todo.completed && 'line-through text-gray-400']">
          {{ todo.title }}
        </span>
        <input v-else type="text" v-model="editingTitle" @blur="finishEditing" @keyup.enter="finishEditing"
          @keyup.esc="cancelEditing" ref="editInput"
          class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button @click="todoStore.removeTodo(todo.id)" class="p-2 text-red-500 hover:text-red-600 transition-colors">
          <span class="sr-only">删除</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="todoStore.todos.value.length > 0" class="mt-6 flex justify-between items-center text-sm text-gray-600">
      <div>
        剩余: <span class="font-semibold">{{ todoStore.remainingCount.value }}</span> 项
      </div>
      <div class="flex gap-2">
        <button @click="todoStore.toggleAll(!todoStore.allCompleted.value)"
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
          {{ todoStore.allCompleted.value ? '取消全选' : '全选' }}
        </button>
        <button v-if="todoStore.completedCount.value > 0" @click="todoStore.clearCompleted()"
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
          清除已完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useTodoStore } from '../composables/useTodoStore'
import type { Todo } from '../models/Todo'

const todoStore = useTodoStore()
const newTodo = ref('')
const editingId = ref<number | null>(null)
const editingTitle = ref('')
const editInput = ref<HTMLInputElement | null>(null)

const addTodo = () => {
  if (newTodo.value.trim()) {
    todoStore.addTodo(newTodo.value)
    newTodo.value = ''
  }
}

const startEditing = (todo: Todo) => {
  editingId.value = todo.id
  editingTitle.value = todo.title

  nextTick(() => {
    editInput.value?.focus()
  })
}

const finishEditing = () => {
  if (editingId.value !== null) {
    const trimmedTitle = editingTitle.value.trim()
    if (trimmedTitle) {
      todoStore.updateTodoTitle(editingId.value, trimmedTitle)
    } else {
      todoStore.removeTodo(editingId.value)
    }
    editingId.value = null
  }
}

const cancelEditing = () => {
  editingId.value = null
}

// 添加示例数据
onMounted(() => {
  todoStore.addTodo('学习 Vue 3')
  todoStore.addTodo('学习 TypeScript')
  todoStore.addTodo('学习 Tailwind CSS')
})
</script>

<style scoped>
.todo-container {
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

.todo-input {
  display: flex;
  margin-bottom: 20px;
}

.todo-input input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.todo-input button {
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.todo-list {
  margin-bottom: 20px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-item input[type="checkbox"] {
  margin-right: 10px;
}

.todo-item span {
  flex: 1;
  padding: 5px;
}

.todo-item span.completed {
  text-decoration: line-through;
  color: #888;
}

.todo-item input[type="text"] {
  flex: 1;
  padding: 5px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.todo-actions button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
