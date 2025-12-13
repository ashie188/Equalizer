// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="eq-footer">
      <div className="footer-container">

        {/* Left Section */}
        <div className="footer-brand">
          <h2 className="footer-title">Equalizer</h2>
          <p className="footer-text">
            A creative audio visualizer experience powered by real-time processing.
          </p>
        </div>

        {/* Links */}
        <div className="footer-links">
          <h3 className="footer-heading">Quick Links</h3>
          <a href="/" className="footer-link">Home</a>
          <a href="/about" className="footer-link">About</a>
          <a href="/contact" className="footer-link">Contact</a>
        </div>

        {/* Socials */}
        <div className="footer-socials">
          <h3 className="footer-heading">Follow Us</h3>
          <div className="social-icons">
            <a className="icon" href="#"><i className="fa-brands fa-github"></i></a>
            <a className="icon" href="#"><i className="fa-brands fa-linkedin"></i></a>
            <a className="icon" href="#"><i className="fa-brands fa-x-twitter"></i></a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Equalizer • All Rights Reserved
      </div>
    </footer>
  );
}
