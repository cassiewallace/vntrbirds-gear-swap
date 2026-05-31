import { useSubmission } from '../context/SubmissionContext';
import { HeaderLight } from '../components/Header';

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ConfirmationPage() {
  const { sellerInfo, items, extraDonationPercent } = useSubmission();

  const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const donationPct = 40 + (parseFloat(extraDonationPercent) || 0);
  const sellerPct = 100 - donationPct;

  return (
    <div className="page-wrapper">
      <HeaderLight />
      <main className="page-content">

        <div className="confirmation-hero">
          <h1>You're All Set! 🎉</h1>
          <p>Your items have been registered for the VNTRbirds Gear Swap + Sale.</p>
        </div>

        {/* Reminders */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h2>Important Reminders</h2>
          </div>
          <div className="info-block">
            <p>
              <span style={{ fontWeight: 500 }}>💸 Sold proceeds:</span> 60% of your sold items will be Venmo'd to @{sellerInfo.venmo || '—'} by end of day.
              {extraDonationPercent && parseFloat(extraDonationPercent) > 0 && (
                <> You've generously donated an extra {extraDonationPercent}% to the scholarship fund ({donationPct}% total).</>
              )}
            </p>
          </div>
          <div className="warning-block">
            <p>
              <span style={{ fontWeight: 500 }}>🎒 Unsold items:</span> Must be picked up between 4:00–5:00pm on May 31. Any items not collected will be donated to the Breckenridge Outdoor Education Center (BOEC).
            </p>
          </div>
        </div>

        {/* Seller Info Recap */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <h2>Your Info</h2>
          </div>
          <table className="recap-table">
            <tbody>
              <tr><td style={{ width: '40%', color: 'var(--gray-600)' }}>Name</td><td>{sellerInfo.firstName} {sellerInfo.lastName}</td></tr>
              <tr><td style={{ color: 'var(--gray-600)' }}>Email</td><td>{sellerInfo.email}</td></tr>
              <tr><td style={{ color: 'var(--gray-600)' }}>Phone</td><td>{sellerInfo.phone}</td></tr>
              <tr><td style={{ color: 'var(--gray-600)' }}>Venmo</td><td>@{sellerInfo.venmo}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Item List Recap */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>Your Items ({items.length})</h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--gray-600)' }}>
              Total listed value: ${fmt(totalValue)}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="recap-table">
              <thead>
                <tr>
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
                    <td>{item.category}</td>
                    <td>{item.description}</td>
                    <td>{item.brand}</td>
                    <td>{item.model || '—'}</td>
                    <td>{item.color}</td>
                    <td>{item.size}</td>
                    <td>${fmt(parseFloat(item.price))}</td>
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
            Scholarship fund contribution: {donationPct}% of your sold proceeds
            ({sellerPct}% will be Venmo'd to you)
          </div>
        </div>
        <div className="progress-bar-wrapper">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="progress-step completed" />
          ))}
        </div>
      </main>
    </div>
  );
}
