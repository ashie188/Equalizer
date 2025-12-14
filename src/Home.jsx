// src/pages/Home.jsx
import React, { useRef, useState } from "react";

export default function Home() {
  // UI refs & state you will use in the implementation
  const canvasRef = useRef(null); // visualizer canvas
  const wsStatusRef = useRef(null); // connection status display (optional)
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const workletRef = useRef(null);
  const wsRef = useRef(null);
  const animationRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [sampleRate, setSampleRate] = useState("--");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  // PLACEHOLDERS — implement these functions later
  // - startStreaming: request mic, create AudioContext + AnalyserNode, start RAF draw loop, open ws
  // - stopStreaming: stop tracks, close AudioContext, close ws, cancel RAF
  // - toggleMute / change settings / show presets
  // Do NOT implement here per your instruction.
  async function startStreaming() {
    if (isRunning) return;
    try {
      /* ===============================
   1. Microphone access
   =============================== */
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      /* ===============================
   2. AudioContext
   =============================== */
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      setSampleRate(audioCtx.sampleRate);

      /* ===============================
   3. WebSocket connection
   =============================== */
      const ws = new WebSocket("ws://localhost:5000/ws/transcribe");
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "meta",
            sampleRate: audioCtx.sampleRate,
            channels: 1,
            encoding: "pcm16",
          })
        );
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "partial") setPartialTranscript(msg.text);
        if (msg.type === "final")
          setFinalTranscript((prev) => prev + " " + msg.text);
      };

      wsRef.current = ws;

      /* ===============================
       4. Load AudioWorklet
       =============================== */
      await audioCtx.audioWorklet.addModule("/audio-processor.js");

      /* ===============================
       5. Audio nodes
       =============================== */
      const source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");
      workletRef.current = workletNode;

      /* ===============================
       6. Send PCM chunks immediately
       =============================== */
      workletNode.port.onmessage = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(event.data); // raw PCM16 chunk
        }
      };

      /* ===============================
       7. Connect audio graph
       =============================== */
      source.connect(analyser);
      source.connect(workletNode);

      /* ===============================
       8. Start visualizer (60 FPS)
       =============================== */
      const freqData = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        analyser.getByteFrequencyData(freqData);
        drawCircularVisualizer(freqData); // your canvas logic
        animationRef.current = requestAnimationFrame(draw);
      };

      draw();
      setIsRunning(true);
    } catch (err) {
      console.error("startStreaming error:", err);
    }
  }

  function stopStreaming() {
    try {
      /* ===============================
       1. Stop visualizer loop
       =============================== */
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      /* ===============================
       2. Disconnect AudioWorklet
       =============================== */
      if (workletRef.current) {
        workletRef.current.port.onmessage = null;
        workletRef.current.disconnect();
        workletRef.current = null;
      }

      /* ===============================
       3. Disconnect analyser
       =============================== */
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      /* ===============================
       4. Stop microphone tracks
       =============================== */
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      /* ===============================
       5. Close AudioContext
       =============================== */
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }

      /* ===============================
       6. Close WebSocket
       =============================== */
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      /* ===============================
       7. Reset UI state
       =============================== */
      setIsRunning(false);
      setPartialTranscript("");
      setSampleRate("--");

      console.log("Streaming stopped cleanly");
    } catch (err) {
      console.error("stopStreaming error:", err);
    }
  }

  function drawCircularVisualizer(freqData) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Handle high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.22;
    const bars = 120;
    const step = Math.floor(freqData.length / bars);

    for (let i = 0; i < bars; i++) {
      const value = freqData[i * step] / 255; // normalize 0–1
      const angle = (i / bars) * Math.PI * 2;

      const barLength = value * (Math.min(width, height) * 0.25);
      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius + barLength);
      const y2 = cy + Math.sin(angle) * (baseRadius + barLength);

      ctx.strokeStyle = `hsl(${200 + value * 120}, 80%, 60%)`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  function handlePreset(presetName) {
    // implement any preset changes (color theme, sensitivity, bars count)
  }

  // render UI only — visualizer canvas + controls + transcripts
  return (
    <main className="home-root">
      <section className="hero">
        <div className="hero-left">
          <h2 className="hero-title">Equalizer</h2>
          <p className="hero-sub">
            Real-time circular audio visualizer with low-latency streaming.
            Capture your mic, analyze frequency data, and watch sound come
            alive.
          </p>

          <div className="controls">
            <div className="control-row">
              <button
                className={`btn ${isRunning ? "btn-stop" : "btn-start"}`}
                onClick={() => (isRunning ? stopStreaming() : startStreaming())}
              >
                {isRunning ? "Stop" : "Start"}
              </button>

              <div className="control-meta">
                <div className="meta-item">
                  <label>Sample Rate</label>
                  <div className="meta-value">{sampleRate}</div>
                </div>
                <div className="meta-item">
                  <label>Latency</label>
                  <div className="meta-value">— ms</div>
                </div>
              </div>
            </div>

            {/*<div className="presets">
              <button className="chip" onClick={() => handlePreset("bright")}>Bright</button>
              <button className="chip" onClick={() => handlePreset("dark")}>Dark</button>
              <button className="chip" onClick={() => handlePreset("neon")}>Neon</button>
            </div>*/}
          </div>

          <div className="transcripts">
            <div className="partial">
              <small>Partial</small>
              <div className="partial-box" ref={wsStatusRef}>
                {partialTranscript || (
                  <span className="dim">Waiting for audio...</span>
                )}
              </div>
            </div>

            <div className="final">
              <small>Final</small>
              <div className="final-box">
                {finalTranscript || (
                  <span className="dim">No final transcription yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="visualizer-card">
            <canvas ref={canvasRef} className="visualizer-canvas" />
            <div className="viz-overlay">
              <div className="viz-center">
                <div className="viz-title">Live</div>
                <div className="viz-sub">Microphone input</div>
              </div>
            </div>
          </div>

          <div className="small-controls">
            <div className="help">
              Tip: allow microphone access and speak near your mic.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
