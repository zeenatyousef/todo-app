import React, { useState, useCallback } from 'react';
import Auth from './Auth.jsx';
import Board from './components/Board.jsx';
import FilterBar from './components/FilterBar.jsx';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import { useTodos } from './hooks/useTodos.js';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  }, []);

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const { todos, stats, loading, error, filters, setFilters, addTodo, updateTodo, removeTodo } =
    useTodos({ onAuthError: logout, token });

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-shell">
      <Board user={user} stats={stats} onLogout={logout} />

      <FilterBar filters={filters} setFilters={setFilters} tags={stats?.tags} />

      <TodoForm onAdd={addTodo} />

      {error && <div className="error-banner">{error}</div>}

      {loading && todos.length === 0 ? (
        <div className="loading-row">Loading board…</div>
      ) : (
        <TodoList todos={todos} onUpdate={updateTodo} onDelete={removeTodo} />
      )}
    </div>
  );
}

export default App;
