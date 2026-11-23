<div align="center">

<!-- Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2AF598,100:009EFD&height=300&section=header&text=FLOWspeak&fontSize=70&animation=fadeIn&fontAlignY=38&desc=Speech%2C%20in%20Momentum&descAlignY=55&descAlign=50" width="100%" />

<!-- Badges -->
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

FLOWspeak is a real-time speech intelligence prototype that makes disfluency visible, measurable, and trainable. It has two working demo labs: one for live stutter detection and next-word guidance, and one for paced reading therapy.

## Key Features

- **Stutter Help lab (`/stutter-help`)** — browser Web Speech API transcription, live circular audio visualizer, top-word and word-combination suggestions from a BERT fill-mask backend, and a simulated pattern label. Microphone access starts only after a user click.
- **Therapy lab (`/therapy`)** — paced reading with a moving highlight, adjustable auto-highlight speed (CPM), speech-follow highlighting, recording timer, and playback-speed control.

## Tech Stack & Prerequisites

| Layer | Stack |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 6, GSAP 3 + ScrollTrigger, Lenis, Framer Motion |
| Styling | CSS custom properties, no UI framework |
| Backend | Flask 3, Flask-CORS, Hugging Face `transformers`, PyTorch 2.6 |
| Model | `google/bert_uncased_L-12_H-768_A-12` fill-mask, stored in `backend/local_bert/` |

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/DerrickUnleashed/FlowSpeak.git
   cd FlowSpeak
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   python3 setup.py
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

4. **Run the app locally**

   ```
   ./scripts/dev.sh
   ```

### Demos

- [Demo video](https://www.youtube.com/watch?v=LUXPLMexKSI)
- [Setup video](https://www.youtube.com/watch?v=mrcyOX2VKk4)

## Project Structure

```text
FlowSpeak/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── marketing/       # Hero, Nav, Footer, narrative sections
│   │   │   ├── Home.jsx         # Earlier prototype (unused by current routes)
│   │   │   ├── StutterHelp.jsx  # Detection lab (route: /stutter-help)
│   │   │   └── Therapy.jsx      # Pacing lab (route: /therapy)
│   │   ├── content/marketing.js # Landing copy, metrics, links, team
│   │   ├── lib/motion.js        # Lenis + ScrollTrigger setup/cleanup
│   │   ├── pages/MarketingPage.jsx
│   │   └── styles/tokens.css    # Design tokens
│   └── package.json
├── backend/
│   ├── server.py                # Flask app, port 5500
│   ├── router.py                # /api/process-speech
│   ├── setup.py                 # Downloads BERT into local_bert/
│   └── local_bert/              # Bundled model files
├── docs/superpowers/            # Design spec and implementation plan
├── scripts/                     # dev/frontend/backend launchers
└── LICENSE                      # MIT
```

## Contributing

Contributions are welcome. Open an issue or pull request on the [GitHub repository](https://github.com/DerrickUnleashed/Stutter-Detection-and-Therapy). Before submitting, run `npm run lint` and `npm run build` in `frontend/`, and keep the landing page free of functional lab UI — features belong on their own routes.

## License

MIT License. Copyright (c) 2025 WinnersPOV. See [LICENSE](LICENSE) for details.

## Team

Derrick Richard · Tarun Srikumar · Sreenidhi K
