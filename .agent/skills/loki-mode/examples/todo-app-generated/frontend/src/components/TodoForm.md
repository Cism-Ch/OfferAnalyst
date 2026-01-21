# Todo Form Component

This React component provides a form for adding new todo items to the list.

## Features

- Text input for entering new todo titles
- Form validation to prevent empty todos
- Loading state during submission
- Automatic input clearing after successful submission
- Disabled state while submitting to prevent duplicate submissions

## Props

```typescript
interface TodoFormProps {
  onAddTodo: (title: string) => Promise<void>;
}
```

## Code

```typescript
import { useState, FormEvent } from 'react';

interface TodoFormProps {
  onAddTodo: (title: string) => Promise<void>;
}

export const TodoForm = ({ onAddTodo }: TodoFormProps) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    try {
      setIsSubmitting(true);
      await onAddTodo(trimmedTitle);
      setTitle('');
    } catch (err) {
      console.error('Failed to add todo:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        disabled={isSubmitting}
        className="todo-input"
      />
      <button type="submit" disabled={isSubmitting || !title.trim()} className="add-button">
        {isSubmitting ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
};
```