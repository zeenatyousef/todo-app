import React, { useState } from 'react';

function formatDue(dueDate) {
  const d = new Date(dueDate);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function TodoItem({ todo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [expanded, setExpanded] = useState(false);

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  const saveTitle = () => {
    const trimmed = draftTitle.trim();
    setEditing(false);
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, { title: trimmed });
    } else {
      setDraftTitle(todo.title);
    }
  };

  return (
    <li className={`ticket ${todo.completed ? 'completed' : ''}`}>
      <div className={`priority-tab ${todo.priority}`} />

      <div className="check-zone">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onUpdate(todo.id, { completed: !todo.completed })}
        />
      </div>

      <div className="perforation" />

      <div className="content">
        <div className="title-row">
          {editing ? (
            <input
              className="title-edit"
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') {
                  setDraftTitle(todo.title);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <span className="title" onDoubleClick={() => setEditing(true)}>
              {todo.title}
            </span>
          )}

          <div className="actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => (editing ? saveTitle() : setEditing(true))}
              title="Edit title"
            >
              {editing ? 'save' : 'edit'}
            </button>
            {(todo.notes || '').length > 0 && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => setExpanded((v) => !v)}
                title="Toggle notes"
              >
                {expanded ? 'hide' : 'notes'}
              </button>
            )}
            <button
              type="button"
              className="icon-btn delete"
              onClick={() => onDelete(todo.id)}
              title="Delete"
            >
              del
            </button>
          </div>
        </div>

        <div className="meta-row">
          <span className={`pill priority-label ${todo.priority}`}>{todo.priority}</span>
          {todo.dueDate && (
            <span className={`pill due ${isOverdue ? 'overdue' : ''}`}>
              {isOverdue ? 'overdue · ' : 'due · '}
              {formatDue(todo.dueDate)}
            </span>
          )}
          {todo.tags?.map((tag) => (
            <span key={tag} className="pill tag">
              #{tag}
            </span>
          ))}
        </div>

        {expanded && todo.notes && <div className="notes-text">{todo.notes}</div>}
      </div>
    </li>
  );
}

export default TodoItem;
