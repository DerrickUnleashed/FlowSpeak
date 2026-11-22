import { marketing } from '../../content/marketing';
import './sections.css';

export default function ProofSection() {
  return (
    <section id="proof" className="section">
      <div className="container">
        <p className="eyebrow">{marketing.proof.eyebrow}</p>
        <h2 className="display section-title">{marketing.proof.title}</h2>
        <div className="press-strip" aria-label="Concept press marks">
          {marketing.proof.press.map((p) => <span key={p}>{p}</span>)}
        </div>
        <div className="proof-grid">
          {marketing.proof.testimonials.map((t) => (
            <blockquote key={t.author} className="quote-card">
              <p>“{t.quote}”</p>
              <footer><strong>{t.author}</strong> <span>{t.role}</span></footer>
            </blockquote>
          ))}
          <div className="quote-card">
            <p className="footer-head">Real team</p>
            <ul className="team-list">{marketing.proof.team.map((n) => <li key={n}>{n}</li>)}</ul>
            <div className="real-links">{marketing.proof.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn btn-ghost">{l.label}</a>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
