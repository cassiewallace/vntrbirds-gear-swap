export default function Header({ subtitle = 'Gear Swap+Sale' }) {
  return (
    <header className="site-header">
      <img src="/logo.png" alt="VNTRbirds" className="header-logo-img" />
      <div className="header-text">
        <div className="logo-text">
          VNTR<span className="accent">birds</span>
        </div>
        <div className="logo-subtitle">{subtitle}</div>
      </div>
    </header>
  );
}

export function HeaderLight() {
  return (
    <header className="site-header-light">
      <a href="https://www.vntrbirds.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'inherit', textDecoration: 'none', color: 'inherit' }}>
        <img src="/logo.png" alt="VNTRbirds" className="intro-logo-img" />
        <div className="header-text">
          <div className="intro-logo-title">VNTRbirds</div>
          <div className="intro-logo-event">
            Gear Swap <span style={{ color: 'var(--magenta)' }}>+</span> Sale
          </div>
        </div>
      </a>
    </header>
  );
}
