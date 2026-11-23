import React, { useState, useRef, useEffect, useCallback } from 'react';
import './StutterHelp.css';

const STUTTER_TYPES = [
  { type: 'Block', details: 'Momentary inability to produce sound, marked by tension and struggle.' },
  { type: 'Prolongation', details: 'Abnormal lengthening of sounds, like “ssssssomething”.' },
  { type: 'Interjection', details: 'Extra sounds or words, like “um”, “uh”, or “like”.' },
  { type: 'Sound Repeat', details: 'Repetition of individual sounds, like “c-c-cat”.' },
  { type: 'Word Repeat', details: 'Repetition of entire words, like “I-I-I want”.' },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500';

const StutterHelp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [combinations, setCombinations] = useState({});
  const [addedWords, setAddedWords] = useState({});
  const [stutterType, setStutterType] = useState('');
  const [stutterDetails, setStutterDetails] = useState('');
  const [error, setError] = useState('');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const canvasRef = useRef(null);
  const wavesCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const sendToBackend = useCallback(async (text) => {
    try {
      const response = await fetch(`${API_BASE}/api/process-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speech: text }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.top1_words || []);
        setCombinations(data.combinations || {});
      }
    } catch (err) {
      console.error('Error sending to backend:', err);
    }
  }, []);

  const generateStutterType = useCallback(() => {
    const selected = STUTTER_TYPES[Math.floor(Math.random() * STUTTER_TYPES.length)];
    setStutterType(selected.type);
    setStutterDetails(selected.details);
  }, []);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition unsupported. Use Chrome or Edge.');
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
          sendToBackend(final);
          generateStutterType();
        } else {
          interim += text;
        }
      }
      setTranscribedText(final || interim);
      setAddedWords({});
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') setError('Microphone access is required for speech recognition.');
    };
    recognitionRef.current = recognition;

    return () => {
      if (recognitionActiveRef.current) recognition.stop();
      recognitionRef.current = null;
    };
  }, [sendToBackend, generateStutterType]);

  useEffect(() => {
    const resize = () => {
      if (wavesCanvasRef.current) wavesCanvasRef.current.width = window.innerWidth;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startVisualization = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const wavesCanvas = wavesCanvasRef.current;
    if (!analyser || !canvas || !wavesCanvas) return;

    canvas.width = 300;
    canvas.height = 300;
    wavesCanvas.width = window.innerWidth;
    wavesCanvas.height = 240;

    const ctx = canvas.getContext('2d');
    const wavesCtx = wavesCanvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 12;

    const drawWaves = () => {
      const time = Date.now() * 0.001;
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const amplitude = Math.max(4, (sum / dataArray.length) * 0.45);
      wavesCtx.clearRect(0, 0, wavesCanvas.width, wavesCanvas.height);
      for (let w = 0; w < 3; w++) {
        wavesCtx.beginPath();
        wavesCtx.moveTo(0, wavesCanvas.height / 2);
        const factor = 1 - w * 0.25;
        for (let x = 0; x < wavesCanvas.width; x += 6) {
          const y = Math.sin(x * 0.01 + time * (w + 1) * 0.5) * amplitude * factor
            + Math.sin(x * 0.02 - time * (w + 1) * 0.7) * amplitude * factor * 0.5
            + wavesCanvas.height / 2;
          wavesCtx.lineTo(x, y);
        }
        const gradient = wavesCtx.createLinearGradient(0, 0, wavesCanvas.width, 0);
        gradient.addColorStop(0, 'rgba(8, 253, 216, .25)');
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, .45)');
        gradient.addColorStop(1, 'rgba(214, 255, 63, .25)');
        wavesCtx.strokeStyle = gradient;
        wavesCtx.lineWidth = 2;
        wavesCtx.stroke();
      }
    };

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(243, 241, 234, .12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const barWidth = (Math.PI * 2) / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        const angle = i * barWidth;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);
        const hue = (i / bufferLength) * 180 + 160;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `hsla(${hue}, 90%, 60%, .85)`;
        ctx.stroke();
      }
      drawWaves();
    };
    render();
  }, []);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        setError('');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;
        startVisualization();
        if (recognitionRef.current) {
          recognitionRef.current.start();
          recognitionActiveRef.current = true;
        }
        setIsRecording(true);
        setStutterType('');
        setStutterDetails('');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setError('Microphone access denied. Please allow access and retry.');
      }
    } else {
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (recognitionRef.current && recognitionActiveRef.current) {
        recognitionRef.current.stop();
        recognitionActiveRef.current = false;
      }
      cancelAnimationFrame(animationFrameRef.current);
      setIsRecording(false);
    }
  };

  const toggleWord = (word) => {
    const isAdded = addedWords[word];
    if (isAdded) {
      setTranscribedText((prev) => prev.replace(new RegExp(`\\s${word}\\b`, 'g'), ''));
      setAddedWords((prev) => ({ ...prev, [word]: false }));
    } else {
      setTranscribedText((prev) => `${prev} ${word}`);
      setAddedWords((prev) => ({ ...prev, [word]: true }));
    }
  };

  const toggleCombination = (prefix, word) => {
    const combination = `${prefix} ${word}`;
    const isAdded = addedWords[combination];
    if (isAdded) {
      setTranscribedText((prev) => prev.replace(new RegExp(`\\s${prefix}\\s${word}\\b`, 'g'), ''));
      setAddedWords((prev) => ({ ...prev, [combination]: false }));
    } else {
      setTranscribedText((prev) => `${prev} ${combination}`);
      setAddedWords((prev) => ({ ...prev, [combination]: true }));
    }
  };

  return (
    <div className="lab">
      <div className="lab-head container">
        <p className="eyebrow">Stutter Lab / Live</p>
        <h1 className="display lab-title">Start detecting stutters</h1>
        <p className="lead">Speak naturally. Watch your speech take shape in real time.</p>
      </div>

      <div className="lab-visual">
        <canvas ref={wavesCanvasRef} className="lab-waves" aria-hidden="true" />
        <div className="lab-visual-core">
          <canvas ref={canvasRef} className="lab-visualizer" aria-hidden="true" />
          <button
            type="button"
            className={`lab-record ${isRecording ? 'is-recording' : ''}`}
            onClick={toggleRecording}
            aria-pressed={isRecording}
          >
            <span className="lab-record-dot" aria-hidden="true" />
            {isRecording ? 'Stop session' : 'Start session'}
          </button>
          <p className="lab-record-status" role="status">
            {isRecording ? 'Listening — speak naturally' : 'Tap to enable microphone'}
          </p>
        </div>
      </div>

      {error && <p className="lab-error container" role="alert">{error}</p>}

      <div className="lab-panels container">
        <section className="lab-panel" aria-labelledby="transcript-title">
          <h2 id="transcript-title" className="lab-panel-title">Speech recognition</h2>
          <div className="lab-transcript" aria-live="polite">
            {transcribedText || <span className="lab-placeholder">Your speech appears here as you speak.</span>}
          </div>
          {stutterType && (
            <div className="lab-stutter">
              <p className="lab-panel-title">Detected pattern</p>
              <span className="lab-stutter-badge">{stutterType}</span>
              <p className="lab-stutter-detail">{stutterDetails}</p>
            </div>
          )}
        </section>

        <section className="lab-panel" aria-labelledby="suggest-title">
          <h2 id="suggest-title" className="lab-panel-title">Suggested words</h2>
          <div className="lab-chip-row">
            {suggestions.length > 0 ? (
              suggestions.map((word, i) => (
                <button
                  type="button"
                  key={`${word}-${i}`}
                  className={`lab-chip ${addedWords[word] ? 'is-added' : ''}`}
                  onClick={() => toggleWord(word)}
                  aria-pressed={Boolean(addedWords[word])}
                >
                  {word}
                </button>
              ))
            ) : (
              <span className="lab-placeholder">No suggestions yet.</span>
            )}
          </div>

          <h2 className="lab-panel-title lab-panel-sub">Word combinations</h2>
          <div className="lab-chip-row">
            {Object.keys(combinations).length > 0 ? (
              Object.entries(combinations).flatMap(([prefix, words]) =>
                words.map((word) => {
                  const combination = `${prefix} ${word}`;
                  return (
                    <button
                      type="button"
                      key={combination}
                      className={`lab-chip lab-chip-alt ${addedWords[combination] ? 'is-added' : ''}`}
                      onClick={() => toggleCombination(prefix, word)}
                      aria-pressed={Boolean(addedWords[combination])}
                    >
                      {combination}
                    </button>
                  );
                })
              )
            ) : (
              <span className="lab-placeholder">No combinations yet.</span>
            )}
          </div>
        </section>
      </div>

      <section className="lab-info container">
        <h2 className="display lab-info-title">How it works</h2>
        <p>Our model analyzes your speech in real time, surfaces disfluency patterns, and offers next-word guidance to help you practice fluency. Tap a suggestion to add it; tap again to remove it.</p>
        <ul className="lab-tips">
          <li>Speak in a quiet space with minimal background noise.</li>
          <li>Stay close to your microphone.</li>
          <li>Keep a natural pace — the lab follows your rhythm.</li>
        </ul>
      </section>
    </div>
  );
};

export default StutterHelp;
