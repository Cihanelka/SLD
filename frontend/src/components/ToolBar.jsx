import React from 'react';

export default function Toolbar({ onAddNode, onAddEdge }) {
  return (
    <aside className="toolbar toolbar-modern">
      <h3 className="toolbar-title toolbar-red">Çizim Araçları</h3>
      <div className="toolbar-btn-stack">
        <button className="toolbar-btn adp toolbar-red-text" onClick={() => onAddNode('ADP')}>
          ADP Node Ekle
        </button>
        <button className="toolbar-btn invertor toolbar-red-text" onClick={() => onAddNode('Inv')}>
          Inv Node Ekle
        </button>
        <button className="toolbar-btn busbar toolbar-red-text" onClick={() => onAddNode('Busbar')}>
          Busbar Node Ekle
        </button>
        <button className="toolbar-btn meter toolbar-red-text" onClick={() => onAddNode('Meter')}>
          Meter Ekle
        </button>
      </div>
    </aside>
  );
}
