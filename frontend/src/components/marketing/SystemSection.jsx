import { marketing } from '../../content/marketing';
import './sections.css';

export default function SystemSection() {
  return (
    <section id="system" className="section">
      <div className="container">
        <p className="eyebrow">{marketing.system.eyebrow}</p>
        <h2 className="display section-title">{marketing.system.title}</h2>
        <div className="system-grid">
          {marketing.system.items.map((item, i) => (
            <article key={item.id} className="system-card">
              <div className="system-index">0{i + 1}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
