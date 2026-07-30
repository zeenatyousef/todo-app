import React from 'react';

const STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Done' },
  { key: 'overdue', label: 'Overdue' },
];

function FilterBar({ filters, setFilters, tags }) {
  const status = filters.overdue
    ? 'overdue'
    : filters.completed === 'true'
    ? 'completed'
    : filters.completed === 'false'
    ? 'pending'
    : 'all';

  const setStatus = (key) => {
    setFilters((f) => ({
      ...f,
      overdue: key === 'overdue' ? 'true' : undefined,
      completed: key === 'completed' ? 'true' : key === 'pending' ? 'false' : undefined,
    }));
  };

  return (
    <div className="filter-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search todos..."
        value={filters.search || ''}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
      />

      <div className="chip-toggle">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={status === opt.key ? 'active' : ''}
            onClick={() => setStatus(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <select
        value={filters.priority || ''}
        onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value || undefined }))}
      >
        <option value="">Any priority</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      {tags?.length > 0 && (
        <select
          value={filters.tag || ''}
          onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value || undefined }))}
        >
          <option value="">Any tag</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              #{t}
            </option>
          ))}
        </select>
      )}

      <select
        value={`${filters.sortBy}:${filters.order}`}
        onChange={(e) => {
          const [sortBy, order] = e.target.value.split(':');
          setFilters((f) => ({ ...f, sortBy, order }));
        }}
      >
        <option value="createdAt:desc">Newest first</option>
        <option value="createdAt:asc">Oldest first</option>
        <option value="dueDate:asc">Due soonest</option>
        <option value="dueDate:desc">Due latest</option>
        <option value="priority:desc">Priority: high to low</option>
        <option value="title:asc">Title: A to Z</option>
      </select>
    </div>
  );
}

export default FilterBar;
