import React from 'react';
import TodoItem from './TodoItem.jsx';

function TodoList({ todos, onUpdate, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-title">Nothing on the board</div>
        <p>Add a task above, or adjust your filters.</p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default TodoList;
