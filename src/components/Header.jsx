export default function Header({ subtitle = 'Gear Swap+Sale' }) {
  return (
    <header className="site-header">
      <img src="/favicon.jpg" alt="VNTRbirds" className="header-logo-img" />
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
      <img src="/favicon.jpg" alt="VNTRbirds" className="intro-logo-img" />
      <div className="header-text">
        <div className="intro-logo-title">VNTRbirds</div>
        <div className="intro-logo-event">
          Summer Gear Swap<span style={{ color: 'var(--magenta)' }}>+</span>Sale
        </div>
      </div>
    </header>
  );
}
