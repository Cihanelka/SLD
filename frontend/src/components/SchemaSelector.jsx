import React, { useState } from 'react';

function SchemaSelector({ schemas, onSchemaSelect, onCreateSchema }) {
  const [showModal, setShowModal] = useState(false);
  const [schemaName, setSchemaName] = useState('');

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div style={{ 
        background: '#fff',
        padding: 48,
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: 400
      }}>
        <h1 style={{ marginBottom: 32, color: '#333', fontSize: 28 }}>Şema Seçin</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {schemas.map(s => (
            <button
              key={s.schema_id}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: '2px solid #1976d2',
                background: '#fff',
                color: '#1976d2',
                fontWeight: 'bold',
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1976d2';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff';
                e.target.style.color = '#1976d2';
              }}
              onClick={() => onSchemaSelect(s)}
            >
              {s.name}
            </button>
          ))}
          <button
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: '2px solid #1976d2',
              background: '#1976d2',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1565c0';
              e.target.style.borderColor = '#1565c0';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#1976d2';
              e.target.style.borderColor = '#1976d2';
            }}
            onClick={() => {
              setShowModal(true);
              setSchemaName('');
            }}
          >
            + Yeni Şema Oluştur
          </button>
        </div>

        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: '0 2px 16px #0002'
              }}
            >
              <h2>Yeni Şema Yarat</h2>
              <input
                type="text"
                placeholder="Şema Adı"
                value={schemaName}
                onChange={e => setSchemaName(e.target.value)}
                style={{ width: '100%', marginBottom: 12, padding: 8 }}
              />
              <button
                onClick={() => {
                  onCreateSchema(schemaName);
                  setShowModal(false);
                }}
                disabled={!schemaName}
                style={{
                  width: '100%',
                  padding: 10,
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 'bold'
                }}
              >
                Oluştur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchemaSelector; 