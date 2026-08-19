import React from 'react';
import PublicLayout from './PublicLayout';

const About = () => (
  <PublicLayout>
    <section className="public-copy-page">
      <p className="public-eyebrow">The Naari Art point of view</p>
      <h1>Modern Indian craft, made personal.</h1>
      <p className="public-lede">Naari Art brings together thoughtful design and skilled making to create clothing that feels considered, expressive, and easy to live in.</p>
      <div className="public-copy-grid">
        <div><h2>Our work</h2><p>We believe beautiful clothing begins with listening. We take time to understand the occasion, the person, and the small details that make a piece feel right.</p></div>
        <div><h2>Our promise</h2><p>Clear choices, careful construction, and a warm experience from your first conversation to the moment you wear it out.</p></div>
      </div>
    </section>
  </PublicLayout>
);

export default About;
