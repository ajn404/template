import { TodoService } from '../services/TodoService';
import { computed, type ComputedRef } from 'vue';
import { Todo } from '../models/Todo';

export class TodoStore {
  private todoService: TodoService;

  constructor() {
    this.todoService = new TodoService();
  }

  get todos() {
    return this.todoService.getTodos();
  }

  get completedCount(): ComputedRef<number> {
    return computed(() => this.todoService.getCompletedCount());
  }

  get remainingCount(): ComputedRef<number> {
    return computed(() => this.todoService.getRemainingCount());
  }

  get allCompleted(): ComputedRef<boolean> {
    return computed(() => {
      return this.todos.value.length > 0 && this.completedCount.value === this.todos.value.length;
    });
  }

  addTodo(title: string): void {
    this.todoService.addTodo(title);
  }

  removeTodo(id: number): void {
    this.todoService.removeTodo(id);
  }

  toggleTodo(id: number): void {
    this.todoService.toggleTodo(id);
  }

  updateTodoTitle(id: number, title: string): void {
    this.todoService.updateTodoTitle(id, title);
  }

  toggleAll(completed: boolean): void {
    this.todos.value.forEach(todo => {
      if (todo.completed !== completed) {
        this.toggleTodo(todo.id);
      }
    });
  }

  clearCompleted(): void {
    const completedTodos = this.todos.value.filter(todo => todo.completed);
    completedTodos.forEach(todo => {
      this.removeTodo(todo.id);
    });
  }
}
