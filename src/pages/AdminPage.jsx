import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_PASSWORD = 'birdswap26';

const CATEGORIES = [
  'All Categories',
  'Hiking Gear',
  'Bike Gear',
  'Rock Climbing Gear',
  'Camping Gear',
  'Skateboard',
  'Backpack',
  'Helmet',
  'Dog Gear',
  'Free Bin',
];

/* ── Login Screen ── */
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Admin Access</h1>
        <p className="login-sub">VNTRbirds Gear Swap+Sale</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter admin password"
              autoFocus
            />
            {error && <p className="login-error">{error}</p>}
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Item List Tab ── */
function ItemListTab({ submissions }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [soldFilter, setSoldFilter] = useState('all');
  const [boecFilter, setBoecFilter] = useState('all');

  const allItems = useMemo(() => {
    const rows = [];
    submissions.forEach(sub => {
      (sub.items || []).forEach((item, idx) => {
        rows.push({
          ...item,
          _docId: sub.id,
          _itemIdx: idx,
          donorName: `${sub.firstName} ${sub.lastName}`,
          donorEmail: sub.email,
          donorPhone: sub.phone,
          donorVenmo: sub.venmo,
        });
      });
    });
    return rows;
  }, [submissions]);

  const filtered = useMemo(() => {
    return allItems.filter(row => {
      if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
      if (soldFilter === 'sold' && !row.sold) return false;
      if (soldFilter === 'unsold' && row.sold) return false;
      if (boecFilter === 'yes' && !row.donateToBoec) return false;
      if (boecFilter === 'no' && row.donateToBoec) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const fields = [row.donorName, row.donorEmail, row.donorPhone, row.donorVenmo, row.category, row.description, row.brand, row.model, row.color, row.size];
        if (!fields.some(f => (f || '').toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [allItems, search, categoryFilter, soldFilter, boecFilter]);

  async function toggleSold(row) {
    const sub = submissions.find(s => s.id === row._docId);
    if (!sub) return;
    const updatedItems = sub.items.map((item, idx) =>
      idx === row._itemIdx ? { ...item, sold: !item.sold } : item
    );
    try {
      await updateDoc(doc(db, 'submissions', row._docId), { items: updatedItems });
    } catch (err) {
      console.error('Error updating sold status:', err);
    }
  }

  return (
    <div>
      <div className="admin-controls">
        <input
          type="search"
          className="admin-search"
          placeholder="Search by name, email, brand, description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="admin-filter" value={soldFilter} onChange={e => setSoldFilter(e.target.value)}>
          <option value="all">All Items</option>
          <option value="sold">Sold Only</option>
          <option value="unsold">Unsold Only</option>
        </select>
        <select className="admin-filter" value={boecFilter} onChange={e => setBoecFilter(e.target.value)}>
          <option value="all">All BOEC</option>
          <option value="yes">BOEC: Yes</option>
          <option value="no">BOEC: No</option>
        </select>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 12 }}>
        Showing {filtered.length} of {allItems.length} items
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No items match your filters.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Venmo</th>
                <th>Category</th>
                <th>Description</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Color</th>
                <th>Size</th>
                <th>Price</th>
                <th>BOEC</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={`${row._docId}-${row._itemIdx}`} className={row.sold ? 'sold-row' : ''}>
                  <td>{row.donorName}</td>
                  <td>{row.donorEmail}</td>
                  <td>{row.donorPhone}</td>
                  <td>{row.donorVenmo}</td>
                  <td>{row.category}</td>
                  <td>{row.description}</td>
                  <td>{row.brand}</td>
                  <td>{row.model || '—'}</td>
                  <td>{row.color}</td>
                  <td>{row.size}</td>
                  <td>${(row.price || 0).toFixed(2)}</td>
                  <td>
                    {row.donateToBoec
                      ? <span className="boec-badge">Yes</span>
                      : <span style={{ color: 'var(--gray-400)' }}>No</span>}
                  </td>
                  <td style={{ textDecoration: 'none' }}>
                    <input
                      type="checkbox"
                      checked={!!row.sold}
                      onChange={() => toggleSold(row)}
                      title={row.sold ? 'Mark as unsold' : 'Mark as sold'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Payouts Tab ── */
function PayoutsTab({ submissions }) {
  const [paidMap, setPaidMap] = useState({});

  const perDonor = useMemo(() => {
    return submissions.map(sub => {
      const soldItems = (sub.items || []).filter(item => item.sold);
      const totalSold = soldItems.reduce((sum, item) => sum + (item.price || 0), 0);
      const extraPct = sub.extraDonationPercent || 0;
      const sellerPct = (60 - extraPct) / 100;
      const owedToSeller = totalSold * sellerPct;
      return {
        id: sub.id,
        name: `${sub.firstName} ${sub.lastName}`,
        venmo: sub.venmo,
        totalSold,
        owedToSeller,
        sellerPct: Math.round((1 - (40 + extraPct) / 100) * 100),
      };
    }).filter(d => d.totalSold > 0);
  }, [submissions]);

  const eventTotals = useMemo(() => {
    const allSoldItems = [];
    submissions.forEach(sub => {
      (sub.items || []).filter(i => i.sold).forEach(item => allSoldItems.push(item));
    });
    const grossSales = allSoldItems.reduce((sum, i) => sum + (i.price || 0), 0);

    // owed to sellers across all submissions
    const totalOwedToSellers = perDonor.reduce((sum, d) => sum + d.owedToSeller, 0);
    const totalToScholarship = grossSales - totalOwedToSellers;

    return { grossSales, totalOwedToSellers, totalToScholarship };
  }, [submissions, perDonor]);

  function togglePaid(id) {
    setPaidMap(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      {/* Event-level totals */}
      <div className="payouts-summary">
        <div className="payout-stat">
          <div className="stat-label">Total Gross Sales</div>
          <div className="stat-value">${eventTotals.grossSales.toFixed(2)}</div>
        </div>
        <div className="payout-stat highlight">
          <div className="stat-label">Total Owed to Sellers</div>
          <div className="stat-value">${eventTotals.totalOwedToSellers.toFixed(2)}</div>
        </div>
        <div className="payout-stat teal">
          <div className="stat-label">Total to Scholarship Fund</div>
          <div className="stat-value">${eventTotals.totalToScholarship.toFixed(2)}</div>
        </div>
      </div>

      {perDonor.length === 0 ? (
        <div className="empty-state">
          <p>No sold items yet. Mark items as sold in the Item List tab.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Venmo</th>
                <th>Total Sold</th>
                <th>% Owed</th>
                <th>Amount Owed</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {perDonor.map(donor => (
                <tr key={donor.id}>
                  <td><strong>{donor.name}</strong></td>
                  <td style={{ color: 'var(--blue)' }}>{donor.venmo}</td>
                  <td>${donor.totalSold.toFixed(2)}</td>
                  <td>{donor.sellerPct}%</td>
                  <td><strong>${donor.owedToSeller.toFixed(2)}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!paidMap[donor.id]}
                        onChange={() => togglePaid(donor.id)}
                        style={{ accentColor: 'var(--teal)' }}
                      />
                      {paidMap[donor.id]
                        ? <span className="paid-badge">Paid ✓</span>
                        : <span className="unpaid-badge">Pending</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Page ── */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('items');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) return;
    const unsub = onSnapshot(collection(db, 'submissions'), snapshot => {
      setSubmissions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error('Firestore error:', err);
      setLoading(false);
    });
    return unsub;
  }, [authenticated]);

  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />;

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="logo-text">VNTR<span>birds</span> Admin</div>
        <span className="admin-badge">Admin</span>
      </header>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Item List
          </button>
          <button
            className={`admin-tab ${activeTab === 'payouts' ? 'active' : ''}`}
            onClick={() => setActiveTab('payouts')}
          >
            Payouts
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading submissions…</p>
          </div>
        ) : (
          <>
            {activeTab === 'items' && <ItemListTab submissions={submissions} />}
            {activeTab === 'payouts' && <PayoutsTab submissions={submissions} />}
          </>
        )}
      </div>
    </div>
  );
}
