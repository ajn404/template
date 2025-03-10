export class Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;

  constructor(title: string) {
    this.id = Math.floor(Math.random() * 10000);
    this.title = title;
    this.completed = false;
    this.createdAt = new Date();
  }

  toggle(): void {
    this.completed = !this.completed;
  }

  updateTitle(title: string): void {
    this.title = title;
  }
}
