import React from "react";

export default function Header() {
  return (
    <header className="eq-header">
      <div className="eq-container">

        {/* Brand */}
        <div className="eq-brand">
          <div className="eq-logo">
            <span className="bar b1"></span>
            <span className="bar b2"></span>
            <span className="bar b3"></span>
            <span className="bar b4"></span>
            <span className="bar b5"></span>
          </div>
          <h1 className="eq-title">Equalizer</h1>
        </div>

        {/* Navigation */}
        <nav className="eq-nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
        </nav>

        {/* Actions */}
        <div className="eq-actions">
          <button className="btn primary">Get Started</button>
        </div>

      </div>
    </header>
  );
}
