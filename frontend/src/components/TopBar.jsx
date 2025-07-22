import React from 'react';

// Uygulamanın üst bar bileşeni
export default function Topbar({ schemaName, mode, onModeChange, onSave, onChangeSchema, canSave }) {
  return (
    <div className="topbar topbar-red">
      <span className="topbar-title">{schemaName}</span>
      <div className="topbar-btn-group">
        <button className="topbar-btn" onClick={onChangeSchema}>Şema Değiştir</button>
        <button className={`toolbar-btn topbar-btn${mode === 'edit' ? ' active' : ''}`} onClick={() => onModeChange('edit')}>Edit View</button>
        <button className={`toolbar-btn topbar-btn${mode === 'user' ? ' active' : ''}`} onClick={() => onModeChange('user')}>User View</button>
        <button
          className={`toolbar-btn topbar-btn save${!canSave ? ' save-disabled' : ''}`}
          onClick={onSave}
          disabled={!canSave}
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}
