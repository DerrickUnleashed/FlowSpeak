import React from 'react';
import Hero from '../components/marketing/Hero';
import TensionSection from '../components/marketing/TensionSection';
import SystemSection from '../components/marketing/SystemSection';
import ProofSection from '../components/marketing/ProofSection';
import ContactSection from '../components/marketing/ContactSection';
import '../components/marketing/sections.css';

const MarketingPage = () => (
  <div className="marketing-page">
    <Hero />
    <TensionSection />
    <SystemSection />
    <ProofSection />
    <ContactSection />
  </div>
);

export default MarketingPage;
