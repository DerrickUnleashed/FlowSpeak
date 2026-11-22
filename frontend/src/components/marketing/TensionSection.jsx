import { marketing } from '../../content/marketing';
import './sections.css';

export default function TensionSection() {
  return (
    <section id="tension" className="section">
      <div className="container tension-grid">
        <div>
          <p className="eyebrow">{marketing.tension.eyebrow}</p>
          <h2 className="display section-title">{marketing.tension.title}</h2>
          <p className="lead">{marketing.tension.lead}</p>
        </div>
        <div className="stat-grid" aria-label="Concept metrics">
          {marketing.tension.stats.map((s) => (
            <article key={s.label} className="stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-note">{s.note}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
