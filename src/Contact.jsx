import React from "react";

export default function Contact() {
  return (
    <main className="contact-page">
      <section className="contact-card">
        <h1>Contact</h1>

        <p>
          If you have questions about the Equalizer project, architecture, or
          implementation details, feel free to reach out.
        </p>

        <div className="contact-info">
          <div>
            <span className="label">Email</span>
            <span>your-email@example.com</span>
          </div>

          <div>
            <span className="label">GitHub</span>
            <span>github.com/your-username</span>
          </div>

          <div>
            <span className="label">LinkedIn</span>
            <span>linkedin.com/in/your-profile</span>
          </div>
        </div>

        <p className="contact-note">
          This project is intended for technical evaluation and demonstration
          purposes.
        </p>
      </section>
    </main>
  );
}
