import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MonitorSmartphone, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/authStore';

const AccountScreen = () => {
  const { userInfo } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!userInfo) return;
    api.get('/users/sessions').then(({ data }) => setSessions(data)).catch(() => setSessions([]));
    api.get('/orders/mine').then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  }, [userInfo]);

  if (!userInfo) {
    return <div className="container empty-state glass-panel" style={{ marginTop: 40 }}><h2>Sign in required</h2><Link className="primary-button" to="/login">Sign in</Link></div>;
  }

  return (
    <div className="container admin-layout">
      <p className="eyebrow"><ShieldCheck size={14} /> Account center</p>
      <h1 className="page-title">Welcome, {userInfo.name}</h1>
      <div className="metrics-grid">
        <div className="metric-card"><span>Email status</span><strong>{userInfo.isEmailVerified ? 'Verified' : 'Pending'}</strong></div>
        <div className="metric-card"><span>Role</span><strong>{userInfo.role}</strong></div>
        <div className="metric-card"><span>Orders</span><strong>{orders.length}</strong></div>
      </div>
      <section className="admin-panel">
        <div className="section-head"><h2><MonitorSmartphone size={18} /> Session monitoring</h2><span className="muted">{sessions.length} devices</span></div>
        <table className="data-table">
          <thead><tr><th>Device</th><th>IP</th><th>Last seen</th><th>Status</th></tr></thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session._id}>
                <td>{session.userAgent}</td>
                <td>{session.ipAddress}</td>
                <td>{session.lastSeenAt?.substring(0, 10)}</td>
                <td>{session.revokedAt ? 'Revoked' : 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AccountScreen;
