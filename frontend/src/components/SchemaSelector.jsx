import React, { useState, useCallback } from 'react';

function SchemaSelector({ schemas, onSchemaSelect, onCreateSchema }) {
  const [state, setState] = useState({ showModal: false, schemaName: '' });

  const containerStyle = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5'
  };
  const cardStyle = {
    background: '#fff',
    padding: 48,
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    minWidth: 400
  };
  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: 8,
    border: '2px solid #1976d2',
    background: '#fff',
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };
  const primaryButtonStyle = {
    ...buttonStyle,
    background: '#1976d2',
    color: '#fff',
  };
  const dangerButtonStyle = {
    width: '100%',
    padding: 10,
    background: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontWeight: 'bold',
    marginTop: 10
  };
  const modalStyle = {
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
  };
  const modalCardStyle = {
    background: '#fff',
    padding: 32,
    borderRadius: 8,
    minWidth: 320,
    boxShadow: '0 2px 16px #0002'
  };

  const handleSchemaSelect = useCallback((schema) => {
    onSchemaSelect(schema);
  }, [onSchemaSelect]);

  const handleCreateSchema = useCallback(() => {
    onCreateSchema(state.schemaName);
    setState(s => ({ ...s, showModal: false, schemaName: '' }));
  }, [onCreateSchema, state.schemaName]);

  const handleModalOpen = useCallback(() => {
    setState(s => ({ ...s, showModal: true, schemaName: '' }));
  }, []);

  const handleModalClose = useCallback(() => {
    setState(s => ({ ...s, showModal: false }));
  }, []);

  const handleSchemaNameChange = useCallback((e) => {
    setState(s => ({ ...s, schemaName: e.target.value }));
  }, []);

  const renderSchemaButton = (s) => (
    <button
      key={s.schema_id}
      style={buttonStyle}
      onMouseEnter={e => { e.target.style.background = '#1976d2'; e.target.style.color = '#fff'; }}
      onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#1976d2'; }}
      onClick={() => handleSchemaSelect(s)}
    >
      {s.name}
    </button>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: 32, color: '#333', fontSize: 28 }}>Şema Seçin</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {schemas.map(renderSchemaButton)}
          <button
            style={primaryButtonStyle}
            onMouseEnter={e => { e.target.style.background = '#1565c0'; e.target.style.borderColor = '#1565c0'; }}
            onMouseLeave={e => { e.target.style.background = '#1976d2'; e.target.style.borderColor = '#1976d2'; }}
            onClick={handleModalOpen}
          >
            + Yeni Şema Oluştur
          </button>
        </div>
        {state.showModal && (
          <div style={modalStyle}>
            <div style={modalCardStyle}>
              <h2>Yeni Şema Yarat</h2>
              <input
                type="text"
                placeholder="Şema Adı"
                value={state.schemaName}
                onChange={handleSchemaNameChange}
                style={{ width: '100%', marginBottom: 12, padding: 8 }}
              />
              <button
                onClick={handleCreateSchema}
                disabled={!state.schemaName}
                style={{ ...primaryButtonStyle, width: '100%', padding: 10, border: 'none', borderRadius: 4 }}
              >
                Oluştur
              </button>
              <button
                onClick={handleModalClose}
                style={dangerButtonStyle}
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchemaSelector; 