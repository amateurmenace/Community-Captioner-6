
# Community Captioner (v6.0)

**An Open Source AI Captioning Platform for Community Media**

Community Captioner is a live transcription tool designed for local government meetings, public access TV stations, and community organizations. It bridges the gap between expensive hardware encoders and accessible, accurate subtitles by leveraging modern AI.

## Key Features

### 🎙️ 1. Multi-Mode Resilience
The system is designed to work in any infrastructure environment with built-in protections against browser throttling:
*   **Balanced Mode**: Uses the browser's built-in Web Speech API. Zero cost, requires no API keys.
*   **Local Mode (Privacy First)**: Connects to a local **Whisper.cpp** server. Ensures no audio data leaves your network.
*   **Cloud Mode**: Connects to the **Google Gemini Live API** for state-of-the-art accuracy.
*   **Resilience Protocol**: Uses **Wake Lock API** and a **PiP Monitor** (Picture-in-Picture) trick to keep the audio engine running at high priority even when the tab is in the background.

### 📱 2. Audience View (New!)
Stream transcripts directly to attendees' mobile phones in real-time.
*   **QR Code Generation**: Instantly generate a scan code for the room.
*   **Relay Server**: Includes a lightweight WebSocket relay (`server/relay.js`) to broadcast captions over the internet without WebRTC complexity.
*   **Mobile Optimized**: A clean, read-only interface for following along on small screens.

### 🎬 3. Highlight Studio (New!)
Turn long meetings into social media content instantly.
*   **Real-time Clipping**: Mark interesting quotes during the live session.
*   **In-Browser Video Editing**: Uses **FFmpeg WASM** to slice video files directly in the browser. No uploads required.
*   **Social Crop**: Automatically crops landscape video to 9:16 vertical format for TikTok/Reels.

### 🧠 4. Context Engine & Intelligence
*   **Knowledge Graph**: Define custom dictionaries to correct local proper nouns (e.g., "Smythe" vs "Smith").
*   **AI Scraper**: Uses Gemini to "read" municipal agendas and minutes to automatically build correction rules.
*   **Local LLM Support**: Connect to **Ollama (Llama 3)** running locally to generate summaries and key highlights without sending data to the cloud.

### 📺 5. Output Flexibility
*   **Browser Overlay**: A chroma-keyable transparent window for OBS/vMix.
*   **Visual Designer**: Adjust font, size, position, and colors live.
*   **Docs Export**: One-click export of transcripts to Google Docs with timestamps.

---

## Deployment & Setup

### Prerequisites
*   Node.js (v18+)
*   Modern Browser (Chrome/Edge recommended)
*   (Optional) Google Gemini API Key for Cloud features
*   (Optional) FFmpeg capable browser for Video Studio

### Installation
1.  **Start the dev server**:
    ```bash
    npm install
    npm run dev
    ```
2.  **Access the App**:
    *   Open `http://localhost:5173`

### Setting up the Audience Relay
To enable the QR Code feature for remote/mobile viewers:

1.  Open a new terminal.
2.  Run the relay server:
    ```bash
    npm install ws
    node server/relay.js
    ```
3.  (Optional) To allow access outside your local WiFi, use ngrok:
    ```bash
    ngrok http 8080
    ```
    Then paste the `wss://...` URL into the Dashboard settings.

---

## Roadmap: What's Next?

We are constantly evolving to meet the needs of public access television. Here is what is coming in v7:

### 1. Visual Speaker Diarization (Multimodal AI)
Instead of just listening, the AI will *watch* the video feed. By clicking on a face in the dashboard, you can tag "Councilor Smith". The system will use Vision-Language models to re-identify them whenever they speak again, automatically assigning speaker labels based on visual presence.

### 2. AI Fact Checker
A secondary agent that listens to the transcript in real-time and cross-references claims against uploaded PDF documents (budgets, bylaws). If a speaker cites a figure, a "Context Card" pops up on the operator dashboard verifying the number.

### 3. Automated Meeting Minutes
Moving beyond simple summaries, we are fine-tuning a model to generate formal **Robert's Rules of Order** style minutes automatically—detecting motions, seconds, votes, and action items, formatted as a PDF ready for the clerk's office.

### 4. "Applause" Stream
Allow Audience View users to send non-verbal feedback (hearts, applause, "slow down") that appears as floating reactions on the broadcaster's dashboard, enabling civic engagement without audio disruption.

### 5. Burn-in Captions
Currently, the Highlight Studio creates video clips. The next iteration will use FFmpeg WASM to physically burn the captions into the video pixel data, with customizable styling, rendering the final MP4 ready for immediate upload to social platforms.

---

## License
Open Source (CC BY-NC-SA 4.0)
Designed by Stephen Walter + AI for the weirdmachine.org community project.
