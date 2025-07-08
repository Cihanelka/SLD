import React from 'react';
import './App.css';

export default function Toolbar({ onAddNode }) {
  return (
    <aside className="toolbar">
      <button className="toolbar-btn">Çizim Araçları</button>
      <button className="toolbar-btn" onClick={() => onAddNode('ADP')}>Add ADP</button>
      <button className="toolbar-btn" onClick={() => onAddNode('Invertör')}>Add Invertör</button>
    </aside>
  );
}
