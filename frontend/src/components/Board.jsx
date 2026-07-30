import React from 'react';

function Board({ user, stats, onLogout }) {
  const total = stats?.total ?? 0;
  const pending = stats?.pending ?? 0;
  const completed = stats?.completed ?? 0;
  const overdue = stats?.overdue ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="board">
      <div className="board-top">
        <div className="board-brand">
          <h1>Departures</h1>
          <span className="tag">TODO</span>
        </div>
        <div className="board-user">
          {user?.email && <span>{user.email}</span>}
          <button className="logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="board-stats">
        <div className="flap pending">
          <div className="flap-value">{String(pending).padStart(2, '0')}</div>
          <div className="flap-label">Pending</div>
        </div>
        <div className="flap overdue">
          <div className="flap-value">{String(overdue).padStart(2, '0')}</div>
          <div className="flap-label">Overdue</div>
        </div>
        <div className="flap done">
          <div className="flap-value">{String(completed).padStart(2, '0')}</div>
          <div className="flap-label">Done</div>
        </div>
        <div className="flap">
          <div className="flap-value">{String(total).padStart(2, '0')}</div>
          <div className="flap-label">Total</div>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default Board;
