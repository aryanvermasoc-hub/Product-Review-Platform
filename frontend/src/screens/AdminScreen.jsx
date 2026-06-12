import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Bell, Boxes, LayoutDashboard, Package, Percent, Shield, Star, Users } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/authStore';

const tabs = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['products', 'Products', Package],
  ['orders', 'Orders', Boxes],
  ['customers', 'Customers', Users],
  ['coupons', 'Coupons', Percent],
  ['reviews', 'Reviews', Star],
  ['notifications', 'Notifications', Bell],
];

const AdminScreen = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', price: '', brand: '', category: '', image: '', countInStock: '', description: '' });
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percentage', value: 10, minOrderValue: 0, maxDiscount: 0, active: true });

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const [analyticsRes, productsRes, ordersRes, customersRes, couponsRes, reviewsRes, notificationsRes] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ data: null })),
        api.get('/products', { params: { pageSize: 100 } }).catch(() => ({ data: { products: [] } })),
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/admin/customers').catch(() => ({ data: [] })),
        api.get('/coupons').catch(() => ({ data: [] })),
        api.get('/admin/reviews').catch(() => ({ data: [] })),
        api.get('/admin/notifications').catch(() => ({ data: [] })),
      ]);
      setAnalytics(analyticsRes.data);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data || []);
      setCustomers(customersRes.data || []);
      setCoupons(couponsRes.data || []);
      setReviews(reviewsRes.data || []);
      setNotifications(notificationsRes.data || []);
    };
    load();
  }, [isAdmin]);

  const createProduct = async (e) => {
    e.preventDefault();
    const { data: created } = await api.post('/products');
    const payload = {
      ...form,
      price: Number(form.price),
      countInStock: Number(form.countInStock),
      image: form.image || created.image,
    };
    const { data } = await api.put(`/products/${created._id}`, payload);
    setProducts([data, ...products]);
    setMessage('Product created.');
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/coupons', couponForm);
    setCoupons([data, ...coupons]);
    setMessage('Coupon created.');
  };

  const updateOrderStatus = async (id, status) => {
    const { data } = await api.put(`/orders/${id}/status`, { status });
    setOrders(orders.map((order) => (order._id === id ? data : order)));
  };

  const moderateReview = async (id, status) => {
    await api.put(`/admin/reviews/${id}`, { status });
    setReviews(reviews.map((review) => (review._id === id ? { ...review, status } : review)));
  };

  if (!isAdmin) {
    return (
      <div className="container empty-state glass-panel" style={{ marginTop: 40 }}>
        <Shield size={44} />
        <h2>Admin access required</h2>
        <p>Use the separate hidden admin login route to access the control center.</p>
        <Link className="primary-button" to="/super-admin-login">Admin login</Link>
      </div>
    );
  }

  return (
    <div className="container admin-layout">
      <p className="eyebrow"><Shield size={14} /> Commerce control center</p>
      <div className="section-head">
        <h1 className="page-title">Admin Dashboard</h1>
        <span className="muted">Analytics, inventory, orders, customers, coupons, reviews</span>
      </div>

      {message && <div className="form-note">{message}</div>}

      <div className="admin-tabs">
        {tabs.map(([id, label, Icon]) => (
          <button className={activeTab === id ? 'active' : ''} type="button" key={id} onClick={() => setActiveTab(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && analytics && (
        <>
          <div className="metrics-grid">
            <div className="metric-card"><span>Revenue</span><strong>Rs {analytics.revenue.toLocaleString('en-IN')}</strong></div>
            <div className="metric-card"><span>Orders</span><strong>{analytics.orderCount}</strong></div>
            <div className="metric-card"><span>Customers</span><strong>{analytics.customerCount}</strong></div>
            <div className="metric-card"><span>Products</span><strong>{analytics.productCount}</strong></div>
            <div className="metric-card"><span>Conversion</span><strong>{analytics.traffic.conversionRate}%</strong></div>
            <div className="metric-card"><span>Low stock</span><strong>{analytics.lowStockCount}</strong></div>
          </div>
          <section className="admin-panel">
            <div className="section-head"><h2><BarChart3 size={18} /> Recent orders</h2><span className="muted">Live database data</span></div>
            <DataTable rows={analytics.recentOrders || []} columns={['status', 'totalPrice', 'createdAt']} />
          </section>
        </>
      )}

      {activeTab === 'products' && (
        <section className="admin-grid">
          <div className="admin-panel">
            <h2>Product Management</h2>
            <form className="admin-form" onSubmit={createProduct}>
              {['name', 'brand', 'category', 'image', 'price', 'countInStock', 'description'].map((key) => (
                <div className="field" key={key}>
                  <label htmlFor={key}>{key}</label>
                  <input id={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key !== 'image'} />
                </div>
              ))}
              <button className="primary-button" type="submit">Create product</button>
            </form>
          </div>
          <div className="admin-panel"><DataTable rows={products} columns={['name', 'brand', 'category', 'price', 'countInStock']} /></div>
        </section>
      )}

      {activeTab === 'orders' && (
        <section className="admin-panel">
          <DataTable rows={orders} columns={['status', 'totalPrice', 'createdAt']} action={(order) => (
            <select className="premium-select" value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => <option key={status}>{status}</option>)}
            </select>
          )} />
        </section>
      )}

      {activeTab === 'customers' && <section className="admin-panel"><DataTable rows={customers} columns={['name', 'email', 'role', 'isEmailVerified', 'createdAt']} /></section>}

      {activeTab === 'coupons' && (
        <section className="admin-grid">
          <div className="admin-panel">
            <h2>Coupon Management</h2>
            <form className="admin-form" onSubmit={createCoupon}>
              {['code', 'value', 'minOrderValue', 'maxDiscount'].map((key) => (
                <div className="field" key={key}>
                  <label htmlFor={key}>{key}</label>
                  <input id={key} value={couponForm[key]} onChange={(e) => setCouponForm({ ...couponForm, [key]: e.target.value })} required />
                </div>
              ))}
              <div className="field">
                <label htmlFor="type">type</label>
                <select id="type" value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}>
                  <option value="percentage">percentage</option>
                  <option value="fixed">fixed</option>
                </select>
              </div>
              <button className="primary-button" type="submit">Create coupon</button>
            </form>
          </div>
          <div className="admin-panel"><DataTable rows={coupons} columns={['code', 'type', 'value', 'active', 'usedCount']} /></div>
        </section>
      )}

      {activeTab === 'reviews' && (
        <section className="admin-panel">
          <DataTable rows={reviews} columns={['name', 'rating', 'comment', 'status']} action={(review) => (
            <div className="pill-row">
              <button className="secondary-button compact" type="button" onClick={() => moderateReview(review._id, 'approved')}>Approve</button>
              <button className="secondary-button compact" type="button" onClick={() => moderateReview(review._id, 'rejected')}>Reject</button>
            </div>
          )} />
        </section>
      )}

      {activeTab === 'notifications' && <section className="admin-panel"><DataTable rows={notifications} columns={['title', 'message', 'audience', 'severity', 'createdAt']} /></section>}
    </div>
  );
};

const DataTable = ({ rows, columns, action }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="data-table">
      <thead>
        <tr>{columns.map((column) => <th key={column}>{column}</th>)}{action && <th>Action</th>}</tr>
      </thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={columns.length + (action ? 1 : 0)}>No records found.</td></tr>}
        {rows.map((row) => (
          <tr key={row._id}>
            {columns.map((column) => <td key={column}>{formatCell(row[column])}</td>)}
            {action && <td>{action(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const formatCell = (value) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString('en-IN');
  if (typeof value === 'string' && value.includes('T')) return value.substring(0, 10);
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return value.name || value.email || value._id || '-';
  return value;
};

export default AdminScreen;
