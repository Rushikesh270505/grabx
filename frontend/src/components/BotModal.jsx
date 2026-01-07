import React from 'react';

export default function BotModal({ bot, onClose }) {
  if (!bot) return null;
  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true">
        <h2 style={{ marginTop: 0 }}>{bot.name} — Details</h2>
        <p style={{ color: '#9aa1aa' }}>{bot.description}</p>

        <h3 style={{ marginTop: 18 }}>Example recent trades</h3>
        <ul>
          <li>Entry 1: Bought at 100.2 — closed +0.8%</li>
          <li>Entry 2: Bought at 99.8 — closed +1.2%</li>
          <li>Entry 3: Sold at 101.4 — closed +0.6%</li>
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
