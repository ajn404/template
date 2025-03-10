import { TodoStore } from '../stores/TodoStore';
import { provide, inject, type InjectionKey } from 'vue';

// 创建一个InjectionKey
export const TodoStoreKey: InjectionKey<TodoStore> = Symbol('TodoStore');

// 创建一个全局单例
const todoStore = new TodoStore();

// 提供TodoStore的组合式函数
export function provideTodoStore() {
  provide(TodoStoreKey, todoStore);
  return todoStore;
}

// 注入TodoStore的组合式函数
export function useTodoStore(): TodoStore {
  const store = inject(TodoStoreKey);
  if (!store) {
    throw new Error('useTodoStore() 必须在 provideTodoStore() 之后使用');
  }
  return store;
}
