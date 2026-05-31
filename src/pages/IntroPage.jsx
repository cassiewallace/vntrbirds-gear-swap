import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { HeaderLight } from '../components/Header';

const PROVISIONS = [
  "40% of merchandise sales will go to the VNTRbirds scholarship fund (supporting women in the outdoors and furthering their outdoor education through mentorships and grants). If you'd like to donate more, please indicate at the bottom of your item list.",
  "All sold items will be paid via Venmo to the handle you provide — you do NOT need to return to the event to receive payment.",
  'Items that have NOT SOLD must be picked up between 4pm–5pm on the day of the event. You only need to return if you plan to pick up unsold items you do not wish to donate. Items not picked up by that time will be donated to the Breckenridge Outdoor Education Center.',
  'VNTRbirds and its volunteers CANNOT be held responsible for lost, damaged, or stolen merchandise.',
  'VNTRbirds WILL NOT provide compensation for lost, damaged, or stolen merchandise.',
];

const SUMMER_CATEGORIES = [
  { name: 'Hiking Gear', items: ['Boots, apparel (pants, shorts, tech tees)', 'Packs, hiking poles'] },
  { name: 'Bike Gear', items: ['Bikes', 'Apparel (shorts, pants, jerseys, gloves)', 'Shoes (no torn/missing laces, soles intact)', 'Components (saddles, pedals, grips, tires)', 'Tools (tire levers, pump, tubes)', 'Downhill goggles (no scratches/foam tears)', 'Packs'] },
  { name: 'Rock Climbing Gear', items: ['Shoes, chalk bags', 'Ropes (new only)', 'Harnesses (new only)', 'Bouldering pads'] },
  { name: 'Camping Gear', items: ['Tents / shelter', 'Sleeping pads', 'Sleeping bags', 'Rain jackets'] },
  { name: 'Skateboards', items: [] },
  { name: 'Backpacks', items: [] },
  { name: 'Helmets', items: ['New helmets only — no used helmets'] },
  { name: 'Dog Gear', items: [] },
  { name: 'Apparel', items: ['Hoodies', 'Jeans', 'Hats', 'Jackets', 'Base layers'] },
  { name: '"Free Bin"', items: ['Gently used socks, hats, tees, etc.'] },
];

const WINTER_CATEGORIES = [
  { name: 'Snowboards / Skis', items: [] },
  { name: 'Splitboards / AT Ski Setups', items: [] },
  { name: 'Cross Country Skis', items: [] },
  { name: 'Snowshoes', items: [] },
  { name: 'Poles', items: [] },
  { name: 'Bindings', items: [] },
  { name: 'Boots', items: [] },
  { name: 'Backcountry Gear', items: ['No electronics (e.g. transceivers)'] },
  { name: 'Shovels', items: [] },
  { name: 'Probes', items: [] },
  { name: 'Packs', items: [] },
  { name: 'Outerwear', items: ['Jackets', 'Snow pants', 'Gloves / Mittens'] },
  { name: 'Winter Clothing', items: ['First layers', 'Hoodies', 'Jeans', 'Streetwear boots / shoes', 'Backpacks'] },
  { name: 'Helmets', items: ['New helmets only — no used helmets'] },
  { name: 'Goggles', items: ['Free of scratches and tears in foam'] },
  { name: 'Sunglasses', items: [] },
  { name: 'Dog Gear', items: [] },
  { name: '"Free Bin"', items: ['Gently used socks, buffs, beanies, etc.'] },
];

export default function IntroPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [eventSettings, setEventSettings] = useState({ date: '', location: '', time: '' });
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isWinter = localStorage.getItem('gearswap_season') === 'winter';
  const CATEGORIES = isWinter ? WINTER_CATEGORIES : SUMMER_CATEGORIES;
  const eventDate = localStorage.getItem('gearswap_date') || '';
  const eventTime = localStorage.getItem('gearswap_time') || '';
  const eventDatetime = [eventDate, eventTime].filter(Boolean).join(' ') || 'TBD';
  const eventLocation = localStorage.getItem('gearswap_location') || 'TBD';

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'event'));
        if (snap.exists()) {
          setEventSettings(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error('Error loading event settings:', err);
      }
    }
    loadSettings();
  }, []);

  const canProceed = agreed && name.trim().length > 0;

  return (
    <div className="page-wrapper">
      <HeaderLight />
      <main className="page-content">

        {/* Event Info */}
        <div className="card" style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}>
          <div className="info-row">
            <div className="info-pill">
              <span className="pill-icon">📅</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: 2 }}>Date</div>
                <div style={{ fontWeight: 700 }}>{eventSettings.date || 'TBD'}</div>
              </div>
            </div>
            <div className="info-pill">
              <span className="pill-icon">📍</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: 2 }}>Location</div>
                <div style={{ fontWeight: 700 }}>{eventSettings.location || 'TBD'}</div>
              </div>
            </div>
            <div className="info-pill">
              <span className="pill-icon">🕓</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: 2 }}>Time</div>
                <div style={{ fontWeight: 700 }}>{eventSettings.time || 'TBD'}</div>
              </div>
            </div>
          </div>

          <div className="scholarship-banner">
            <div className="pct">40%</div>
            <p>of all sales go to the VNTRbirds scholarship fund, supporting women in the outdoors through mentorships and grants. Want to give more? You can increase your contribution on the items page.</p>
          </div>
        </div>

        {/* Accepted Items */}
        <div className="card">
          <div className="card-label">What we accept</div>
          <div className="card-title">{isWinter ? 'Winter Items' : 'Summer Items'}</div>

          <div className="info-block" style={{ marginBottom: 0 }}>
            <p>All items must be new or gently used — clean, no tears or damage.</p>
          </div>

          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="category-tag">
                <div>{cat.name}</div>
                {cat.items.length > 0 && (
                  <ul>
                    {cat.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                )}
              </div>
            ))}
            {CATEGORIES.length % 2 !== 0 && <div className="category-tag" />}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
            VNTRbirds reserves the right to refuse any items. Questions?{' '}
            <a href="mailto:VNTRbirds@gmail.com" style={{ color: 'var(--blue)', fontWeight: 600 }}>VNTRbirds@gmail.com</a>
          </p>
        </div>

        {/* How It Works */}
        <div className="card">
          <div className="card-label">Compensation & liability</div>
          <div className="card-title">How It Works</div>

          <div className="warning-block">
            <p><span style={{ fontWeight: 500 }}>Sold items:</span> 60% of your sold proceeds will be Venmo'd to you — you do not need to return to receive payment.</p>
          </div>
          <div className="warning-block">
            <p><span style={{ fontWeight: 500 }}>Unsold items:</span> Only return if you plan to pick up items you don't want to donate. Pickup is 4–5pm; unclaimed items go to the Breckenridge Outdoor Education Center (BOEC).</p>
          </div>
          <div className="warning-block" style={{ marginBottom: 0 }}>
            <p><span style={{ fontWeight: 500 }}>Liability:</span> VNTRbirds cannot be held responsible for lost, damaged, or stolen items and will not provide compensation.</p>
          </div>
        </div>

        {/* Agreement */}
        <div className="card">
          <div className="card-label">Before you drop off</div>
          <div className="card-title">Seller Agreement</div>

          <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', marginBottom: 20 }}>
            Read and agree to all five provisions before proceeding.
          </p>

          <ol className="provisions-list">
            {PROVISIONS.map((text, i) => (
              <li key={i}>
                <span className="provision-number">{i + 1}</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>

          <hr className="divider" />

          <p style={{ fontSize: '0.95rem', marginBottom: 20, fontStyle: 'italic', color: 'var(--gray-600)' }}>
            I, the undersigned, have read this contract and agree with all of the above provisions, understanding fully that no exceptions will be made.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <span className="checkbox-label">
                I have read and agree to all provisions above
              </span>
            </label>
          </div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name (signature)</label>
              <input
                type="text"
                className="form-input signature-input"
                placeholder="Type your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <div className="date-display">{today}</div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            disabled={!canProceed}
            onClick={() => navigate('/seller')}
          >
            I Agree — Continue to Seller Info →
          </button>
        </div>
        <div className="progress-bar-wrapper">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`progress-step ${s === 1 ? 'active' : ''}`} />
          ))}
        </div>
      </main>
    </div>
  );
}
