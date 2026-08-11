import React, { useState } from 'react';
import { 
  Camera, Upload, Sprout, CheckCircle2, AlertTriangle, Zap, 
  RefreshCw, FileText, ArrowRight, ShieldCheck, Info 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CropScannerPage = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState(user?.main_crop || 'Rice');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const scanningSteps = [
    "Reading crop image...",
    "Identifying crop features...",
    "Checking disease symptoms...",
    "Evaluating weather context...",
    "Calculating risk metrics...",
    "Finding best action window..."
  ];

  // Quick sample images base64 or placeholders
  const sampleCrops = [
    { name: 'Rice', label: 'Rice Leaf Sample', img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTZBMzRBIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIENyb3A8L3RleHQ+PC9zdmc+' },
    { name: 'Tomato', label: 'Tomato Leaf Sample', img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDVOTTY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIENyb3A8L3RleHQ+PC9zdmc+' },
    { name: 'Chilli', label: 'Chilli Leaf Sample', img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDY1RjQ2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIENyb3A8L3RleHQ+PC9zdmc+' },
    { name: 'Maize', label: 'Maize Leaf Sample', img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjODRDQzE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIENyb3A8L3RleHQ+PC9zdmc+' },
    { name: 'Cotton', label: 'Cotton Leaf Sample', img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDY0RTNCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIENyb3A8L3RleHQ+PC9zdmc+' },
    { name: 'Groundnut', label: 'Groundnut Sample', img: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTU4MDNEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIENyb3A8L3RleHQ+PC9zdmc+' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const selectSample = (crop) => {
    setSelectedCrop(crop.name);
    setImagePreview(crop.img);
    setImageFile(null);
    setError('');
  };

  const startAnalysis = async () => {
    if (!imagePreview) {
      setError('Please select or upload a crop photo first.');
      return;
    }

    setScanning(true);
    setAnalysisResult(null);
    setError('');

    // Step-by-step progress animation
    for (let i = 0; i < scanningSteps.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const formData = new FormData();
      formData.append('crop', selectedCrop);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('image_base64', imagePreview);

      const res = await fetch('/api/analyze-crop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to analyze crop image.');
      }

      const data = await res.json();
      setAnalysisResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '12px' }}>
            <Camera size={24} color="#16a34a" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
              📷 AI Crop Health Scanner
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Instant AI disease detection, crop health score & dynamic Act Now recommendation.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Left Column: Crop Selection & Image Upload */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
            1. Select Crop & Provide Image
          </h3>

          {/* Crop Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>
              Select Crop Type:
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="form-input"
              style={{ fontWeight: '600', color: '#16a34a' }}
            >
              <option value="Rice">🌾 Rice (Paddy)</option>
              <option value="Tomato">🍅 Tomato</option>
              <option value="Chilli">🌶️ Chilli</option>
              <option value="Maize">🌽 Maize</option>
              <option value="Cotton">☁️ Cotton</option>
              <option value="Groundnut">🥜 Groundnut</option>
            </select>
          </div>

          {/* Upload Area */}
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '18px',
            padding: '24px',
            textAlign: 'center',
            background: 'rgba(248, 250, 252, 0.7)',
            marginBottom: '20px',
            position: 'relative'
          }}>
            {imagePreview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <img
                  src={imagePreview}
                  alt="Selected Crop"
                  style={{ maxHeight: '200px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={14} /> Replace Photo
                </button>
              </div>
            ) : (
              <div>
                <Upload size={36} color="#16a34a" style={{ marginBottom: '10px' }} />
                <p style={{ fontWeight: '600', fontSize: '0.95rem', color: '#334155' }}>
                  Upload Crop Photo or Take a Picture
                </p>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                  Supports PNG, JPG, JPEG up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {/* Quick Demo Sample Picker */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>
              Or choose a sample crop image:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {sampleCrops.map((c) => (
                <button
                  key={c.name}
                  onClick={() => selectSample(c)}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    border: selectedCrop === c.name ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    background: selectedCrop === c.name ? '#f0fdf4' : '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    color: selectedCrop === c.name ? '#16a34a' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            onClick={startAnalysis}
            disabled={scanning}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            {scanning ? 'Analyzing Crop...' : `Scan ${selectedCrop} Crop`}
          </button>
        </div>

        {/* Right Column: Scanning Animation / Result Output */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {scanning ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="pulse-glow" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16a34a, #84cc16)',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RefreshCw size={36} color="#ffffff" className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                AI Crop Intelligence Active
              </h3>
              <p style={{ fontSize: '1rem', color: '#16a34a', fontWeight: '600', minHeight: '28px' }}>
                {scanningSteps[scanStep]}
              </p>
            </div>
          ) : analysisResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge-demo">
                  {analysisResult.demo_label || '🟠 Demo AI Analysis'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Scan #{analysisResult.id}
                </span>
              </div>

              {/* Diagnosis Header */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' }}>
                  Possible Disease Identified:
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#064e3b', marginTop: '4px' }}>
                  {analysisResult.possible_disease}
                </h3>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.88rem', fontWeight: '600' }}>
                  <span style={{ color: '#059669' }}>🧠 Confidence: {analysisResult.confidence}%</span>
                  <span style={{ color: '#ca8a04' }}>⚠️ Severity: {analysisResult.severity}</span>
                  <span style={{ color: '#2563eb' }}>🌱 Health: {analysisResult.crop_health}%</span>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Identified Symptoms:
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                  {analysisResult.symptoms}
                </p>
              </div>

              {/* Actionable Guidance */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  💡 Actionable Farmer Guidance:
                </h4>
                <div style={{ fontSize: '0.88rem', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                  {analysisResult.guidance}
                </div>
              </div>

              {/* Act Now Score Integration */}
              <div style={{ background: 'linear-gradient(135deg, #064e3b, #047857)', padding: '16px', borderRadius: '14px', color: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#84cc16' }}>⚡ DYNAMIC ACT NOW SCORE</span>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
                      {analysisResult.act_now_score} / 100
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
                    🟢 {analysisResult.act_now_status}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', marginTop: '8px' }}>
                  Best Window: <strong>{analysisResult.action_window}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => onNavigate('history')}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.88rem' }}
                >
                  <FileText size={16} /> View in History
                </button>
                <button
                  onClick={() => onNavigate('advisor')}
                  className="btn-primary"
                  style={{ flex: 1, fontSize: '0.88rem' }}
                >
                  Ask AI Advisor <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <Info size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>
                Select a crop and photo to start AI diagnosis
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                FarmIQ will calculate disease probability, risk levels, and optimal action window.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
