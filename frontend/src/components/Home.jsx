import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { marketing } from '../content/marketing';
import { initMotion } from '../lib/motion';
import './Home.css';

const WAVE_BARS = 64;

function BreathWave({ reduced }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const barsRef = useRef(new Array(WAVE_BARS).fill(0.08));
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    initMotion();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const data = new Uint8Array(128);
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      let liveData = null;
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(data);
        liveData = data;
      }

      const gap = 3;
      const barW = (w - gap * (WAVE_BARS - 1)) / WAVE_BARS;
      for (let i = 0; i < WAVE_BARS; i++) {
        const mirror = i < WAVE_BARS / 2 ? i : WAVE_BARS - 1 - i;
        const centerBias = 1 - Math.abs(mirror - WAVE_BARS / 4) / (WAVE_BARS / 4);
        let target;
        if (liveData) {
          target = 0.08 + (liveData[mirror * 2] / 255) * 0.92;
        } else {
          const wave = Math.sin(t * 0.05 - mirror * 0.22) * 0.5 + 0.5;
          const breath = Math.sin(t * 0.012) * 0.5 + 0.5;
          target = 0.08 + wave * centerBias * 0.55 + breath * 0.3;
        }
        const bars = barsRef.current;
        bars[i] += (target - bars[i]) * (reduced ? 1 : 0.18);
        const bh = Math.max(3, bars[i] * h);
        const x = i * (barW + gap);
        const y = (h - bh) / 2;

        const hue = mirror / (WAVE_BARS / 2);
        const r = Math.round(8 + hue * 124);
        const g = Math.round(253 - hue * 137);
        const b = Math.round(216 - hue * 180);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.55 + bars[i] * 0.45})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, bh, barW / 2);
        ctx.fill();
      }
      t += 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioRef.current) audioRef.current.close();
    };
  }, [reduced]);

  const activate = useCallback(async () => {
    setTouched(true);
    if (listening) {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      analyserRef.current = null;
      setListening(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening]);

  return (
    <div className={`breath-wave ${touched ? 'is-touched' : ''}`}>
      <div className="breath-halo" aria-hidden="true" />
      <canvas ref={canvasRef} className="breath-canvas" aria-hidden="true" />
      <button
        type="button"
        className="breath-trigger"
        onClick={activate}
        aria-label={listening ? 'Stop speech visualization' : 'Activate live speech visualization'}
      >
        <span className="breath-trigger-ring" aria-hidden="true" />
        <span className="breath-trigger-core" aria-hidden="true" />
        <span className="breath-trigger-label">
          {listening ? 'Listening' : touched ? 'Tap to retry' : 'Speak to see your flow'}
        </span>
      </button>
    </div>
  );
}

const Home = () => {
  const reduced = useReducedMotion();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const link = `mailto:support@flowspeak.ai?subject=Contact Form Submission&body=Name: ${formData.name}%0AEmail: ${formData.email}%0AMessage: ${formData.message}`;
    window.location.href = link;
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const reveal = {
    initial: { opacity: 0, y: reduced ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-10%' },
    transition: { duration: reduced ? 0 : 0.7, ease: [0, 0, 0.2, 1] },
  };

  const { hero, tension, system, proof, contact } = marketing;

  return (
    <div className="home-container">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container hero-inner">
          <Motion.p
            className="eyebrow hero-eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.6 }}
          >
            {hero.eyebrow}
          </Motion.p>
          <Motion.h1
            id="hero-title"
            className="display hero-title"
            initial={{ opacity: 0, y: reduced ? 0 : 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 1, ease: [0, 0, 0.2, 1] }}
          >
            {hero.title.map((line, i) => (
              <span className="hero-title-line" key={line} style={{ '--i': i }}>
                {line}
              </span>
            ))}
          </Motion.h1>
          <Motion.p
            className="lead hero-lead"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.3 }}
          >
            {hero.lead}
          </Motion.p>
          <Motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.5 }}
          >
            <a className="btn btn-primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </a>
            <a className="btn btn-ghost" href={hero.secondaryCta.href} target="_blank" rel="noreferrer">
              {hero.secondaryCta.label}
            </a>
          </Motion.div>
          <Motion.ul
            className="hero-chips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.7 }}
          >
            {hero.chips.map((chip) => <li key={chip}>{chip}</li>)}
          </Motion.ul>
        </div>
        <BreathWave reduced={reduced} />
        <div className="hero-fade" aria-hidden="true" />
      </section>

      <section className="section tension-section" aria-labelledby="tension-title">
        <div className="container">
          <Motion.p className="eyebrow" {...reveal}>{tension.eyebrow}</Motion.p>
          <Motion.h2 id="tension-title" className="display section-title" {...reveal}>
            {tension.title}
          </Motion.h2>
          <Motion.p className="lead" {...reveal}>{tension.lead}</Motion.p>
          <div className="stat-grid">
            {tension.stats.map((stat, i) => (
              <Motion.div className="stat" key={stat.value} {...reveal} transition={{ ...reveal.transition, delay: reduced ? 0 : i * 0.1 }}>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-note">{stat.note}</span>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section system-section" id="stutter-lab" aria-labelledby="system-title">
        <div className="container">
          <Motion.p className="eyebrow" {...reveal}>{system.eyebrow}</Motion.p>
          <Motion.h2 id="system-title" className="display section-title" {...reveal}>
            {system.title}
          </Motion.h2>
          <div className="system-grid">
            {system.items.map((item, i) => (
              <Motion.article className="system-card" key={item.id} {...reveal} transition={{ ...reveal.transition, delay: reduced ? 0 : i * 0.08 }}>
                <span className="system-index">0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Motion.article>
            ))}
          </div>
          <Motion.a className="btn btn-primary system-cta" href="/stutter-help" {...reveal}>
            Try FLOWspeak Now
          </Motion.a>
        </div>
      </section>

      <section className="section proof-section" aria-labelledby="proof-title">
        <div className="container">
          <Motion.p className="eyebrow" {...reveal}>{proof.eyebrow}</Motion.p>
          <Motion.h2 id="proof-title" className="display section-title" {...reveal}>
            {proof.title}
          </Motion.h2>
          <div className="proof-grid">
            {proof.testimonials.map((t, i) => (
              <Motion.figure className="quote" key={t.author} {...reveal} transition={{ ...reveal.transition, delay: reduced ? 0 : i * 0.1 }}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <span>{t.author}</span>
                  <span className="quote-role">{t.role}</span>
                </figcaption>
              </Motion.figure>
            ))}
          </div>
          <Motion.div className="proof-meta" {...reveal}>
            <div className="press-row">
              {proof.press.map((p) => <span key={p}>{p}</span>)}
            </div>
            <div className="proof-links">
              {proof.links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>
              ))}
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="section contact-section" id="contact" aria-labelledby="contact-title">
        <div className="container contact-inner">
          <div className="contact-copy">
            <Motion.p className="eyebrow" {...reveal}>{contact.eyebrow}</Motion.p>
            <Motion.h2 id="contact-title" className="display section-title" {...reveal}>
              {contact.title}
            </Motion.h2>
            <Motion.p className="lead" {...reveal}>{contact.lead}</Motion.p>
            <Motion.div className="contact-info" {...reveal}>
              <a href="mailto:support@flowspeak.ai">support@flowspeak.ai</a>
              <span>www.flowspeak.ai</span>
            </Motion.div>
          </div>
          <Motion.form className="contact-form" onSubmit={handleSubmit} {...reveal}>
            {isSubmitted ? (
              <div className="success-message" role="status">
                <span className="success-icon" aria-hidden="true">✓</span>
                <p>Thank you for your message. We will get back to you soon.</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary submit-button">Send Message</button>
              </>
            )}
          </Motion.form>
        </div>
      </section>
    </div>
  );
};

export default Home;
