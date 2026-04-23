import { useSubmission } from '../context/SubmissionContext';
import { HeaderLight } from '../components/Header';

export default function ConfirmationPage() {
  const { sellerInfo, items, extraDonationPercent } = useSubmission();

  const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const donationPct = 40 + (parseFloat(extraDonationPercent) || 0);
  const sellerPct = 100 - donationPct;

  return (
    <div className="page-wrapper">
      <HeaderLight />
      <main className="page-content">
        <div className="progress-bar-wrapper">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="progress-step completed" />
          ))}
        </div>

        <div className="confirmation-hero">
          <h1>You're All Set! 🎉</h1>
          <p>Your items have been registered for the VNTRbirds Gear Swap+Sale.</p>
        </div>

        {/* Reminders */}
        <div className="card">
          <div className="card-header">
            <h2>Important Reminders</h2>
          </div>
          <div className="info-block">
            <p>
              <strong>💸 Sold proceeds:</strong> 60% of your sold items will be Venmo'd to <strong>@{sellerInfo.venmo || '—'}</strong> by end of day.
              {extraDonationPercent && parseFloat(extraDonationPercent) > 0 && (
                <> You've generously donated an extra {extraDonationPercent}% to the scholarship fund ({donationPct}% total).</>
              )}
            </p>
          </div>
          <div className="warning-block">
            <p>
              <strong>🎒 Unsold items:</strong> Must be picked up between <strong>4:00–5:00pm</strong> on May 31. Any items not collected will be donated to the Breckenridge Outdoor Education Center (BOEC).
            </p>
          </div>
        </div>

        {/* Seller Info Recap */}
        <div className="card">
          <div className="card-header">
            <h2>Your Info</h2>
          </div>
          <table className="recap-table">
            <tbody>
              <tr><td style={{ width: '40%', color: 'var(--gray-600)', fontWeight: 600 }}>Name</td><td>{sellerInfo.firstName} {sellerInfo.lastName}</td></tr>
              <tr><td style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Email</td><td>{sellerInfo.email}</td></tr>
              <tr><td style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Phone</td><td>{sellerInfo.phone}</td></tr>
              <tr><td style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Venmo</td><td>@{sellerInfo.venmo}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Item List Recap */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Your Items ({items.length})</h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--gray-600)' }}>
              Total listed value: <strong>${totalValue.toFixed(2)}</strong>
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="recap-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Price</th>
                  <th>BOEC if unsold</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--gray-400)', fontWeight: 600 }}>{i + 1}</td>
                    <td>{item.category}</td>
                    <td>{item.description}</td>
                    <td>{item.brand}</td>
                    <td>{item.model || '—'}</td>
                    <td>{item.color}</td>
                    <td>{item.size}</td>
                    <td><strong>${parseFloat(item.price).toFixed(2)}</strong></td>
                    <td>
                      {item.donateToBoec
                        ? <span className="boec-badge">BOEC ✓</span>
                        : <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>No</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--lavender-light)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
            <strong>Scholarship fund contribution:</strong> {donationPct}% of your sold proceeds
            ({sellerPct}% will be Venmo'd to you)
          </div>
        </div>

      </main>
    </div>
  );
}
