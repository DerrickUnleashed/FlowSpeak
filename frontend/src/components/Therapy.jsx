import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Therapy.css';

const THERAPY_TEXT = "It was a bright, sunny morning when Jack and his family decided to visit the zoo. Jack had been looking forward to this day for weeks. He loved animals and was excited to see them up close. His mom packed a picnic lunch, and they all got into the car to drive to the zoo. When they arrived, Jack could see many people already walking around. The zoo was full of families, children, and even some school groups. The first stop was the lion exhibit. Jack could hear the lions roaring from a distance. As they got closer, he saw the large, powerful animals resting in the shade. He was amazed at how big they were. Next, they went to see the monkeys. The monkeys were jumping from tree to tree and making funny noises. Jack laughed as he watched them swing around so easily. His little sister, Emma, pointed at the baby monkey and said it was the cutest thing she had ever seen. After the monkeys, Jack and his family walked to the elephant enclosure. The elephants were eating leaves and using their trunks to grab food. Jack was fascinated by how long their trunks were and how gently they ate. He thought the elephants looked very wise. Later, they visited the penguin exhibit. The penguins were swimming in the water and waddling on the ground. Jack liked how fast they could swim, and he watched them slide on their bellies with excitement. At the end of the day, Jack and his family sat on a bench and ate their lunch. They talked about their favorite animals. Jack couldn’t wait to tell his friends about his visit to the zoo.";

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5];

const Therapy = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [autoHighlightSpeed, setAutoHighlightSpeed] = useState(150);
  const [isAutoHighlighting, setIsAutoHighlighting] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const wavesCanvasRef = useRef(null);
  const textContainerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastRecognizedIndexRef = useRef(0);
  const currentTranscriptRef = useRef('');
  const processingTimeoutRef = useRef(null);
  const textLowerCaseRef = useRef(THERAPY_TEXT.toLowerCase());

  const scrollToHighlight = useCallback((position) => {
    const container = textContainerRef.current;
    if (!container) return;
    const approximate = (position / THERAPY_TEXT.length) * container.scrollHeight;
    container.scrollTop = Math.max(0, approximate - container.clientHeight / 2);
  }, []);

  const findAndHighlightMatch = useCallback((searchWords) => {
    if (!searchWords || searchWords.length === 0) return;
    const textLower = textLowerCaseRef.current;
    const startPosition = Math.max(0, lastRecognizedIndexRef.current);
    const lastWord = searchWords[searchWords.length - 1];
    if (!lastWord || lastWord.length < 3) return;

    let searchPos = startPosition;
    while ((searchPos = textLower.indexOf(lastWord, searchPos)) !== -1) {
      const before = searchPos === 0 || !/[a-z0-9]/i.test(textLower[searchPos - 1]);
      const after = searchPos + lastWord.length >= textLower.length
        || !/[a-z0-9]/i.test(textLower[searchPos + lastWord.length]);
      if (before && after && searchPos > startPosition) {
        const bestMatchPos = searchPos + lastWord.length;
        lastRecognizedIndexRef.current = bestMatchPos;
        setHighlightPosition(bestMatchPos);
        scrollToHighlight(bestMatchPos);
        break;
      }
      searchPos += lastWord.length;
    }
  }, [scrollToHighlight]);

  const handleSpeechResult = useCallback((event) => {
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    let interim = '';
    let final = currentTranscriptRef.current;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += ` ${transcript}`;
        const words = final.toLowerCase().trim().split(/\s+/);
        findAndHighlightMatch(words.slice(Math.max(0, words.length - 5)));
      } else {
        interim += transcript;
        processingTimeoutRef.current = setTimeout(() => {
          const words = `${final} ${interim}`.toLowerCase().trim().split(/\s+/);
          findAndHighlightMatch(words.slice(Math.max(0, words.length - 5)));
        }, 50);
      }
    }
    currentTranscriptRef.current = final;
  }, [findAndHighlightMatch]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition unsupported. Use Chrome or Edge.');
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = handleSpeechResult;
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') setError('Microphone access is required for speech recognition.');
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [handleSpeechResult]);

  useEffect(() => {
    const resize = () => {
      if (wavesCanvasRef.current) wavesCanvasRef.current.width = window.innerWidth;
      if (canvasRef.current) { canvasRef.current.width = 96; canvasRef.current.height = 96; }
      if (wavesCanvasRef.current) wavesCanvasRef.current.height = 160;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isAutoHighlighting) return;
    const interval = setInterval(() => {
      setHighlightPosition((prev) => {
        const next = prev + 1;
        if (next >= THERAPY_TEXT.length) {
          setIsAutoHighlighting(false);
          return prev;
        }
        scrollToHighlight(next);
        return next;
      });
    }, 60000 / autoHighlightSpeed);
    return () => clearInterval(interval);
  }, [isAutoHighlighting, autoHighlightSpeed, scrollToHighlight]);

  const startVisualization = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const wavesCanvas = wavesCanvasRef.current;
    if (!analyser || !canvas || !wavesCanvas) return;

    const ctx = canvas.getContext('2d');
    const wavesCtx = wavesCanvas.getContext('2d');
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      wavesCtx.clearRect(0, 0, wavesCanvas.width, wavesCanvas.height);

      let sum = 0;
      const sample = Math.min(dataArray.length, 32);
      for (let i = 0; i < sample; i++) sum += dataArray[i * Math.floor(dataArray.length / sample)];
      const amplitude = Math.max(4, (sum / sample) * 0.5);
      const time = Date.now() * 0.001;

      for (let w = 0; w < 3; w++) {
        wavesCtx.beginPath();
        wavesCtx.moveTo(0, wavesCanvas.height / 2);
        const factor = 1 - w * 0.25;
        for (let x = 0; x < wavesCanvas.width; x += 8) {
          const y = Math.sin(x * 0.01 + time * (w + 1) * 0.5) * amplitude * factor
            + Math.sin(x * 0.02 - time * (w + 1) * 0.7) * amplitude * factor * 0.5
            + wavesCanvas.height / 2;
          wavesCtx.lineTo(x, y);
        }
        const gradient = wavesCtx.createLinearGradient(0, 0, wavesCanvas.width, 0);
        gradient.addColorStop(0, 'rgba(8, 253, 216, .3)');
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, .5)');
        gradient.addColorStop(1, 'rgba(214, 255, 63, .3)');
        wavesCtx.strokeStyle = gradient;
        wavesCtx.lineWidth = 2;
        wavesCtx.stroke();
      }

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(243, 241, 234, .16)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * (0.75 + amplitude / 220), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8, 253, 216, .6)';
      ctx.fill();
    };
    render();
  }, []);

  const toggleRecording = async () => {
    if (isAutoHighlighting) setIsAutoHighlighting(false);
    if (!isRecording) {
      try {
        setError('');
        setHighlightPosition(0);
        lastRecognizedIndexRef.current = 0;
        currentTranscriptRef.current = '';
        setCurrentTime(0);
        let seconds = 0;
        timerRef.current = setInterval(() => { seconds += 1; setCurrentTime(seconds); }, 1000);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
        });
        mediaStreamRef.current = stream;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;
        startVisualization();
        if (recognitionRef.current) recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setError('Microphone access denied. Please allow access and retry.');
        clearInterval(timerRef.current);
      }
    } else {
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
      cancelAnimationFrame(animationFrameRef.current);
      clearInterval(timerRef.current);
      clearTimeout(processingTimeoutRef.current);
      setIsRecording(false);
    }
  };

  const toggleAutoHighlight = () => {
    if (isRecording) toggleRecording();
    if (!isAutoHighlighting) setHighlightPosition(0);
    setIsAutoHighlighting((prev) => !prev);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const renderText = () => (
    <div className="therapy-text" ref={textContainerRef}>
      <p>
        <span className="therapy-spoken">{THERAPY_TEXT.slice(0, highlightPosition)}</span>
        <span className="therapy-unspoken">{THERAPY_TEXT.slice(highlightPosition)}</span>
      </p>
    </div>
  );

  return (
    <div className="therapy">
      <canvas ref={wavesCanvasRef} className="therapy-waves" aria-hidden="true" />
      <div className="container therapy-inner">
        <header className="therapy-head">
          <p className="eyebrow">Therapy / Pacing Lab</p>
          <h1 className="display therapy-title">Read in rhythm</h1>
          <p className="lead">Follow the highlight, or speak along. The lab moves with your pace.</p>
        </header>

        {error && <p className="therapy-error" role="alert">{error}</p>}

        <div className="therapy-reader">{renderText()}</div>

        <div className="therapy-pace">
          <span className="therapy-pace-label">Auto-highlight · {autoHighlightSpeed} CPM</span>
          <div className="therapy-pace-controls">
            <button
              type="button"
              className="therapy-icon-btn"
              onClick={() => setAutoHighlightSpeed((v) => Math.max(50, v - 25))}
              disabled={autoHighlightSpeed <= 50}
              aria-label="Decrease highlight speed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <button
              type="button"
              className={`therapy-pace-btn ${isAutoHighlighting ? 'is-active' : ''}`}
              onClick={toggleAutoHighlight}
              aria-pressed={isAutoHighlighting}
            >
              {isAutoHighlighting ? 'Pause' : 'Auto-highlight'}
            </button>
            <button
              type="button"
              className="therapy-icon-btn"
              onClick={() => setAutoHighlightSpeed((v) => Math.min(500, v + 25))}
              disabled={autoHighlightSpeed >= 500}
              aria-label="Increase highlight speed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        <div className="therapy-controls">
          <span className="therapy-time">{formatTime(currentTime)}</span>
          <button
            type="button"
            className={`therapy-record ${isRecording ? 'is-recording' : ''}`}
            onClick={toggleRecording}
            aria-pressed={isRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <canvas ref={canvasRef} className="therapy-visualizer" aria-hidden="true" />
            <svg className="therapy-record-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {isRecording
                ? <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" />
                : <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />}
            </svg>
          </button>
          <button
            type="button"
            className="therapy-speed"
            onClick={() => setPlaybackSpeed(SPEEDS[(SPEEDS.indexOf(playbackSpeed) + 1) % SPEEDS.length])}
            aria-label={`Playback speed ${playbackSpeed}x, click to change`}
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
};

export default Therapy;
