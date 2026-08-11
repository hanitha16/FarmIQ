import React, { useState } from 'react';
import { Landmark, BookOpen, ExternalLink, Info, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';

export const LoansKnowledgePage = ({ onNavigate, defaultTab = 'loans' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Official Government Farmer Support Credit Schemes
  const governmentSchemes = [
    {
      id: "kcc",
      title: "Kisan Credit Card (KCC) System",
      institution: "Kisan Rin Portal • Ministry of Agriculture & Farmers Welfare",
      shortDesc: "Access institutional agricultural credit through the Kisan Credit Card system. Eligibility and terms depend on the applicable scheme and lending institution.",
      eligibility: "Farmers, tenant farmers, sharecroppers, and self-help groups with agricultural land titles.",
      officialUrl: "https://www.fasalrin.gov.in/",
      buttonText: "Visit Official KCC Rin Portal",
      goldAccent: true
    },
    {
      id: "pmkisan",
      title: "PM-KISAN Samman Nidhi",
      institution: "Government of India Official Portal",
      shortDesc: "Official Government of India information and farmer services for PM-KISAN financial benefit scheme.",
      eligibility: "Land-holding farmer families across India subject to official scheme criteria.",
      officialUrl: "https://pmkisan.gov.in/",
      buttonText: "Visit Official PM-KISAN Portal",
      goldAccent: true
    },
    {
      id: "aif",
      title: "Agriculture Infrastructure Fund (AIF)",
      institution: "Department of Agriculture & Farmers Welfare",
      shortDesc: "Government financing support for eligible agricultural infrastructure and post-harvest/community farming assets.",
      eligibility: "Primary Agricultural Credit Societies, Agri-entrepreneurs, Farmer Producer Organizations (FPOs).",
      officialUrl: "https://agriinfra.gov.in/",
      buttonText: "Visit Official AIF Portal",
      goldAccent: false
    },
    {
      id: "miss",
      title: "Modified Interest Subvention Scheme (MISS)",
      institution: "NABARD & Reserve Bank of India",
      shortDesc: "Subsidized short-term crop loan interest support for prompt repaying farmers.",
      eligibility: "KCC cardholders obtaining short-term agricultural loans up to ₹3 Lakhs.",
      officialUrl: "https://www.nabard.org/",
      buttonText: "Visit Official NABARD Info",
      goldAccent: false
    }
  ];

  const knowledgeArticles = [
    {
      title: "Preventing Leaf Blast in Paddy Crops",
      category: "Disease Control",
      summary: "Avoid excessive nitrogen application during humid nights. Maintain 2-3cm water level and spray Tricyclazole 75% WP @ 0.6g/L at initial lesion spot appearance."
    },
    {
      title: "Integrated Pest Management for Chilli Thrips",
      category: "Pest Management",
      summary: "Install yellow and blue sticky traps @ 15/acre. Spray neem oil 10,000 ppm during early infestation before chemical foliar spray."
    },
    {
      title: "Water Management During Flowering Stage",
      category: "Irrigation",
      summary: "Critical water sensitivity occurs during panicle initiation and flowering. Avoid field drying during this 15-day window."
    },
    {
      title: "Soil Micro-Nutrient Top Up Guide",
      category: "Soil Health",
      summary: "Apply Zinc Sulphate @ 20 kg/acre every 3 seasons to prevent khaira disease and leaf chlorosis."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          💰 Government Farmer Loans & Knowledge Center
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
          Official Government of India agricultural credit portals, scheme guidance & farming practices.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid rgba(22, 163, 74, 0.15)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('loans')}
          style={{
            background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: '700',
            color: activeTab === 'loans' ? '#16a34a' : '#64748b',
            borderBottom: activeTab === 'loans' ? '3px solid #16a34a' : 'none', cursor: 'pointer'
          }}
        >
          💰 Official Government Financial Support
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          style={{
            background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: '700',
            color: activeTab === 'knowledge' ? '#16a34a' : '#64748b',
            borderBottom: activeTab === 'knowledge' ? '3px solid #16a34a' : 'none', cursor: 'pointer'
          }}
        >
          📚 Farming Knowledge Center
        </button>
      </div>

      {activeTab === 'loans' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Prominent Official Disclaimer Box */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '16px 20px',
            borderRadius: '16px',
            fontSize: '0.9rem',
            color: '#b45309',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Info size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Official Scheme Disclaimer:</strong> FarmIQ provides information and links to official resources. Loan eligibility, interest rates, approval, and benefits depend on the applicable government scheme and lending institution. <strong>FarmIQ does not guarantee loan approval.</strong> Always verify rules directly on official government portals.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
            {governmentSchemes.map((scheme) => (
              <GlassCard
                key={scheme.id}
                style={{
                  padding: '26px',
                  background: '#ffffff',
                  borderTop: scheme.goldAccent ? '4px solid #f59e0b' : '4px solid #16a34a',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: scheme.goldAccent ? '#b45309' : '#064e3b', background: scheme.goldAccent ? '#fef3c7' : '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>
                      🏛️ Official Govt Portal
                    </span>
                    <span style={{ fontSize: '1.2rem' }}>🌾 🏦 💰</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {scheme.title}
                  </h3>

                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>
                    {scheme.institution}
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, marginBottom: '14px' }}>
                    "{scheme.shortDesc}"
                  </p>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
                    <strong>Eligibility Summary:</strong> {scheme.eligibility}
                  </div>
                </div>

                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: scheme.goldAccent ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {scheme.buttonText} <ExternalLink size={16} />
                </a>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {knowledgeArticles.map((art, idx) => (
            <GlassCard key={idx} style={{ padding: '24px', background: '#ffffff' }}>
              <span className="badge-live" style={{ fontSize: '0.78rem', marginBottom: '8px' }}>
                {art.category}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: '6px 0' }}>
                {art.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                {art.summary}
              </p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
