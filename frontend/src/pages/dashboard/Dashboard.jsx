import { useEffect, useState } from "react";

export default function Dashboard() {
  const [activeBots, setActiveBots] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('activeBots');
      const parsed = raw ? JSON.parse(raw) : [];
      setActiveBots(parsed.map(b => ({ ...b, pnl: (Math.random() * 6 - 1).toFixed(2) })));
    } catch (e) {
      setActiveBots([]);
    }
  }, []);

  return (
    <div style={{ padding: "36px", color: "#fff" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: "36px", marginBottom: "8px" }}>📊 Dashboard</h1>
        <div style={{ color: '#9aa1aa' }}>Account: <strong>0.00 ETH</strong></div>
      </div>

      {/* TOP PNL PANEL */}
      <section style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
        <div className="card-box" style={{ height: 260 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#9aa1aa', fontSize: 13 }}>Total PnL (since start)</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{activeBots.length ? `+${activeBots.reduce((s,a) => s + Number(a.pnl), 0).toFixed(2)}%` : '+0.00%'}</div>
            </div>
            <div style={{ textAlign: 'right', color: '#9aa1aa' }}>
              <div>Unrealized: 0.00</div>
              <div>Realized: 0.00</div>
            </div>
          </div>

          <div style={{ marginTop: 18, height: 160, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa1aa' }}>
            <div>Graph placeholder — connect bots to see live PnL</div>
          </div>
        </div>

        <div className="card-box" style={{ height: 260 }}>
          <h3 style={{ marginTop: 0 }}>Currently Running</h3>
          {activeBots.length === 0 ? (
            <div style={{ color: '#9aa1aa', marginTop: 12 }}>No bots running yet — start a bot from the Bots page to see it listed here.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {activeBots.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{b.name} <span style={{ color: '#9aa1aa', fontWeight: 600 }}>({b.pair})</span></div>
                    <div style={{ color: '#9aa1aa', fontSize: 13 }}>Started {new Date(b.startedAt).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{b.pnl}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ACTIVE BOTS / HISTORY */}
      <section style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Running Bots</h2>
          <div style={{ color: '#9aa1aa' }}>You have {activeBots.length} active bots</div>
        </div>

        <div style={{ marginTop: 12 }}>
          {activeBots.length === 0 ? (
            <div style={{ color: '#9aa1aa' }}>There are no bots running right now. Bots are built to be profitable over time by compounding small edges through disciplined execution.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {activeBots.map(b => (
                <div key={b.id} className="card-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{b.name}</div>
                    <div style={{ color: '#9aa1aa' }}>{b.pair}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800 }}>{b.pnl}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
