import React, { useState } from 'react';
import PublicLayout from './PublicLayout';
import { inquiryAPI } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    state: '',
    city: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      /*
       * Validation
       */

      if (
        !formData.name.trim() ||
        !formData.contact.trim() ||
        !formData.state.trim() ||
        !formData.city.trim() ||
        !formData.message.trim()
      ) {
        setErrorMessage('Please fill in all fields.');
        setLoading(false);
        return;
      }

      /*
       * Send data to PHP
       */

      await inquiryAPI.addInquiry({
        leadName: formData.name.trim(),
        phone: formData.contact.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        leadResponseMessage: formData.message.trim(),
        source: 'Website',
        pipelineStage: 'New',
      });

      /*
       * Reset form
       */

      setFormData({
        name: '',
        contact: '',
        state: '',
        city: '',
        message: '',
      });

      setSuccessMessage(
        'Thank you! Your enquiry has been submitted successfully.'
      );
    } catch (error) {
      console.error(
        'Error submitting inquiry:',
        error
      );

      setErrorMessage(
        error.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="public-copy-page contact-page">

        <div className="contact-hero">

          <p className="public-eyebrow">
            Come say hello
          </p>

          <h1>
            Let’s make something memorable.
          </h1>

          <p className="public-lede">
            For appointments, custom enquiries, or questions
            about the collection, our team would love to hear
            from you.
          </p>

        </div>


        <div className="contact-details">

          <div className="contact-detail-item">

            <span>Visit</span>

            <p>
              24, Ugameshwar Bunglow
              <br />
              Nr Taapi Arcade, Mota Varachha
              <br />
              Surat - 394101
            </p>

          </div>


          <div className="contact-detail-item">

            <span>Reach us</span>

            <p>

              <a href="tel:+919825000000">
                +91 98250 00000
              </a>

              <br />

              <a href="mailto:hello@naariart.com">
                hello@naariart.com
              </a>

            </p>

          </div>

        </div>


        {/* Contact Form */}

        <div className="contact-form-wrapper">

          <div className="contact-form-header">

            <p className="public-eyebrow">
              Send an enquiry
            </p>

            <h2>
              We’d love to hear from you.
            </h2>

            <p>
              Fill in your details below and our team
              will get back to you shortly.
            </p>

          </div>


          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <div className="contact-form-grid">


              {/* Name */}

              <div className="form-group">

                <label htmlFor="name">
                  Name <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />

              </div>


              {/* Contact */}

              <div className="form-group">

                <label htmlFor="contact">
                  Contact <span>*</span>
                </label>

                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  autoComplete="tel"
                  required
                />

              </div>


              {/* State */}

              <div className="form-group">

                <label htmlFor="state">
                  State <span>*</span>
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter your state"
                  required
                />

              </div>


              {/* City */}

              <div className="form-group">

                <label htmlFor="city">
                  City <span>*</span>
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />

              </div>

            </div>


            {/* Message */}

            <div className="form-group message-group">

              <label htmlFor="message">
                Message <span>*</span>
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help you..."
                rows="6"
                required
              />

            </div>


            <div className="contact-form-footer">

              <p className="required-note">
                * Required fields
              </p>

              <button
                type="submit"
                className="contact-submit-btn"
                disabled={loading}
              >

                {loading
                  ? 'Submitting...'
                  : 'Submit Enquiry'}

              </button>

            </div>


            {successMessage && (

              <div
                className="form-status success"
                role="alert"
              >

                <span>✓</span>

                {successMessage}

              </div>

            )}


            {errorMessage && (

              <div
                className="form-status error"
                role="alert"
              >

                <span>!</span>

                {errorMessage}

              </div>

            )}

          </form>

        </div>

      </section>


      {/* Existing CSS */}

      <style>{`

        .contact-page {
          padding-bottom: 80px;
        }

        .contact-hero {
          max-width: 850px;
        }

        .contact-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-top: 50px;
          padding: 30px 0;
          border-top: 1px solid rgba(0, 0, 0, 0.12);
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        }

        .contact-detail-item span {
          display: block;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.6;
        }

        .contact-detail-item p {
          margin: 0;
          line-height: 1.8;
        }

        .contact-detail-item a {
          color: inherit;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .contact-detail-item a:hover {
          opacity: 0.6;
        }

        .contact-form-wrapper {
          max-width: 900px;
          margin: 70px auto 0;
          padding: 48px;
          background: #f8f6f1;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .contact-form-header {
          margin-bottom: 35px;
        }

        .contact-form-header h2 {
          margin: 8px 0 12px;
          font-size: 32px;
          font-weight: 500;
          line-height: 1.2;
        }

        .contact-form-header > p:last-child {
          max-width: 600px;
          margin: 0;
          line-height: 1.7;
          opacity: 0.7;
        }

        .contact-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .form-group label span {
          color: #a34a3c;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 15px 16px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: #fff;
          color: inherit;
          font: inherit;
          outline: none;
          border-radius: 0;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .form-group input {
          min-height: 52px;
        }

        .form-group textarea {
          min-height: 150px;
          resize: vertical;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          opacity: 0.45;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: rgba(0, 0, 0, 0.65);
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
        }

        .message-group {
          margin-top: 24px;
        }

        .contact-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 28px;
        }

        .required-note {
          margin: 0;
          font-size: 12px;
          opacity: 0.55;
        }

        .contact-submit-btn {
          min-width: 180px;
          padding: 15px 26px;
          border: 1px solid #171717;
          background: #171717;
          color: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            opacity 0.2s ease;
        }

        .contact-submit-btn:hover:not(:disabled) {
          background: transparent;
          color: #171717;
        }

        .contact-submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .form-status {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 22px 0 0;
          padding: 14px 16px;
          font-size: 14px;
          line-height: 1.5;
        }

        .form-status span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }

        .form-status.success {
          background: #edf6ed;
          color: #315c36;
          border: 1px solid #cfe5d1;
        }

        .form-status.success span {
          border-radius: 50%;
          background: #315c36;
          color: #fff;
          font-size: 12px;
        }

        .form-status.error {
          background: #faf0ee;
          color: #8a3d32;
          border: 1px solid #edd1cb;
        }

        .form-status.error span {
          border-radius: 50%;
          background: #8a3d32;
          color: #fff;
          font-size: 13px;
        }

        @media (max-width: 700px) {

          .contact-details {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .contact-form-wrapper {
            margin-top: 50px;
            padding: 28px 20px;
          }

          .contact-form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .contact-form-header h2 {
            font-size: 26px;
          }

          .contact-form-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .contact-submit-btn {
            width: 100%;
          }

        }

      `}</style>
    </PublicLayout>
  );
};

export default Contact;
