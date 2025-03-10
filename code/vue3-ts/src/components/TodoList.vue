<template>
  <div class="todo-container">
    <h1>待办事项</h1>

    <div class="todo-input">
      <input type="text" v-model="newTodo" @keyup.enter="addTodo" placeholder="添加新的待办事项" />
      <button @click="addTodo">添加</button>
    </div>

    <div class="todo-list" v-if="todoStore.todos.value.length > 0">
      <div class="todo-item" v-for="todo in todoStore.todos.value" :key="todo.id">
        <input type="checkbox" :checked="todo.completed" @change="todoStore.toggleTodo(todo.id)" />
        <span :class="{ completed: todo.completed }" @dblclick="startEditing(todo)">{{ todo.title }}</span>
        <input v-if="editingId === todo.id" type="text" v-model="editingTitle" @blur="finishEditing"
          @keyup.enter="finishEditing" @keyup.esc="cancelEditing" ref="editInput" />
        <button @click="todoStore.removeTodo(todo.id)" class="delete-btn">删除</button>
      </div>
    </div>

    <div class="todo-footer" v-if="todoStore.todos.value.length > 0">
      <div class="todo-count">
        剩余: <strong>{{ todoStore.remainingCount.value }}</strong> 项
      </div>
      <div class="todo-actions">
        <button @click="todoStore.toggleAll(!todoStore.allCompleted.value)">
          {{ todoStore.allCompleted.value ? '取消全选' : '全选' }}
        </button>
        <button @click="todoStore.clearCompleted()" v-if="todoStore.completedCount.value > 0">
          清除已完成
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue';
import { useTodoStore } from '../composables/useTodoStore';
import { Todo } from '../models/Todo';

export default defineComponent({
  name: 'TodoList',
  setup() {
    const todoStore = useTodoStore();
    const newTodo = ref('');
    const editingId = ref<number | null>(null);
    const editingTitle = ref('');
    const editInput = ref<HTMLInputElement | null>(null);

    const addTodo = () => {
      if (newTodo.value.trim()) {
        todoStore.addTodo(newTodo.value);
        newTodo.value = '';
      }
    };

    const startEditing = (todo: Todo) => {
      editingId.value = todo.id;
      editingTitle.value = todo.title;

      // 在下一个DOM更新周期后聚焦输入框
      nextTick(() => {
        if (editInput.value) {
          editInput.value.focus();
        }
      });
    };

    const finishEditing = () => {
      if (editingId.value !== null) {
        todoStore.updateTodoTitle(editingId.value, editingTitle.value);
        editingId.value = null;
      }
    };

    const cancelEditing = () => {
      editingId.value = null;
    };

    // 添加一些示例数据
    onMounted(() => {
      todoStore.addTodo('学习Vue 3');
      todoStore.addTodo('学习TypeScript');
      todoStore.addTodo('学习面向对象编程');
    });

    return {
      todoStore,
      newTodo,
      editingId,
      editingTitle,
      editInput,
      addTodo,
      startEditing,
      finishEditing,
      cancelEditing
    };
  }
});
</script>

<style scoped>
.todo-container {
  max-width: 600px;
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
