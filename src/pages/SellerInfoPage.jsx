import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmission } from '../context/SubmissionContext';
import { HeaderLight } from '../components/Header';

export default function SellerInfoPage() {
  const navigate = useNavigate();
  const { sellerInfo, setSellerInfo } = useSubmission();
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setSellerInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const newErrors = {};
    if (!sellerInfo.firstName.trim()) newErrors.firstName = 'Required';
    if (!sellerInfo.lastName.trim()) newErrors.lastName = 'Required';
    if (!sellerInfo.email.trim()) {
      newErrors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerInfo.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!sellerInfo.phone.trim()) newErrors.phone = 'Required';
    if (!sellerInfo.venmo.trim()) newErrors.venmo = 'Required';
    return newErrors;
  }

  function handleContinue() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    navigate('/items');
  }

  return (
    <div className="page-wrapper">
      <HeaderLight />
      <main className="page-content">

        <h1 className="section-title">Seller Info</h1>
        <p className="section-subtitle">All fields are required. Your Venmo is used to send your proceeds.</p>

        <div className="card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                value={sellerInfo.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                placeholder="Jane"
                autoComplete="given-name"
              />
              {errors.firstName && <p className="error-text">{errors.firstName}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                value={sellerInfo.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                placeholder="Smith"
                autoComplete="family-name"
              />
              {errors.lastName && <p className="error-text">{errors.lastName}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={sellerInfo.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                value={sellerInfo.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="(555) 555-5555"
                autoComplete="tel"
              />
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Venmo Handle</label>
              <div className={`input-prefix-wrapper ${errors.venmo ? 'error' : ''}`}>
                <span className="input-prefix">@</span>
                <input
                  type="text"
                  className="input-prefix-field"
                  value={sellerInfo.venmo}
                  onChange={e => handleChange('venmo', e.target.value.replace(/^@+/, ''))}
                  placeholder="username"
                  autoComplete="off"
                />
              </div>
              {errors.venmo && <p className="error-text">{errors.venmo}</p>}
            </div>
          </div>
        </div>

        <div className="btn-nav-row">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleContinue}>
            Continue to Items →
          </button>
        </div>
        <div className="progress-bar-wrapper">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`progress-step ${s < 2 ? 'completed' : s === 2 ? 'active' : ''}`} />
          ))}
        </div>
      </main>
    </div>
  );
}
