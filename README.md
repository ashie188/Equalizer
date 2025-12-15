🎧 Equalizer — Real-Time Audio Visualizer & Streaming Transcription

Equalizer is a full-stack web application that demonstrates real-time audio processing, frequency visualization, and low-latency streaming transcription using modern web technologies.

The project focuses on audio pipelines, WebSocket streaming, and responsive UI rendering, rather than one-off request/response APIs.

🚀 Features
Frontend

🎙️ Microphone access using MediaStream API
🎚️ Real-time frequency analysis using Web Audio API (AnalyserNode)
🔵 Smooth circular audio equalizer rendered at 60 FPS
🔄 Live streaming of audio chunks to backend via WebSocket
📝 Real-time partial and final transcription rendering
🎨 Clean, responsive, professional UI

Backend
🔌 WebSocket server for continuous bi-directional communication
📦 Receives small, continuous PCM audio chunks
🔁 Designed for immediate forwarding to a transcription engine
🧠 Streaming transcription pipeline with partial/final updates
♻️ Proper session lifecycle & cleanup handling

🧠 Architecture Flow
Browser (Mic)
   ↓ MediaStream API
AudioWorklet (PCM chunks)
   ↓ WebSocket
Backend (Node.js)
   ↓ Streaming Transcription Engine
Partial / Final Text
   ↓ WebSocket
Frontend UI

🛠️ Tech Stack
Frontend
React (Vite)
Web Audio API
MediaStream API
Canvas API
WebSocket

Backend
Node.js
Express
ws (WebSocket)
Streaming-friendly audio handling


▶️ Running the project
Frontend
npm install
npm run dev

Backend
npm install
node server.js

📌 Summary

Equalizer demonstrates real-time system design rather than simple API usage.
It showcases strong understanding of:

Audio pipelines
Streaming protocols
Low-latency UI updates
Full-stack WebSocket architecture
