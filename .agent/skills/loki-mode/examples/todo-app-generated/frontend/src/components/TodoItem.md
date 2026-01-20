# Todo Item Component

This React component represents a single todo item with checkbox, title, and delete button.

## Features

- Displays todo title with checkbox for completion status
- Shows strikethrough styling for completed todos
- Provides delete functionality for each todo item
- Uses CSS classes for styling and state representation

## Props

```typescript
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}
```

## Code

```typescript
import { Todo } from '../api/todos';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  return (
    <div className="todo-item">
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="todo-checkbox"
        />
        <span className={todo.completed ? 'todo-title completed' : 'todo-title'}>
          {todo.title}
        </span>
      </div>
      <button onClick={handleDelete} className="delete-button">
        Delete
      </button>
    </div>
  );
};
```