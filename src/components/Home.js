import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from './PublicLayout';

const Home = () => (
  <PublicLayout>
    <section className="public-hero">
      <div>
        <p className="public-eyebrow">Crafted for your occasion</p>
        <h1>Clothing with a story of its own.</h1>
        <p className="public-lede">Discover thoughtful silhouettes, expressive details, and the quiet confidence of a garment made for you.</p>
        <div className="public-actions">
          <Link className="public-button" to="/product">Explore the collection</Link>
          <Link className="public-text-link" to="/about">Our approach</Link>
        </div>
      </div>
      <div className="hero-mark" aria-hidden="true">NA</div>
    </section>
    <section className="public-feature-row">
      <div><strong>01</strong><h2>Considered design</h2><p>Distinctive pieces shaped around comfort, movement, and your personal style.</p></div>
      <div><strong>02</strong><h2>Made with patience</h2><p>Every finish is given the attention it deserves, from first sketch to final stitch.</p></div>
      <div><strong>03</strong><h2>Made for you</h2><p>Browse the collection and find something that feels unmistakably yours.</p></div>
    </section>
  </PublicLayout>
);

export default Home;
