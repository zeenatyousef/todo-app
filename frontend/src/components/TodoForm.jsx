import React, { useState } from 'react';

function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setPriority('MEDIUM');
    setDueDate('');
    setTagsInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const ok = await onAdd(payload);
    setSubmitting(false);
    if (ok) reset();
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="row1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit" className="add-btn" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </div>

      {showAdvanced ? (
        <div className="row2">
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Low priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="HIGH">High priority</option>
          </select>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="tags, comma, separated"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
      ) : (
        <button
          type="button"
          className="toggle-advanced"
          onClick={() => setShowAdvanced(true)}
        >
          + priority, due date, tags
        </button>
      )}
    </form>
  );
}

export default TodoForm;
