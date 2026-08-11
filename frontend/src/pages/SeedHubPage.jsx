import React, { useState, useEffect } from 'react';
import { Sprout, MapPin, ShoppingBag, Star, Phone, CheckCircle2, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';

export const SeedHubPage = ({ onNavigate }) => {
  const { user, addToCart, totalCartCount } = useAuth();
  const [activeTab, setActiveTab] = useState('online');
  const [shops, setShops] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [addedToast, setAddedToast] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resS, resP] = await Promise.all([
          fetch(`/api/seed-shops?location=${encodeURIComponent(user?.village || 'Guntur')}`),
          fetch('/api/seeds')
        ]);
        if (resS.ok) {
          const dataS = await resS.json();
          setShops(dataS.shops || []);
        }
        if (resP.ok) {
          const dataP = await resP.json();
          setSeeds(dataP.seeds || []);
        }
      } catch (err) {
        console.error("Error loading seed hub data:", err);
      }
    };
    fetchData();
  }, [user]);

  const handleAddToCart = (seed) => {
    addToCart(seed);
    setAddedToast(`Added "${seed.name}" to cart!`);
    setTimeout(() => setAddedToast(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Toast Notification */}
      {addedToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#16a34a',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.4)',
          fontWeight: '700',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000
        }} className="animate-fade-in">
          <Check size={18} /> {addedToast}
        </div>
      )}

      {/* Header Bar with Cart Icon Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🌱 Seed Hub & Certified Varieties
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
            High-yield certified seed varieties & verified local agri dealers.
          </p>
        </div>

        {/* Top Right Cart Button with Counter Badge */}
        <button
          onClick={() => onNavigate('cart')}
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
            position: 'relative'
          }}
        >
          <ShoppingCart size={20} />
          <span>Shopping Cart</span>
          <span style={{
            background: '#ffffff',
            color: '#16a34a',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: '800',
            marginLeft: '4px'
          }}>
            {totalCartCount}
          </span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid rgba(22, 163, 74, 0.15)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('online')}
          style={{
            background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: '700',
            color: activeTab === 'online' ? '#16a34a' : '#64748b',
            borderBottom: activeTab === 'online' ? '3px solid #16a34a' : 'none', cursor: 'pointer'
          }}
        >
          🛒 Local Agri Stores & Certified Seed Varieties
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          style={{
            background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: '700',
            color: activeTab === 'shops' ? '#16a34a' : '#64748b',
            borderBottom: activeTab === 'shops' ? '3px solid #16a34a' : 'none', cursor: 'pointer'
          }}
        >
          📍 Nearby Dealer Locations
        </button>
      </div>

      {/* Tab 1: Certified Seeds Catalog */}
      {activeTab === 'online' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {seeds.map((seed) => (
            <GlassCard key={seed.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>
                    🌾 {seed.crop}
                  </span>
                  <span className="badge-demo" style={{ fontSize: '0.78rem' }}>
                    🟠 Demo Product
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {seed.name}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600', marginBottom: '8px' }}>
                  {seed.type} • Pack Size: {seed.pack_size}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
                  {seed.desc}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>Price</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>₹{seed.price}</span>
                </div>

                <PrimaryButton
                  onClick={() => handleAddToCart(seed)}
                  style={{ padding: '10px 16px', fontSize: '0.88rem' }}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </PrimaryButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab 2: Nearby Dealer Locations */}
      {activeTab === 'shops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="badge-demo" style={{ width: 'fit-content' }}>
            🟠 Demo Shop Data - Verified Local Dealers
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {shops.map((shop) => (
              <GlassCard key={shop.id} style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>{shop.name}</h3>
                  <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.8rem', fontWeight: '700', padding: '4px 8px', borderRadius: '8px' }}>
                    {shop.distance}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <MapPin size={16} color="#94a3b8" /> {shop.address}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.88rem', color: '#eab308', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ★ {shop.rating} / 5.0
                  </span>
                  <a href={`tel:${shop.phone}`} className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '6px 12px' }}>
                    <Phone size={14} /> Call Dealer
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
