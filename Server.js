import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const port = 5000;
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/**
 * Simple Decimation Resampler: Downsamples 48kHz (3x) to 16kHz 
 * by taking every third 16-bit sample.
 * @param {Buffer} inputBuffer - The 48kHz 16-bit PCM audio buffer.
 * @returns {Buffer} The 16kHz 16-bit PCM audio buffer.
 */
function resample48to16(inputBuffer) {
    // 16-bit PCM means 2 bytes per sample.
    const samples48kHz = new Int16Array(inputBuffer.buffer, inputBuffer.byteOffset, inputBuffer.length / 2);
    const targetLength = Math.floor(samples48kHz.length / 3);
    const samples16kHz = new Int16Array(targetLength);

    for (let i = 0, j = 0; i < samples48kHz.length; i += 3) {
        if (j < targetLength) {
            samples16kHz[j++] = samples48kHz[i];
        }
    }

    // Return as a Buffer
    return Buffer.from(samples16kHz.buffer);
}

function startGeminiLiveSession(clientWs) {
  let ready = false;
  const GEMINI_LIVE_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`;

  const geminiWs = new WebSocket(GEMINI_LIVE_URL);

  geminiWs.on("open", () => {
    console.log("✅ Connected to Gemini Live API");

    // 1. REQUIRED: Send BidiGenerateContentSetup message
    geminiWs.send(
      JSON.stringify({
        setup: {
          model: "models/gemini-2.5-flash",//"models/gemini-2.5-flash-native-audio-preview-12-2025",
          input_audio_transcription: true,
          response_modalities: ["TEXT"],
          language_code: "en-US", // Good practice to include
          audio_config: {
            audio_encoding: "LINEAR16",
            sample_rate_hz: 16000, // Matching your client's reported rate
          },
        },
      })
    );

    // 2. CRITICAL: Send BidiGenerateContentClientContent message
    // This starts the conversational "turn" where the audio input will be placed.
    geminiWs.send(
      JSON.stringify({
        content: {
          role: "user", 
          parts: [{ text: "" }], // <--- CHANGE THIS: Explicitly use a text part
        },
      })
    );

    // Set ready to true immediately after the initial messages are sent
    ready = true;
    console.log("🎧 Gemini Live ready to receive audio");
  });

  // ... (message, error, close handlers are the same)
  // NEW geminiWs.on("message", ...) handler
  geminiWs.on("message", (msg) => {
    const msgString = msg.toString();

    // Check for the GoAway message or unparsable error
    try {
      const data = JSON.parse(msgString);

      // The server often sends a final GO_AWAY message when closing due to an error.
      if (data.goAway) {
        console.error(
          "❌ RECEIVED GO_AWAY (Server Error Signal) from Gemini Live API:",
          JSON.stringify(data.goAway, null, 2)
        );
        // We should not proceed with parsing transcription data if we got a GoAway
        return;
      }

      const transcription = data?.response?.server_content?.input_transcription;

      if (transcription?.text) {
        clientWs.send(
          JSON.stringify({
            type: transcription.is_final ? "final" : "partial",
            text: transcription.text,
          })
        );
      }
    } catch (e) {
      // This catches cases where the server sends a simple error string, not JSON
      console.error(
        "❌ Non-JSON or unparsable message received from Gemini Live:",
        msgString
      );
    }
  });

  geminiWs.on("error", (err) => {
    console.error("❌ Gemini Live error:", err);
  });

  geminiWs.on("close", () => {
    console.log("❌ Gemini Live connection closed");
  });

  return {
    sendAudioChunk(pcmBuffer) {
      if (ready && geminiWs.readyState === WebSocket.OPEN) {

        const resampledBuffer = resample48to16(pcmBuffer);

        geminiWs.send(
          JSON.stringify({
            realtime_input: {
              audio: {
                mime_type: "audio/pcm;rate=16000", // Matching your client's reported rate
                data: resampledBuffer.toString("base64"),
              },
            },
          })
        );
      }
    },
    close() {
      geminiWs.close();
    },
  };
}
/*function startGeminiLiveSession(clientWs) {
  let ready = false;

  const GEMINI_LIVE_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`;

  const geminiWs = new WebSocket(GEMINI_LIVE_URL);

  geminiWs.on("open", () => {
    console.log("✅ Connected to Gemini Live API");

    geminiWs.send(
      JSON.stringify({
        setup: {
          model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
          input_audio_transcription: true,
          response_modalities: ["TEXT"],
          language_code: "en-US", // 👈 add this (recommended)
          audio_config: {
            audio_encoding: "LINEAR16",
            sample_rate_hz: 16000,
          },
        },
      })
    );
  });

  geminiWs.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    const transcription = data?.response?.server_content?.input_transcription;

    if (transcription?.text) {
      clientWs.send(
        JSON.stringify({
          type: transcription.is_final ? "final" : "partial",
          text: transcription.text,
        })
      );
    }
  });

  geminiWs.on("error", (err) => {
    console.error("❌ Gemini Live error:", err);
  });

  geminiWs.on("close", () => {
    console.log("❌ Gemini Live connection closed");
  });

  return {
    sendAudioChunk(pcmBuffer) {
      // 👇 THIS IS THE KEY CHANGE
      if (ready && geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(
          JSON.stringify({
            realtime_input: {
              audio: {
                mime_type: "audio/pcm;rate=16000",
                data: Buffer.from(pcmBuffer).toString("base64"),
              },
            },
          })
        );
      }
    },
    close() {
      geminiWs.close();
    },
  };
}*/

app.get("/get/equalizer", (req, res) => {
  console.log("Inside the get equalizer route");
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
console.log("WebSocket server initialized");

wss.on("connection", (ws, req) => {
  console.log("WebSocket client connected:", req.url);

  let geminiSession = null;

  ws.on("message", (data, isBinary) => {
    // METADATA (JSON)
    if (!isBinary) {
      const msg = JSON.parse(data.toString());

      if (msg.type === "meta") {
        console.log("Received audio metadata:", msg);

        // 🔥 START GEMINI LIVE SESSION HERE
        geminiSession = startGeminiLiveSession(ws);
      }
      return;
    }

    // AUDIO CHUNKS (PCM16)
    if (isBinary && geminiSession) {
      geminiSession.sendAudioChunk(data);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    if (geminiSession) geminiSession.close();
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

server.listen(port, () => {
  console.log("The HTTP + WebSocket Server is running at: ", port);
});
