import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_PASSWORD = 'birdswap26';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const [season, setSeason] = useState(
    () => localStorage.getItem('gearswap_season') || 'summer'
  );
  const [date, setDate] = useState(
    () => localStorage.getItem('gearswap_date') || ''
  );
  const [time, setTime] = useState(
    () => localStorage.getItem('gearswap_time') || ''
  );
  const [location, setLocation] = useState(
    () => localStorage.getItem('gearswap_location') || ''
  );

  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearError, setClearError] = useState('');
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  function handleSeasonChange(value) {
    setSeason(value);
    localStorage.setItem('gearswap_season', value);
  }

  function openClearModal() {
    setClearPassword('');
    setClearError('');
    setCleared(false);
    setShowClearModal(true);
  }

  async function handleClearAll() {
    if (clearPassword !== ADMIN_PASSWORD) {
      setClearError('Incorrect password.');
      setClearPassword('');
      return;
    }
    setClearing(true);
    try {
      const snapshot = await getDocs(collection(db, 'submissions'));
      await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, 'submissions', d.id))));
      setCleared(true);
      setClearError('');
    } catch (err) {
      console.error(err);
      setClearError('Something went wrong. Please try again.');
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="logo-text">VNTR<span>birds</span> Gear Swap</div>
        <button className="admin-back-btn" onClick={() => navigate('/admin')}>
          ← Back
        </button>
      </header>

      <div className="admin-content" style={{ maxWidth: 640 }}>
        <h1 style={{ fontFamily: 'Lequire, sans-serif', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.4rem', marginBottom: 8 }}>
          Settings
        </h1>
        <div className="settings-card" style={{ marginTop: 32 }}>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">Season</div>
              <div className="settings-row-desc">Toggle between Summer and Winter gear swap mode.</div>
            </div>
            <div className="season-toggle">
              <button
                className={`season-btn ${season === 'summer' ? 'active' : ''}`}
                onClick={() => handleSeasonChange('summer')}
              >
                ☀️ Summer
              </button>
              <button
                className={`season-btn ${season === 'winter' ? 'active' : ''}`}
                onClick={() => handleSeasonChange('winter')}
              >
                ❄️ Winter
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">Date</div>
              <div className="settings-row-desc">Shown on the intro page event info pill.</div>
            </div>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: 260 }}
              placeholder="e.g. May 31"
              value={date}
              onChange={e => { setDate(e.target.value); localStorage.setItem('gearswap_date', e.target.value); }}
            />
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">Time</div>
              <div className="settings-row-desc">Shown on the intro page event info pill.</div>
            </div>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: 260 }}
              placeholder="e.g. 10am–5pm"
              value={time}
              onChange={e => { setTime(e.target.value); localStorage.setItem('gearswap_time', e.target.value); }}
            />
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">Location</div>
              <div className="settings-row-desc">Shown on the intro page event info pill.</div>
            </div>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: 260 }}
              placeholder="e.g. Breckenridge Brewery"
              value={location}
              onChange={e => { setLocation(e.target.value); localStorage.setItem('gearswap_location', e.target.value); }}
            />
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title" style={{ color: 'var(--error)' }}>Clear All Submissions</div>
              <div className="settings-row-desc">Permanently delete all seller submissions and items. This cannot be undone.</div>
            </div>
            <button className="clear-data-btn" onClick={openClearModal}>
              Clear All
            </button>
          </div>
        </div>
      </div>

      {showClearModal && (
        <div className="donor-modal-overlay" onClick={() => !clearing && setShowClearModal(false)}>
          <div className="donor-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <button className="donor-modal-close" onClick={() => setShowClearModal(false)} disabled={clearing}>✕</button>

            {cleared ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>✓</div>
                <div className="donor-modal-name" style={{ fontSize: '1.1rem' }}>All submissions cleared.</div>
                <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setShowClearModal(false)}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="donor-modal-header">
                  <div className="donor-modal-name" style={{ fontSize: '1.1rem', color: 'var(--error)' }}>Clear All Submissions</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginTop: 8 }}>
                    This will permanently delete every seller submission and item. Enter the admin password to confirm.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={clearPassword}
                    onChange={e => { setClearPassword(e.target.value); setClearError(''); }}
                    placeholder="Enter password to confirm"
                    autoFocus
                  />
                  {clearError && <p className="login-error">{clearError}</p>}
                </div>

                <button
                  className="clear-data-btn"
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={handleClearAll}
                  disabled={clearing || !clearPassword}
                >
                  {clearing ? 'Clearing…' : 'Yes, Delete Everything'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
