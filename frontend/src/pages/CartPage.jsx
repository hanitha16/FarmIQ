import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';

export const CartPage = ({ onNavigate }) => {
  const { cart, updateCartQuantity, removeFromCart, totalCartCount, cartSubtotal } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button
            onClick={() => onNavigate('seeds')}
            className="btn-secondary"
            style={{ marginBottom: '12px', fontSize: '0.88rem', padding: '6px 14px' }}
          >
            <ArrowLeft size={16} /> Back to Seed Hub
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🛒 Shopping Cart ({totalCartCount} {totalCartCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <button
          onClick={() => onNavigate('seeds')}
          className="btn-secondary"
        >
          Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <GlassCard style={{ padding: '60px 24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.95)' }}>
          <div style={{
            background: '#f0fdf4',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <ShoppingCart size={40} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Your cart is empty
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px' }}>
            Add certified seed varieties from the Seed Hub to start your order.
          </p>
          <PrimaryButton onClick={() => onNavigate('seeds')} style={{ padding: '12px 28px' }}>
            Browse Seeds
          </PrimaryButton>
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Cart Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map((item) => (
              <GlassCard key={item.id} style={{ padding: '20px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '10px' }}>
                        🌾 {item.crop}
                      </span>
                      {item.is_demo ? (
                        <span className="badge-demo" style={{ fontSize: '0.75rem' }}>🟠 Demo Product</span>
                      ) : (
                        <span className="badge-live" style={{ fontSize: '0.75rem' }}>✓ Certified</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                      {item.name}
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                      Pack Size: <strong>{item.pack_size}</strong> • Variety: {item.type}
                    </div>

                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#059669', marginTop: '8px' }}>
                      ₹{item.price} <span style={{ fontSize: '0.82rem', fontWeight: '500', color: '#64748b' }}>per pack</span>
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 8px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        style={{
                          background: item.quantity <= 1 ? '#e2e8f0' : '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Minus size={14} color="#0f172a" />
                      </button>

                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        style={{
                          background: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} color="#0f172a" />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '14px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#334155' }}>
                  <span>Item Subtotal ({item.quantity} × ₹{item.price}):</span>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Cart Summary Panel */}
          <div>
            <GlassCard style={{ padding: '24px', background: '#ffffff', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', pb: '10px' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', color: '#475569', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Items:</span>
                  <strong style={{ color: '#0f172a' }}>{totalCartCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charge:</span>
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>FREE Delivery</span>
                </div>
              </div>

              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Estimated Total:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#16a34a' }}>₹{cartSubtotal}</span>
              </div>

              <PrimaryButton style={{ width: '100%', padding: '14px', fontSize: '1rem' }} onClick={() => alert("Order inquiry placed! Certified seed dealer will contact you for delivery.")}>
                Proceed to Dealer Checkout
              </PrimaryButton>

              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color="#16a34a" /> 100% Certified Seed Dealer Fulfillment
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
