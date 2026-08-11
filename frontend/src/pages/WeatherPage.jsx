import React, { useState, useEffect } from 'react';
import { CloudSun, Search, MapPin, Droplet, Wind, Thermometer, Zap, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WeatherPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.village || 'Guntur');
  const [searchInput, setSearchInput] = useState(user?.village || 'Guntur');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWeatherData = async (loc) => {
    setLoading(true);
    try {
      const [resW, resF] = await Promise.all([
        fetch(`/api/weather?location=${encodeURIComponent(loc)}`),
        fetch(`/api/weather/forecast?location=${encodeURIComponent(loc)}`)
      ]);

      if (resW.ok) {
        const dataW = await resW.json();
        setWeather(dataW);
      }
      if (resF.ok) {
        const dataF = await resF.json();
        setForecast(dataF.forecast || []);
      }
    } catch (err) {
      console.error("Error loading weather data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(location);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header & Location Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CloudSun size={28} color="#0284c7" /> Weather Intelligence & Act Now
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
            Hyper-local weather metrics, 7-day forecast & dynamic spraying/field work score.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search Village/City..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', width: '220px', fontSize: '0.9rem' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '10px 16px', fontSize: '0.9rem' }}>
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {weather?.demo_mode && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '10px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🟠 Limited Connectivity - Showing local demo weather data for {weather.location}
        </div>
      )}

      {/* Main Weather Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Temp Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #ffffff, #f0f9ff)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>Temperature</span>
            <Thermometer size={22} color="#0284c7" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', margin: '8px 0' }}>
            {weather?.temp || 29.5}°C
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0284c7' }}>
            Condition: {weather?.condition || 'Partly Cloudy'}
          </div>
        </div>

        {/* Humidity Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #ffffff, #f0fdf4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>Humidity</span>
            <Droplet size={22} color="#16a34a" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', margin: '8px 0' }}>
            {weather?.humidity || 62}%
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#16a34a' }}>
            Moisture: Optimal Range
          </div>
        </div>

        {/* Rain Probability Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #ffffff, #fefce8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>Rain Probability</span>
            <CloudSun size={22} color="#ca8a04" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', margin: '8px 0' }}>
            {weather?.rain_prob || 18}%
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ca8a04' }}>
            Precipitation Risk: Low
          </div>
        </div>

        {/* Wind Speed Card */}
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #ffffff, #f5f3ff)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>Wind Speed</span>
            <Wind size={22} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', margin: '8px 0' }}>
            {weather?.wind_speed || 9.4} <span style={{ fontSize: '1.2rem' }}>km/h</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#7c3aed' }}>
            Breeze: Calm for Spraying
          </div>
        </div>
      </div>

      {/* Act Now Score Panel */}
      <div className="glass-panel" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, #064e3b, #047857)',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', color: '#84cc16' }}>
              ⚡ DYNAMIC CALCULATION ENGINE
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '8px' }}>
              Act Now Score: {weather?.act_now_score || 87} / 100
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '4px', maxWidth: '650px' }}>
              <strong>Status:</strong> 🟢 {weather?.act_now_status || 'GOOD TIME TO ACT'} — {weather?.act_now_rationale}
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
              Best Action Window
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#84cc16', marginTop: '2px' }}>
              {weather?.best_action_window || 'Tomorrow • 7:00 AM – 10:00 AM'}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Cards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          📅 7-Day Weather & Farm Work Forecast
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
          {forecast.map((day, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{day.day}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a', margin: '6px 0' }}>
                {day.temp}°C
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{day.condition}</div>
              <div style={{ fontSize: '0.78rem', color: '#ca8a04', fontWeight: '600', marginTop: '4px' }}>
                🌧️ {day.rain_prob}% Rain
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                {day.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
