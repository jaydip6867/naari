import React from 'react';
import PublicLayout from './PublicLayout';

const Contact = () => (
  <PublicLayout>
    <section className="public-copy-page contact-page">
      <p className="public-eyebrow">Come say hello</p>
      <h1>Let’s make something memorable.</h1>
      <p className="public-lede">For appointments, custom enquiries, or questions about the collection, our team would love to hear from you.</p>
      <div className="contact-details">
        <div><span>Visit</span><p>24, Ugameshwar Bunglow<br />Nr Taapi Arcade, Mota Varachha<br />Surat - 394101</p></div>
        <div><span>Reach us</span><p><a href="tel:+919825000000">+91 98250 00000</a><br /><a href="mailto:hello@naariart.com">hello@naariart.com</a></p></div>
      </div>
    </section>
  </PublicLayout>
);

export default Contact;
