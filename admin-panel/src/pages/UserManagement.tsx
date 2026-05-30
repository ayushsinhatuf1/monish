import React, { useState } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: '1', name: 'Ayush', phone: '9876543210', wallet: 1500, status: 'Active' },
    { id: '2', name: 'Rahul', phone: '9988776655', wallet: 200, status: 'Active' },
    { id: '3', name: 'Priya', phone: '8877665544', wallet: 50, status: 'Blocked' },
  ]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#FF6B00' }}>User Management</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
        <thead style={{ backgroundColor: '#333' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Phone</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Wallet Balance</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.name}</td>
              <td style={{ padding: '15px' }}>+91 {u.phone}</td>
              <td style={{ padding: '15px' }}>₹{u.wallet}</td>
              <td style={{ padding: '15px' }}>
                <span style={{ 
                  color: u.status === 'Active' ? '#10B981' : '#EF4444'
                }}>
                  {u.status}
                </span>
              </td>
              <td style={{ padding: '15px' }}>
                <button style={{ marginRight: '10px', background: 'transparent', border: '1px solid #ccc', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>View Details</button>
                <button style={{ background: u.status === 'Active' ? '#EF4444' : '#10B981', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                  {u.status === 'Active' ? 'Block' : 'Unblock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
