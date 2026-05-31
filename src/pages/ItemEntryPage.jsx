import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useSubmission } from '../context/SubmissionContext';
import { HeaderLight } from '../components/Header';

const SUMMER_CATEGORIES = [
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

const WINTER_CATEGORIES = [
  'Snowboards / Skis',
  'Splitboards / AT Ski Setups',
  'Cross Country Skis',
  'Snowshoes',
  'Poles',
  'Bindings',
  'Boots',
  'Backcountry Gear',
  'Shovels',
  'Probes',
  'Packs',
  'Outerwear',
  'Gloves / Mittens',
  'Winter Clothing',
  'Backpacks',
  'Helmets',
  'Goggles',
  'Sunglasses',
  'Dog Gear',
  'Free Bin',
];

function ItemCard({ item, index, onUpdate, onRemove, showRemove, errors, categories }) {
  return (
    <div className="item-card">
      <div className="item-card-header">
        <span className="item-number">Item {index + 1}</span>
        {showRemove && (
          <button className="btn btn-danger" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className={`form-select ${errors?.category ? 'error' : ''}`}
            value={item.category}
            onChange={e => onUpdate('category', e.target.value)}
          >
            <option value="">Select category…</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors?.category && <p className="error-text">{errors.category}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Item Description</label>
          <input
            type="text"
            className={`form-input ${errors?.description ? 'error' : ''}`}
            placeholder="e.g. Jacket, Bike, Gloves"
            value={item.description}
            onChange={e => onUpdate('description', e.target.value)}
          />
          {errors?.description && <p className="error-text">{errors.description}</p>}
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">Brand</label>
          <input
            type="text"
            className={`form-input ${errors?.brand ? 'error' : ''}`}
            placeholder="Patagonia, Dakine…"
            value={item.brand}
            onChange={e => onUpdate('brand', e.target.value)}
          />
          {errors?.brand && <p className="error-text">{errors.brand}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Model <span className="optional">(optional)</span></label>
          <input
            type="text"
            className="form-input"
            placeholder="Model name"
            value={item.model}
            onChange={e => onUpdate('model', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <input
            type="text"
            className={`form-input ${errors?.color ? 'error' : ''}`}
            placeholder="Red, Multi…"
            value={item.color}
            onChange={e => onUpdate('color', e.target.value)}
          />
          {errors?.color && <p className="error-text">{errors.color}</p>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Size</label>
          <input
            type="text"
            className={`form-input ${errors?.size ? 'error' : ''}`}
            placeholder="M, L, 10, One Size…"
            value={item.size}
            onChange={e => onUpdate('size', e.target.value)}
          />
          {errors?.size && <p className="error-text">{errors.size}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Price ($)</label>
          <input
            type="number"
            className={`form-input ${errors?.price ? 'error' : ''}`}
            placeholder="0.00"
            min="0"
            step="0.01"
            value={item.price}
            onChange={e => onUpdate('price', e.target.value)}
          />
          {errors?.price && <p className="error-text">{errors.price}</p>}
        </div>
      </div>

      <div className="toggle-wrapper">
        <label className="toggle">
          <input
            type="checkbox"
            checked={item.donateToBoec}
            onChange={e => onUpdate('donateToBoec', e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
        <span className="toggle-label">
          Donate to BOEC if unsold
        </span>
      </div>
    </div>
  );
}

export default function ItemEntryPage() {
  const navigate = useNavigate();
  const { sellerInfo, items, addItem, removeItem, updateItem, extraDonationPercent, setExtraDonationPercent, setSubmissionId } = useSubmission();
  const [itemErrors, setItemErrors] = useState({});
  const [extraError, setExtraError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const categories = localStorage.getItem('gearswap_season') === 'winter' ? WINTER_CATEGORIES : SUMMER_CATEGORIES;

  function validateItems() {
    const errors = {};
    items.forEach(item => {
      const e = {};
      if (!item.category) e.category = 'Required';
      if (!item.description.trim()) e.description = 'Required';
      if (!item.brand.trim()) e.brand = 'Required';
      if (!item.color.trim()) e.color = 'Required';
      if (!item.size.trim()) e.size = 'Required';
      if (!item.price || isNaN(parseFloat(item.price)) || parseFloat(item.price) < 0) {
        e.price = 'Enter a valid price';
      }
      if (Object.keys(e).length > 0) errors[item.id] = e;
    });
    return errors;
  }

  async function handleSubmit() {
    const errors = validateItems();
    setItemErrors(errors);

    let extraErr = '';
    if (extraDonationPercent !== '') {
      const val = parseFloat(extraDonationPercent);
      if (isNaN(val) || val < 0 || val > 60) {
        extraErr = 'Enter a value between 0 and 60';
      }
    }
    setExtraError(extraErr);

    if (Object.keys(errors).length > 0 || extraErr) return;

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        firstName: sellerInfo.firstName,
        lastName: sellerInfo.lastName,
        email: sellerInfo.email,
        phone: sellerInfo.phone,
        venmo: sellerInfo.venmo,
        agreementTimestamp: serverTimestamp(),
        extraDonationPercent: extraDonationPercent !== '' ? parseFloat(extraDonationPercent) : null,
        items: items.map(({ id, ...rest }) => ({
          id,
          category: rest.category,
          description: rest.description,
          brand: rest.brand,
          model: rest.model || '',
          color: rest.color,
          size: rest.size,
          price: parseFloat(rest.price),
          donateToBoec: rest.donateToBoec,
          sold: false,
        })),
        createdAt: serverTimestamp(),
      });
      setSubmissionId(docRef.id);
      navigate('/confirmation');
    } catch (err) {
      console.error('Submission error:', err);
      alert('Something went wrong submitting your form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper">
      <HeaderLight />
      <main className="page-content">

        <h1 className="section-title">Your Items</h1>
        <p className="section-subtitle">Add all items you're bringing to the swap. At least one item is required.</p>

        {items.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            index={index}
            onUpdate={(field, value) => updateItem(item.id, field, value)}
            onRemove={() => removeItem(item.id)}
            showRemove={items.length > 1}
            errors={itemErrors[item.id]}
            categories={categories}
          />
        ))}

        <button className="btn btn-secondary btn-full" onClick={addItem} style={{ marginBottom: 24 }}>
          + Add Another Item
        </button>

        {/* Extra donation */}
        <div className="card">
          <div className="card-header">
            <h2>Extra Scholarship Donation</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: 16 }}>
            40% of your sales already go to the VNTRbirds scholarship fund. If you'd like to donate more, enter the additional percentage below (max 60%).
          </p>
          <div className="form-group" style={{ maxWidth: 260 }}>
            <label className="form-label">Additional donation % <span className="optional">(optional)</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="number"
                className={`form-input ${extraError ? 'error' : ''}`}
                placeholder="e.g. 10"
                min="0"
                max="60"
                value={extraDonationPercent}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) <= 60) setExtraDonationPercent(val);
                }}
                style={{ maxWidth: 120 }}
              />
              <span style={{ fontSize: '0.95rem', color: 'var(--gray-600)' }}>%</span>
            </div>
            {extraError && <p className="error-text">{extraError}</p>}
            {extraDonationPercent !== '' && !extraError && (
              <p style={{ fontSize: '0.82rem', color: 'var(--teal)', marginTop: 6 }}>
                You'll donate {40 + parseFloat(extraDonationPercent || 0)}% total to the scholarship fund.
              </p>
            )}
          </div>
        </div>

        <div className="btn-nav-row">
          <button className="btn btn-secondary" onClick={() => navigate('/seller')} disabled={submitting}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit →'}
          </button>
        </div>
        <div className="progress-bar-wrapper">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`progress-step ${s < 3 ? 'completed' : s === 3 ? 'active' : ''}`} />
          ))}
        </div>
      </main>
    </div>
  );
}
