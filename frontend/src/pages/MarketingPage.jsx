import React, { lazy, Suspense } from 'react';
import Hero from '../components/marketing/Hero';
import TensionSection from '../components/marketing/TensionSection';
import SystemSection from '../components/marketing/SystemSection';
import ProofSection from '../components/marketing/ProofSection';
import ContactSection from '../components/marketing/ContactSection';
import '../components/marketing/sections.css';

const StutterLab = lazy(() => import('../components/StutterHelp'));
const TherapyLab = lazy(() => import('../components/Therapy'));

const LabSection = ({ id, title, note, children }) => (
  <section id={id} className="section lab-section">
    <div className="container">
      <p className="eyebrow">Demo Lab / Concept</p>
      <h2 className="display section-title">{title}</h2>
      <p className="lead lab-note">{note}</p>
      <Suspense fallback={<div className="lab-loading" role="status">Loading lab…</div>}>
        {children}
      </Suspense>
    </div>
  </section>
);

const MarketingPage = () => (
  <div className="marketing-page">
    <Hero />
    <TensionSection />
    <SystemSection />
    <LabSection
      id="stutter-lab"
      title="Stutter detection lab"
      note="Live mic demo. The pattern label is simulated concept data — no medical claim."
    >
      <StutterLab />
    </LabSection>
    <LabSection
      id="therapy-lab"
      title="Therapy pacing lab"
      note="Follow the highlight or speak along. Runs entirely in your browser."
    >
      <TherapyLab />
    </LabSection>
    <ProofSection />
    <ContactSection />
  </div>
);

export default MarketingPage;
