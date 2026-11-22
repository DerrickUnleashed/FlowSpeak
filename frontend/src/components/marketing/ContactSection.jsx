import { marketing } from '../../content/marketing';
import './sections.css';

export default function ContactSection() {
  return (
    <section id="contact" className="section">
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">{marketing.contact.eyebrow}</p>
          <h2 className="display section-title">{marketing.contact.title}</h2>
          <p className="lead">{marketing.contact.lead}</p>
        </div>
        <form className="contact-form" action="mailto:support@flowspeak.ai" method="post" encType="text/plain">
          <label>Name <input name="name" autoComplete="name" required /></label>
          <label>Email <input name="email" type="email" autoComplete="email" required /></label>
          <label>Message <textarea name="message" rows="4" required /></label>
          <button className="btn btn-primary" type="submit">Send message</button>
        </form>
      </div>
    </section>
  );
}
