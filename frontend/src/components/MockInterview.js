import React, { useState, useEffect, useRef } from 'react';
import {FaCode, FaDatabase, FaShieldAlt, FaBrain, FaNetworkWired, FaMicrophone,FaStop, FaCloud, FaCogs, FaRobot, FaLaptop, FaMobile, FaChartBar,FaCheckCircle, FaPencilAlt, FaArrowLeft, FaServer} from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { injectTheme } from './theme';

const MockInterview = () => {
  const [field, setField]       = useState('');
  const [step, setStep]         = useState('select');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [isListening, setIsListening]             = useState(false);
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    injectTheme();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setRecognitionAvailable(true);
  }, []);

  const toggleListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Your browser does not support Speech Recognition'); return; }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onstart   = () => setIsListening(true);
      rec.onresult  = (e) => {
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++)
          if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
        if (final) setAnswer(prev => prev + final);
      };
      rec.onerror   = () => setIsListening(false);
      rec.onend     = () => setIsListening(false);
      recognitionRef.current = rec;
      rec.start();
    }
  };

  const fields = [
    { name: 'Data Science',           icon: <FaBrain /> },
    { name: 'Software Development',   icon: <FaCode /> },
    { name: 'Database Admin',         icon: <FaDatabase /> },
    { name: 'Cyber Security',         icon: <FaShieldAlt /> },
    { name: 'Networking',             icon: <FaNetworkWired /> },
    { name: 'Cloud Computing',        icon: <FaCloud /> },
    { name: 'DevOps',                 icon: <FaCogs /> },
    { name: 'Machine Learning',       icon: <FaRobot /> },
    { name: 'Full Stack Development', icon: <FaLaptop /> },
    { name: 'Frontend Development',   icon: <FaCode /> },
    { name: 'Backend Development',    icon: <FaServer /> },
    { name: 'Mobile Development',     icon: <FaMobile /> },
    { name: 'Data Engineering',       icon: <FaChartBar /> },
    { name: 'QA/Testing',             icon: <FaCheckCircle /> },
    { name: 'Java Developer',         icon: <FaCode /> },
    { name: 'Python Developer',       icon: <FaCode /> },
    { name: 'JavaScript Developer',   icon: <FaCode /> },
    { name: 'UI/UX Design',           icon: <FaPencilAlt /> },
    { name: 'Blockchain Developer',   icon: <FaCode /> },
  ];

  const startInterview = async (selectedField) => {
    setField(selectedField);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/mock-interview', { action: 'get_question', field: selectedField });
      setQuestion(res.data.question);
      setStep('interview');
    } catch {
      alert('Backend error! Make sure the Ollama server and Flask are running.');
    }
    setLoading(false);
  };

  const handleEvaluation = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/mock-interview', { action: 'evaluate', field, question, answer });
      setFeedback(res.data);
      setStep('result');
    } catch {
      alert('Error evaluating answer!');
    }
    setLoading(false);
  };

  const resetInterview = () => {
    if (isListening) recognitionRef.current?.stop();
    setStep('select'); setField(''); setQuestion(''); setAnswer(''); setFeedback(null);
  };

  const scoreColor = (s) => s >= 7 ? '#00e5c8' : s >= 5 ? '#ff9a3c' : '#ff6b6b';

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a" />
      <div className="t-glow t-glow-b" />
      <div className="t-inner">
        {step === 'select' && (
          <>
            <div className="t-header">
              <div>
                <h1 className="t-title">Technical Mock <span>Interview</span></h1>
                <p className="t-subtitle">Select your field to start a specialized AI-driven interview session.</p>
                
              </div>
              <Link to="/dashboard" className="t-back"><FaArrowLeft size={12} /> Back to Dashboard</Link>
            </div>

            {loading ? (
              <div className="t-loading-center">
                <div className="t-spinner t-spinner-accent t-spinner-lg" />
                <span>Loading your interview question…</span>
              </div>
            ) : (
              <div className="t-grid-4">
                {fields.map((f) => (
                  <div key={f.name} className="t-field-card" onClick={() => startInterview(f.name)}>
                    <div className="t-field-icon">{f.icon}</div>
                    <div className="t-field-name">{f.name}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {step === 'interview' && (
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="t-flex-between t-mb2">
              <h1 className="t-title">{field} <span>Interview</span></h1>
              <button className="t-btn t-btn-outline t-btn-sm" onClick={resetInterview}>✕ Exit</button>
            </div>

            <div className="t-card">
              <div className="t-card-title">Interview Question</div>
              <div style={{ background: 'rgba(124,107,255,.08)', border: '1px solid rgba(124,107,255,.25)',
                borderLeft: '4px solid #7c6bff', borderRadius: '12px', padding: '1.25rem 1.5rem',
                color: '#e8e8f0', fontSize: '1.05rem', lineHeight: 1.65 }}>
                {question}
              </div>
            </div>

            <div className="t-card">
              <div className="t-card-title">Your Answer</div>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="t-textarea"
                  rows={7}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder={isListening ? 'Listening…' : 'Provide a detailed technical explanation…'}
                  style={{ paddingBottom: recognitionAvailable ? '3.5rem' : '1rem' }}
                />
                {recognitionAvailable && (
                  <button
                    className={`t-btn t-btn-icon ${isListening ? 't-btn-danger t-listening' : 't-btn-outline'}`}
                    onClick={toggleListening}
                    style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}
                  >
                    {isListening ? <FaStop size={14} /> : <FaMicrophone size={14} />}
                  </button>
                )}
              </div>

              <button
                className="t-btn t-btn-primary t-btn-lg t-mt2"
                onClick={handleEvaluation}
                disabled={loading || !answer || isListening}
              >
                {loading ? <><span className="t-spinner" /> Evaluating…</> : 'Submit Answer'}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && feedback && (
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="t-flex-between t-mb2">
              <h1 className="t-title">Evaluation <span>Result</span></h1>
              <span className="t-badge t-badge-accent">{field}</span>
            </div>

            <div className="t-card t-text-center">
              <div className="t-card-title" style={{ justifyContent: 'center' }}>Your Score</div>
              <div className="t-result-score" style={{
                background: `linear-gradient(135deg,${scoreColor(feedback.score)},#a89fff)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {feedback.score}<span style={{ fontSize: '2rem', opacity: .6 }}>/10</span>
              </div>
              <div className="t-score-bar t-mt">
                <div className="t-score-fill" style={{
                  width: `${feedback.score * 10}%`,
                  background: `linear-gradient(90deg,${scoreColor(feedback.score)},#a89fff)`,
                }} />
              </div>
            </div>

            <div className="t-card">
              <div className="t-card-title">Feedback</div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.75 }}>{feedback.feedback}</p>
            </div>
            {(feedback.ideal_answer || feedback.improved) && (
              <div className="t-card">
                <div className="t-card-title">Ideal Answer</div>
                <div className="t-ideal">
                  <p>{feedback.ideal_answer || feedback.improved}</p>
                </div>
              </div>
            )}

            <div className="t-flex-center t-mt2" style={{ gap: '1rem' }}>
              <button className="t-btn t-btn-outline t-btn-lg" style={{ flex: 1 }} onClick={resetInterview}>
                Try Another Field
              </button>
              <button className="t-btn t-btn-primary t-btn-lg" style={{ flex: 1 }} onClick={() => startInterview(field)}>
                Next Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MockInterview;