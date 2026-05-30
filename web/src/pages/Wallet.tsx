import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function Wallet() {
  const user = useAuthStore((s) => s.user);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wallet/transactions').then(r => setTxns(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="wallet-balance-card">
        <div className="wallet-balance-label">Current Balance</div>
        <div className="wallet-balance-amount">₹{user?.walletBalance ?? 0}</div>
        <div className="wallet-actions">
          <button className="wallet-btn wallet-btn-add">Add Money</button>
          <button className="wallet-btn wallet-btn-withdraw">Withdraw</button>
        </div>
      </div>

      <h2 className="section-title">Transaction History</h2>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="tx-list">
          {txns.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">💸</div><p>No transactions yet</p></div>
          ) : txns.map((tx) => (
            <div key={tx.id} className="tx-item">
              <div className={`tx-icon ${tx.type}`}>{tx.type === 'credit' ? '↓' : '↑'}</div>
              <div className="tx-info">
                <div className="tx-title">{tx.description}</div>
                <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
              <div className={`tx-amount ${tx.type}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
