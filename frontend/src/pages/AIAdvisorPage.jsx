import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Mic, MicOff, Volume2, Globe, User, RefreshCw, Upload, Image, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { PrimaryButton } from '../components/PrimaryButton';

export const AIAdvisorPage = ({ onNavigate }) => {
  const { user, language, changeLanguage } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.full_name || 'Farmer'}! 👋 I am your FarmIQ AI Agricultural Advisor. Ask any farming question or upload a crop photo for image analysis.`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [attachedImageFile, setAttachedImageFile] = useState(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    "What is wrong with this crop?",
    "Why are my leaves turning yellow?",
    "Can I spray today?",
    "When should I irrigate?",
    "What should I do after heavy rain?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Image Upload Handler with File Type & Size Validation (<10MB)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage("Please upload a JPG, JPEG, PNG or WEBP image up to 10 MB.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Please upload an image smaller than 10 MB.");
        return;
      }

      setErrorMessage('');
      setAttachedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachedImage = () => {
    setAttachedImageFile(null);
    setAttachedImagePreview(null);
    setErrorMessage('');
  };

  const handleSend = async (overrideQuery) => {
    const textQuery = overrideQuery || inputQuery;
    if (!textQuery.trim() && !attachedImageFile && !attachedImagePreview) {
      setErrorMessage("Please type a question or upload a crop image.");
      return;
    }

    setErrorMessage('');
    const userMsg = {
      sender: 'user',
      text: textQuery.trim() || (attachedImagePreview ? "Uploaded crop photo for analysis" : ""),
      imagePreview: attachedImagePreview
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideQuery) setInputQuery('');
    setLoading(true);

    const currentImageFile = attachedImageFile;
    const currentImagePreview = attachedImagePreview;

    try {
      let data;
      if (currentImageFile || currentImagePreview) {
        // Image-Aware AI Vision Endpoint
        const formData = new FormData();
        if (currentImageFile) {
          formData.append('image', currentImageFile);
        } else {
          // Send sample blob
          const blob = await (await fetch(currentImagePreview)).blob();
          formData.append('image', blob, 'crop.jpg');
        }
        formData.append('question', textQuery.trim() || "What is wrong with this crop image?");
        formData.append('language', language);
        formData.append('location', user?.village || 'Guntur');

        const res = await fetch('/api/advisor/image', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Image analysis service failed.');
        }

        data = await res.json();
      } else {
        // Text-only Advisor Endpoint
        const res = await fetch('/api/advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: textQuery.trim(),
            language: language,
            location: user?.village || 'Guntur'
          })
        });

        if (!res.ok) throw new Error('AI Advisor service failed.');
        data = await res.json();
      }

      const botMsg = {
        sender: 'bot',
        text: data.answer
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(data.answer);

    } catch (err) {
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: `Based on your query: Inspect leaf undersides regularly and execute field work during optimal Act Now Score windows (score > 80).`
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Text to Speech playback
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#]/g, '').replace(/\[.*?\]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Speech API Voice Recognition
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by your browser. You can type your question in text chat.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'Telugu' ? 'te-IN' : language === 'Hindi' ? 'hi-IN' : 'en-US';

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsListening(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 140px)' }} className="animate-fade-in">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🤖 Ask FarmIQ AI Advisor
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b' }}>
            Upload any crop photo, ask text or voice questions in English, Telugu, or Hindi.
          </p>
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
          <Globe size={18} color="#16a34a" />
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontWeight: '700', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="English">English</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMessage}
        </div>
      )}

      {/* Suggested Quick Question Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            style={{
              whiteSpace: 'nowrap',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <GlassCard style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '10px'
            }}
          >
            {msg.sender === 'bot' && (
              <div style={{ background: '#16a34a', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                <Bot size={20} />
              </div>
            )}

            <div style={{
              maxWidth: '82%',
              background: msg.sender === 'user' ? 'linear-gradient(135deg, #16a34a, #059669)' : '#f8fafc',
              color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
              padding: '14px 18px',
              borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
              fontSize: '0.95rem',
              lineHeight: 1.55,
              whiteSpace: 'pre-line'
            }}>
              {/* Display Image Preview in Conversation if attached */}
              {msg.imagePreview && (
                <div style={{ marginBottom: '10px' }}>
                  <img
                    src={msg.imagePreview}
                    alt="Uploaded Crop"
                    style={{ maxHeight: '180px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
                  />
                </div>
              )}

              {msg.text}

              {msg.sender === 'bot' && (
                <button
                  onClick={() => speakText(msg.text)}
                  style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '0.82rem', fontWeight: '700' }}
                >
                  <Volume2 size={16} /> Read Aloud
                </button>
              )}
            </div>

            {msg.sender === 'user' && (
              <div style={{ background: '#0f172a', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#16a34a', fontSize: '0.9rem', fontWeight: '600' }}>
            <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> 🧠 FarmIQ is analyzing agricultural context...
          </div>
        )}
        <div ref={chatEndRef} />
      </GlassCard>

      {/* Attached Image Bar (If an image is selected) */}
      {attachedImagePreview && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 16px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={attachedImagePreview} alt="Attached" style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#16a34a', display: 'block' }}>
                Crop Image Attached
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Ask any question or tap Analyze
              </span>
            </div>
          </div>
          <button
            onClick={removeAttachedImage}
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Trash2 size={14} /> Remove Image
          </button>
        </div>
      )}

      {/* Input Row with Image Upload + Voice Mic + Send Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Upload Image Button */}
        <label style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#16a34a',
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '700',
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}>
          <Upload size={18} />
          <span>📷 Photo</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </label>

        {/* Voice Input Button */}
        <button
          onClick={toggleVoiceInput}
          style={{
            background: isListening ? '#ef4444' : '#f0fdf4',
            border: isListening ? 'none' : '1px solid #bbf7d0',
            color: isListening ? '#ffffff' : '#16a34a',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening ? 'Listening...' : '🎤 Speak'}
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          placeholder={attachedImagePreview ? "Ask a question about this crop image..." : `Ask FarmIQ in ${language}...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="form-input"
          style={{ flex: 1, padding: '14px 18px', fontSize: '0.95rem' }}
        />

        {/* Send / Analyze Button */}
        <PrimaryButton onClick={() => handleSend()} style={{ padding: '0 22px', height: '48px' }}>
          <Send size={18} />
        </PrimaryButton>
      </div>
    </div>
  );
};
