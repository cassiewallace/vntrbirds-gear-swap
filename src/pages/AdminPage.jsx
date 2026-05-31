import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ADMIN_PASSWORD = 'birdswap26';
const VOLUNTEER_PASSWORD = 'birdswapvolunteer';

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
  'Apparel',
  'Free Bin',
];

/* ── Login Screen ── */
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin('admin');
    } else if (password === VOLUNTEER_PASSWORD) {
      onLogin('volunteer');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Admin Access</h1>
        <p className="login-sub">VNTRbirds Gear Swap + Sale</p>
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

/* ── Donor Profile Modal ── */
function DonorProfileModal({ submission, onClose }) {
  const items = submission.items || [];
  const soldItems = items.filter(i => i.sold);
  const totalListed = items.reduce((s, i) => s + (i.price || 0), 0);
  const totalSold = soldItems.reduce((s, i) => s + (i.price || 0), 0);
  const extraPct = submission.extraDonationPercent || 0;
  const sellerPct = (60 - extraPct) / 100;
  const payout = totalSold * sellerPct;

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="donor-modal-overlay" onClick={onClose}>
      <div className="donor-modal" onClick={e => e.stopPropagation()}>
        <button className="donor-modal-close" onClick={onClose}>✕</button>

        <div className="donor-modal-header">
          <div className="donor-modal-name">{submission.firstName} {submission.lastName}</div>
          <div className="donor-modal-meta">
            {submission.email && <span>✉ {submission.email}</span>}
            {submission.phone && <span>📞 {submission.phone}</span>}
            {submission.venmo && (
              <a href={`https://venmo.com/${submission.venmo}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>
                💸 @{submission.venmo}
              </a>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✓</span>
            <span>
              Waiver accepted
              {submission.agreementTimestamp?.toDate
                ? ` on ${submission.agreementTimestamp.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : ''}
            </span>
          </div>
        </div>

        <div className="donor-modal-stats">
          <div className="donor-stat">
            <div className="donor-stat-label">Items Sold</div>
            <div className="donor-stat-value">{soldItems.length} / {items.length}</div>
          </div>
          <div className="donor-stat highlight">
            <div className="donor-stat-label">Total Sold</div>
            <div className="donor-stat-value">${fmt(totalSold)}</div>
          </div>
          <div className="donor-stat teal">
            <div className="donor-stat-label">Payout ({Math.round(sellerPct * 100)}%)</div>
            <div className="donor-stat-value">${fmt(payout)}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <table className="admin-table">
          <thead>
            <tr>
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
            {items.map((item, i) => (
              <tr key={i} className={item.sold ? 'sold-row' : ''}>
                <td>{item.category}</td>
                <td>{item.description}</td>
                <td>{item.brand}</td>
                <td>{item.model || '—'}</td>
                <td>{item.color}</td>
                <td>{item.size}</td>
                <td>${fmt(item.price || 0)}</td>
                <td>{item.donateToBoec ? <span className="boec-badge">Yes</span> : <span style={{ color: 'var(--gray-400)' }}>No</span>}</td>
                <td>{item.sold ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

/* ── Item List Tab ── */
function ItemListTab({ submissions }) {
  const [search, setSearch] = useState('');
  const [soldFilter, setSoldFilter] = useState('all');
  const [boecFilter, setBoecFilter] = useState('all');
  const [profileSub, setProfileSub] = useState(null);

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
  }, [allItems, search, soldFilter, boecFilter]);

  async function toggleSold(row) {
    try {
      const docRef = doc(db, 'submissions', row._docId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const freshItems = (snap.data().items || []).map((item, idx) =>
        idx === row._itemIdx ? { ...item, sold: !row.sold } : item
      );
      await updateDoc(docRef, { items: freshItems });
    } catch (err) {
      console.error('Error updating sold status:', err);
    }
  }

  const openProfile = useCallback((docId) => {
    const sub = submissions.find(s => s.id === docId);
    if (sub) setProfileSub(sub);
  }, [submissions]);

  return (
    <div>
      {profileSub && (
        <DonorProfileModal submission={profileSub} onClose={() => setProfileSub(null)} />
      )}

      <div className="admin-controls">
        <input
          type="search"
          className="admin-search"
          placeholder="Search by name, email, brand, description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
                <th>Category</th>
                <th>Description</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Color</th>
                <th>Size</th>
                <th>Donor</th>
                <th>BOEC</th>
                <th>Price</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={`${row._docId}-${row._itemIdx}`} className={row.sold ? 'sold-row' : ''}>
                  <td>{row.category}</td>
                  <td>{row.description}</td>
                  <td>{row.brand}</td>
                  <td>{row.model || '—'}</td>
                  <td>{row.color}</td>
                  <td>{row.size}</td>
                  <td>
                    <button className="donor-link" onClick={() => openProfile(row._docId)}>
                      {row.donorName}
                    </button>
                  </td>
                  <td>
                    {row.donateToBoec
                      ? <span className="boec-badge">Yes</span>
                      : <span style={{ color: 'var(--gray-400)' }}>No</span>}
                  </td>
                  <td>${fmt(row.price || 0)}</td>
                  <td>
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
  const [paidSort, setPaidSort] = useState(null);
  const [profileSub, setProfileSub] = useState(null);
  const [search, setSearch] = useState('');

  const openProfile = useCallback((id) => {
    const sub = submissions.find(s => s.id === id);
    if (sub) setProfileSub(sub);
  }, [submissions]); // null | 'paid-first' | 'unpaid-first'

  function cyclePaidSort() {
    setPaidSort(prev =>
      prev === null ? 'unpaid-first' : prev === 'unpaid-first' ? 'paid-first' : null
    );
  }

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
          <div className="stat-value">${fmt(eventTotals.grossSales)}</div>
        </div>
        <div className="payout-stat highlight">
          <div className="stat-label">Total Owed to Sellers</div>
          <div className="stat-value">${fmt(eventTotals.totalOwedToSellers)}</div>
        </div>
        <div className="payout-stat teal">
          <div className="stat-label">Total to Scholarship Fund</div>
          <div className="stat-value">${fmt(eventTotals.totalToScholarship)}</div>
        </div>
      </div>

      {profileSub && (
        <DonorProfileModal submission={profileSub} onClose={() => setProfileSub(null)} />
      )}

      <div className="admin-controls" style={{ marginBottom: 16 }}>
        <input
          type="search"
          className="admin-search"
          placeholder="Search by donor name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
                <th
                  onClick={cyclePaidSort}
                  style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                >
                  Paid {paidSort === 'paid-first' ? '↑' : paidSort === 'unpaid-first' ? '↓' : '↕'}
                </th>
              </tr>
            </thead>
            <tbody>
              {[...perDonor].filter(d => !search.trim() || d.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
                if (!paidSort) return 0;
                const aPaid = !!paidMap[a.id];
                const bPaid = !!paidMap[b.id];
                if (paidSort === 'paid-first') return aPaid === bPaid ? 0 : aPaid ? -1 : 1;
                return aPaid === bPaid ? 0 : aPaid ? 1 : -1;
              }).map(donor => (
                <tr key={donor.id}>
                  <td>
                    <button className="donor-link" onClick={() => openProfile(donor.id)}>
                      {donor.name}
                    </button>
                  </td>
                  <td>
                    {donor.venmo
                      ? <a href={`https://venmo.com/${donor.venmo}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>@{donor.venmo}</a>
                      : '—'}
                  </td>
                  <td>${fmt(donor.totalSold)}</td>
                  <td>{donor.sellerPct}%</td>
                  <td>${fmt(donor.owedToSeller)}</td>
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

/* ── Settings Tab ── */
function SettingsTab() {
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [sellerPickup, setSellerPickup] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'settings', 'event'));
      if (snap.exists()) {
        const d = snap.data();
        setEventDate(d.eventDate || '');
        setLocation(d.location || '');
        setSellerPickup(d.sellerPickup || '');
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'event'), { eventDate, location, sellerPickup });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, padding: '24px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Event Settings</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>These values appear on the seller sign-up page.</p>
      </div>
      <div className="form-group">
        <label className="form-label">Event Date</label>
        <input className="form-input" type="text" value={eventDate} onChange={e => setEventDate(e.target.value)} placeholder="e.g. May 31, 2026" />
      </div>
      <div className="form-group">
        <label className="form-label">Location</label>
        <input className="form-input" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Breckenridge Recreation Center" />
      </div>
      <div className="form-group">
        <label className="form-label">Seller Pickup Time</label>
        <input className="form-input" type="text" value={sellerPickup} onChange={e => setSellerPickup(e.target.value)} placeholder="e.g. 4:00–5:00pm" />
      </div>
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: 8 }}
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Settings'}
      </button>
    </div>
  );
}

/* ── Main Admin Page ── */
export default function AdminPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(
    () => !!sessionStorage.getItem('admin_role')
  );
  const [role, setRole] = useState(
    () => sessionStorage.getItem('admin_role') || 'volunteer'
  );
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

  if (!authenticated) return <LoginScreen onLogin={(r) => {
    sessionStorage.setItem('admin_role', r);
    setRole(r);
    setAuthenticated(true);
  }} />;

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="logo-text">VNTR<span>birds</span> Gear Swap</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="admin-badge">{role === 'admin' ? 'Admin' : 'Volunteer'}</span>
          {role === 'admin' && (
            <button className="admin-settings-btn" onClick={() => navigate('/admin/settings')} title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Items
          </button>
          <button
            className={`admin-tab ${activeTab === 'payouts' ? 'active' : ''}`}
            onClick={() => setActiveTab('payouts')}
          >
            Payouts
          </button>
          {role === 'admin' && (
            <button
              className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          )}
        </div>

        {activeTab === 'settings' ? (
          <SettingsTab />
        ) : loading ? (
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
