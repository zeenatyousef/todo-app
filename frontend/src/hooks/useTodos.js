import { useState, useEffect, useCallback } from 'react';
import { todosApi, ApiError } from '../api';

export function useTodos({ onAuthError } = {}) {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    completed: undefined,
    priority: undefined,
    tag: undefined,
    search: undefined,
    overdue: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  const handleError = useCallback(
    (err) => {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError?.();
        return;
      }
      setError(err.message || 'Something went wrong');
    },
    [onAuthError]
  );

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [todoList, todoStats] = await Promise.all([
        todosApi.list(filters),
        todosApi.stats(),
      ]);
      setTodos(todoList);
      setStats(todoStats);
      setError('');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, handleError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTodo = useCallback(
    async (payload) => {
      try {
        await todosApi.create(payload);
        await refresh();
        return true;
      } catch (err) {
        handleError(err);
        return false;
      }
    },
    [refresh, handleError]
  );

  const updateTodo = useCallback(
    async (id, updates) => {
      // Optimistic update for snappy checkbox toggling
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
      try {
        await todosApi.update(id, updates);
        await refresh();
        return true;
      } catch (err) {
        handleError(err);
        await refresh();
        return false;
      }
    },
    [refresh, handleError]
  );

  const removeTodo = useCallback(
    async (id) => {
      const prevTodos = todos;
      setTodos((prev) => prev.filter((t) => t.id !== id));
      try {
        await todosApi.remove(id);
        await refresh();
      } catch (err) {
        setTodos(prevTodos);
        handleError(err);
      }
    },
    [todos, refresh, handleError]
  );

  return {
    todos,
    stats,
    loading,
    error,
    filters,
    setFilters,
    addTodo,
    updateTodo,
    removeTodo,
    refresh,
  };
}
