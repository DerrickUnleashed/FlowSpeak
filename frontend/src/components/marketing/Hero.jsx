import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { marketing } from '../../content/marketing';
import { initMotion, destroyMotion, prefersReducedMotion } from '../../lib/motion';
import './Hero.css';

export default function Hero() {
  const root = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return undefined;
    const { gsap } = initMotion();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=100%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      tl.to('.hero-shard', { x: 0, y: 0, rotate: 0, opacity: 1, stagger: 0.03 }, 0);
      tl.to('.hero-ribbon-a', { y: -40, x: 30, opacity: 0.55 }, 0);
      tl.to('.hero-ribbon-b', { y: 30, x: -20, opacity: 0.35 }, 0);
      tl.to('.hero-grid', { y: -20, opacity: 0.35 }, 0);
      tl.to('.hero-lead, .hero-actions, .hero-chips', { y: 0, opacity: 1, stagger: 0.04 }, 0.15);
      tl.to('.hero-progress span', { scaleX: 1 }, 0);
    }, root);
    return () => { ctx.revert(); destroyMotion(); };
  }, []);

  return (
    <section id="hero" className="hero" ref={root} aria-label="Hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <svg className="hero-ribbon hero-ribbon-a" viewBox="0 0 1200 300" fill="none"><path d="M0 180 C180 70, 260 260, 430 170 C600 80, 720 260, 890 160 C1020 85, 1110 140, 1200 120" stroke="currentColor" strokeWidth="1.2"/></svg>
        <svg className="hero-ribbon hero-ribbon-b" viewBox="0 0 1200 300" fill="none"><path d="M0 120 C160 220, 300 60, 470 150 C640 240, 760 80, 930 150 C1050 200, 1120 170, 1200 190" stroke="currentColor" strokeWidth="1.2"/></svg>
      </div>
      <div className="container hero-inner">
        <p className="eyebrow">{marketing.hero.eyebrow}</p>
        <h1 className="display hero-title" aria-label="Fractured speech, guided momentum.">
          {marketing.hero.title.map((word, i) => (
            <span key={word} className="hero-shard" style={{ '--tx': `${(i % 2 ? 1 : -1) * (18 + i * 6)}px`, '--ty': `${(i % 3 - 1) * 22}px`, '--rot': `${(i % 2 ? -1 : 1) * (3 + i)}deg` }}>{word}</span>
          ))}
        </h1>
        <p className="lead hero-lead">{marketing.hero.lead}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to={marketing.hero.primaryCta.href}>{marketing.hero.primaryCta.label}</Link>
          <a className="btn btn-ghost" href={marketing.hero.secondaryCta.href} target="_blank" rel="noreferrer">{marketing.hero.secondaryCta.label}</a>
        </div>
        <div className="hero-chips" aria-label="Highlights">
          {marketing.hero.chips.map((c) => <span key={c} className="chip">{c}</span>)}
        </div>
        <div className="hero-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
