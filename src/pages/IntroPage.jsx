import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderLight } from '../components/Header';

const PROVISIONS = [
  "40% of merchandise sales will go to the VNTRbirds scholarship fund (supporting women in the outdoors and furthering their outdoor education through mentorships and grants). If you'd like to donate more, please indicate at the bottom of your item list.",
  "Compensation for SOLD goods not picked up before 4:45pm on the day of the sale will be Venmo'd to the address you provide.",
  'Items that have NOT SOLD must be picked up between 4pm–5pm on the day of the event (the end of the swap). Items not picked up by that time will be donated to the Breckenridge Outdoor Education Center.',
  'VNTRbirds and its volunteers CANNOT be held responsible for lost, damaged, or stolen merchandise.',
  'VNTRbirds WILL NOT provide compensation for lost, damaged, or stolen merchandise.',
];

const CATEGORIES = [
  { name: 'Hiking Gear', items: ['Boots, apparel (pants, shorts, tech tees)', 'Packs, hiking poles'] },
  { name: 'Bike Gear', items: ['Bikes', 'Apparel (shorts, pants, jerseys, gloves)', 'Shoes (no torn/missing laces, soles intact)', 'Components (saddles, pedals, grips, tires)', 'Tools (tire levers, pump, tubes)', 'Downhill goggles (no scratches/foam tears)', 'Packs'] },
  { name: 'Rock Climbing Gear', items: ['Shoes, chalk bags', 'Ropes', 'Bouldering pads'] },
  { name: 'Camping Gear', items: ['Tents / shelter', 'Sleeping pads', 'Sleeping bags', 'Rain jackets'] },
  { name: 'Skateboards', items: [] },
  { name: 'Backpacks', items: [] },
  { name: 'Helmets', items: ['No clear damage'] },
  { name: 'Dog Gear', items: [] },
  { name: '"Free Bin"', items: ['Gently used socks, hats, tees, etc.'] },
];

export default function IntroPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const canProceed = agreed && name.trim().length > 0;

  return (
    <div className="page-wrapper">
      <HeaderLight />
      <main className="page-content">
        <div className="progress-bar-wrapper">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`progress-step ${s === 1 ? 'active' : ''}`} />
          ))}
        </div>

        {/* Event Info */}
        <div className="card">
          <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: 24, color: 'var(--gray-600)' }}>
            VNTRbirds is a women's outdoor company based in Breckenridge, CO. Our Gear Swap+Sale
            is a community event to buy and sell used gear — keeping costs low and quality equipment in circulation.
          </p>

          <div className="info-row">
            <div className="info-pill">
              <span className="pill-icon">📅</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: 2 }}>Date</div>
                <div style={{ fontWeight: 700 }}>May 31, 2026</div>
              </div>
            </div>
            <div className="info-pill">
              <span className="pill-icon">📍</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: 2 }}>Location</div>
                <div style={{ fontWeight: 700 }}>TBD</div>
              </div>
            </div>
            <div className="info-pill">
              <span className="pill-icon">🕓</span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: 2 }}>Seller Pickup</div>
                <div style={{ fontWeight: 700 }}>4:00–5:00pm</div>
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
          <div className="card-title">Accepted Items</div>

          <div className="info-block" style={{ marginBottom: 0 }}>
            <p><strong>All items must be new or gently used — clean, no tears or damage. Summer-specific items only.</strong></p>
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
            <p><strong>Sold items:</strong> 60% of your sold proceeds will be Venmo'd to you by end of day.</p>
          </div>
          <div className="warning-block">
            <p><strong>Unsold items:</strong> Must be picked up between 4–5pm. Unclaimed items are donated to the Breckenridge Outdoor Education Center (BOEC).</p>
          </div>
          <div className="warning-block" style={{ marginBottom: 0 }}>
            <p><strong>Liability:</strong> VNTRbirds cannot be held responsible for lost, damaged, or stolen items and will not provide compensation.</p>
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
      </main>
    </div>
  );
}
