import React, { useState, useEffect } from 'react';
import { Calendar, Bell, CheckCircle2, AlertTriangle, Info, Clock, ShieldCheck, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';

export const FarmPlannerPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [plannerCrop, setPlannerCrop] = useState('Rice');
  const [plan, setPlan] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlannerData = async (cropChoice) => {
    setLoading(true);
    try {
      const [resP, resA] = await Promise.all([
        fetch(`/api/farm-plan?crop=${encodeURIComponent(cropChoice)}`),
        fetch('/api/alerts')
      ]);
      if (resP.ok) {
        const dataP = await resP.json();
        setPlan(dataP.plan || []);
      }
      if (resA.ok) {
        const dataA = await resA.json();
        setAlerts(dataA.alerts || []);
      }
    } catch (err) {
      console.error("Error loading planner/alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData(plannerCrop);
  }, [plannerCrop]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header & Independent Crop Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={28} color="#16a34a" /> 7-Day Farm Planner & Smart Alerts
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
            Customized daily farm tasks based on selected crop type, local weather forecast, and AI risk estimates.
          </p>
        </div>

        {/* Independent Farm Planner Crop Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '8px 16px', borderRadius: '14px', border: '1px solid rgba(22, 163, 74, 0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Sprout size={20} color="#16a34a" />
          <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#064e3b' }}>
            Select Crop:
          </label>
          <select
            value={plannerCrop}
            onChange={(e) => setPlannerCrop(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: '700',
              fontSize: '0.95rem',
              color: '#16a34a',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Rice">🌾 Rice (Paddy)</option>
            <option value="Tomato">🍅 Tomato</option>
            <option value="Chilli">🌶️ Chilli</option>
            <option value="Maize">🌽 Maize</option>
            <option value="Cotton">🌿 Cotton</option>
            <option value="Groundnut">🥜 Groundnut</option>
          </select>
        </div>
      </div>

      {/* Grid: 7-Day Plan + Smart Alerts Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* 7-Day Plan Column */}
        <GlassCard style={{ padding: '28px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={22} color="#16a34a" /> Recommended 7-Day Schedule for {plannerCrop}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
            Tailored field operations for {plannerCrop} in {user?.village || 'Guntur'} region.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {plan.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: item.urgency === 'Optimal' ? '#f0fdf4' : '#f8fafc',
                  border: item.urgency === 'Optimal' ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: item.urgency === 'Optimal' ? '#16a34a' : '#0f172a' }}>
                    {item.day}
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: item.urgency === 'Optimal' ? '#16a34a' : '#e2e8f0',
                    color: item.urgency === 'Optimal' ? '#ffffff' : '#475569'
                  }}>
                    {item.status}
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                  {item.task}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                  {item.details}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Smart Alerts Column */}
        <GlassCard style={{ padding: '28px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={22} color="#f59e0b" /> Active Smart Alerts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: alert.severity === 'success' ? '#f0fdf4' : alert.severity === 'warning' ? '#fffbeb' : '#f0f9ff',
                  border: alert.severity === 'success' ? '1px solid #bbf7d0' : alert.severity === 'warning' ? '1px solid #fde68a' : '1px solid #bae6fd'
                }}
              >
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: alert.severity === 'success' ? '#16a34a' : alert.severity === 'warning' ? '#b45309' : '#0369a1' }}>
                  {alert.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '6px', lineHeight: 1.4 }}>
                  {alert.message}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
