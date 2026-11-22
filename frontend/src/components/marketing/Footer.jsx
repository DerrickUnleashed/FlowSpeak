import { marketing } from '../../content/marketing';
import './footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand"><span className="brand-mark">FLOW</span><span className="brand-rest">speak</span></div>
          <p className="footer-copy">Bold editorial-tech concept experience for speech momentum. No medical claims.</p>
        </div>
        <div>
          <p className="footer-head">Team</p>
          <ul>{marketing.proof.team.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div>
          <p className="footer-head">Real Links</p>
          <ul>{marketing.proof.links.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></li>)}</ul>
        </div>
        <div>
          <p className="footer-head">Disclosure</p>
          <p className="footer-copy">Concept showcase: some metrics, testimonials, press marks, and classifier labels are simulated/demo content.</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} FLOWspeak</span>
        <span>Speech, in momentum.</span>
      </div>
    </footer>
  );
}
