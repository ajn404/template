import { Todo } from '../models/Todo';
import { ref, type Ref } from 'vue';

export class TodoService {
  private todos: Ref<Todo[]>;

  constructor() {
    this.todos = ref<Todo[]>([]);
  }

  getTodos(): Ref<Todo[]> {
    return this.todos;
  }

  addTodo(title: string): void {
    if (!title.trim()) return;
    const newTodo = new Todo(title);
    this.todos.value.push(newTodo);
  }

  removeTodo(id: number): void {
    this.todos.value = this.todos.value.filter(todo => todo.id !== id);
  }

  toggleTodo(id: number): void {
    const todo = this.todos.value.find(todo => todo.id === id);
    if (todo) {
      todo.toggle();
    }
  }

  updateTodoTitle(id: number, title: string): void {
    const todo = this.todos.value.find(todo => todo.id === id);
    if (todo) {
      todo.updateTitle(title);
    }
  }

  getCompletedCount(): number {
    return this.todos.value.filter(todo => todo.completed).length;
  }

  getRemainingCount(): number {
    return this.todos.value.filter(todo => !todo.completed).length;
  }
}
