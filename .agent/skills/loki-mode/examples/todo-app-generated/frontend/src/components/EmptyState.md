# Empty State Component

This React component displays a message when there are no todos in the list.

## Purpose

- Shows a friendly message when the todo list is empty
- Provides a hint to users on how to get started
- Uses CSS classes for consistent styling with the rest of the app

## Code

```typescript
export const EmptyState = () => {
  return (
    <div className="empty-state">
      <p className="empty-message">No todos yet!</p>
      <p className="empty-hint">Add your first todo above to get started.</p>
    </div>
  );
};
```