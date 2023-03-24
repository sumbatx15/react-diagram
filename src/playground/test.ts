import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Todo {
  title: string;
  done: boolean;
}

interface TodoState {
  todos: Record<string, Todo>;
  addTodo: (todo: Todo) => void;
}

export const useTodos = create(
  immer<TodoState>((set) => ({
    todos: {},
    addTodo: (todo) =>
      set((state) => {
        state.todos[todo.title] = todo;
      }),
  }))
);
