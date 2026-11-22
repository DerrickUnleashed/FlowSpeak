import { useState } from 'react';
import './nav.css';

const links = [
  { label: 'Tension', href: '#tension' },
  { label: 'System', href: '#system' },
  { label: 'Labs', href: '#stutter-lab' },
  { label: 'Proof', href: '#proof' },
  { label: 'Contact', href: '#contact' }
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav-wrap">
      <nav className="nav container" aria-label="Primary">
        <a className="brand" href="#hero" aria-label="FLOWspeak home">
          <span className="brand-mark">FLOW</span><span className="brand-rest">speak</span>
        </a>
        <button className="nav-toggle btn btn-ghost" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
        </button>
        <div id="nav-links" className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a className="btn btn-primary nav-cta" href="#stutter-lab" onClick={() => setOpen(false)}>Launch Lab</a>
        </div>
      </nav>
    </header>
  );
}
