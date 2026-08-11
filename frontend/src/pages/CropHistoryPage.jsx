import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Eye, Calendar, Sprout, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CropHistoryPage = ({ onNavigate }) => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [deleteModalScan, setDeleteModalScan] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crop-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Error fetching crop history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleDelete = async () => {
    if (!deleteModalScan) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/crop-history/${deleteModalScan.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(history.filter(h => h.id !== deleteModalScan.id));
        setDeleteModalScan(null);
      }
    } catch (err) {
      console.error("Error deleting scan:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={28} color="#16a34a" /> Crop Scan History
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
          All saved AI crop health diagnostic records and weather snapshots.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={32} color="#16a34a" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', color: '#64748b' }}>Loading scan history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Sprout size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#334155' }}>No Crop Scans Saved Yet</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px', marginBottom: '20px' }}>
            Take or upload a crop photo using the AI Scanner to store your first scan.
          </p>
          <button onClick={() => onNavigate('scanner')} className="btn-primary">
            Go to AI Crop Scanner
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {history.map((scan) => (
            <div key={scan.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>
                    🌾 {scan.crop}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {new Date(scan.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <img
                    src={scan.image_data}
                    alt={scan.crop}
                    style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', background: '#16a34a' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                      {scan.possible_disease}
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                      Confidence: <strong>{scan.confidence}%</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: '600', marginTop: '2px' }}>
                      Act Now Score: ⚡ {scan.act_now_score}/100
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  onClick={() => setSelectedScan(scan)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => setDeleteModalScan(scan)}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Detail Modal */}
      {selectedScan && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ maxWidth: '540px', width: '100%', padding: '28px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
              {selectedScan.possible_disease}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
              {selectedScan.crop} Crop • Scanned on {new Date(selectedScan.created_at).toLocaleString()}
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
              <img src={selectedScan.image_data} alt="Scan" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Confidence:</strong> {selectedScan.confidence}%</div>
                <div><strong>Severity:</strong> {selectedScan.severity}</div>
                <div><strong>Act Now Score:</strong> ⚡ {selectedScan.act_now_score}/100</div>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSelectedScan(null)}>
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalScan && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>
              Confirm Delete
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
              Are you sure you want to delete scan #{deleteModalScan.id} for {deleteModalScan.crop}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setDeleteModalScan(null)}>Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
              >
                {deleting ? 'Deleting...' : 'Delete Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
