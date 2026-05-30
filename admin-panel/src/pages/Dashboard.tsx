import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCollection: 0,
    totalPrizePool: 0,
    totalPlatformRevenue: 0,
  });
  
  // Dummy data for graph
  const data = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  useEffect(() => {
    // Mock fetch revenue
    // fetch('/api/admin/revenue').then(res => res.json()).then(data => setStats(data.data));
    setStats({
      totalCollection: 150000,
      totalPrizePool: 50000,
      totalPlatformRevenue: 100000,
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#FF6B00' }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
          <h3 style={{ margin: 0, color: '#888', fontSize: '14px' }}>Total Collection</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>₹{stats.totalCollection}</p>
        </div>
        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
          <h3 style={{ margin: 0, color: '#888', fontSize: '14px' }}>Prize Pool Distributed</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>₹{stats.totalPrizePool}</p>
        </div>
        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
          <h3 style={{ margin: 0, color: '#888', fontSize: '14px' }}>Platform Revenue</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>₹{stats.totalPlatformRevenue}</p>
        </div>
      </div>

      <div style={{ height: '400px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
        <h3 style={{ marginBottom: '20px' }}>Revenue this week</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            <Legend />
            <Bar dataKey="revenue" fill="#FF6B00" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
