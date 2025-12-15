import React from "react";

export default function About() {
  return (
    <main className="about-page">
      <section className="about-card">
        <h1>About Equalizer</h1>

        <p>
          <strong>Equalizer</strong> is a real-time audio visualization and
          transcription platform built to demonstrate low-latency audio
          streaming, frequency analysis, and live speech processing.
        </p>

        <p>
          The application captures microphone input using the MediaStream API,
          analyzes frequency data using the Web Audio API, and renders a smooth
          circular audio visualizer at 60 FPS.
        </p>

        <p>
          On the backend, Equalizer is designed around a WebSocket-based
          streaming architecture that supports real-time audio chunk transfer
          and live transcription delivery.
        </p>

        <p className="about-note">
          This project was built as part of a full-stack engineering assignment
          focusing on real-time systems, streaming protocols, and modern web
          audio capabilities.
        </p>
      </section>
    </main>
  );
}
