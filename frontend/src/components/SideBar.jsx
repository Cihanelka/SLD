import React from 'react';

export default function Sidebar({ nodes, setNodes, mode }) {
  const nodeList = nodes || [];
  return (
    <div className="sidebar sidebar-modern">
      <h3 className="sidebar-title">Node Listesi {mode === 'edit' && '(Edit Modu)'}</h3>
      {nodeList.length === 0 && <p>Henüz node yok.</p>}
      <ul>
        {nodeList.map((node) => (
          <li key={node.id}>{node.label || node.type || node.id}</li>
        ))}
      </ul>
    </div>
  );
}
