# Todo List Component

This React component renders a list of todo items using the TodoItem component.

## Purpose

- Maps over an array of todos and renders each item
- Passes appropriate callbacks for toggling and deleting todos
- Returns null if no todos are present (handled by parent)

## Props

```typescript
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}
```

## Code

```typescript
import { Todo } from '../api/todos';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const TodoList = ({ todos, onToggle, onDelete }: TodoListProps) => {
  if (todos.length === 0) {
    return null;
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
```