import React from 'react';

// Node listesini ve seçili node'u gösteren sidebar bileşeni
export default function Sidebar({ nodes, selectedNode, setNodes, mode, graphRef, realtimedata }) {
  const nodeList = nodes || [];
  let matchedDevice = null;
  if (selectedNode && realtimedata) {
    for (const group of realtimedata) {
      matchedDevice = group.devices.find(dev => dev.id === selectedNode.toml_id);
      if (matchedDevice) break;
    }
  }
  return (
    <div className="sidebar sidebar-modern">
      <h3 className="sidebar-title">Node Listesi {mode === 'edit' && '(Edit Modu)'}</h3>
      {selectedNode && mode !== 'user' ? (
        <div style={{marginBottom: 24}}>
          <h4>Seçili Node</h4>
          <div><b>ID:</b> {selectedNode.id}</div>
          <div><b>Label:</b> {selectedNode.label}</div>
          <div><b>Type:</b> {selectedNode.type}</div>
          {selectedNode.toml_id && <div><b>TOML ID:</b> {selectedNode.toml_id}</div>}
          {/* Eşleşen device verisi */}
          {matchedDevice && (
            <div style={{marginTop: 12, padding: 8, background: '#f8f8f8', borderRadius: 6}}>
              <b>Realtime Data:</b>
              <div><b>Device Name:</b> {matchedDevice.name}</div>
              <div><b>Status:</b> {matchedDevice.data?.status ? 'Aktif' : 'Pasif'}</div>
            </div>
          )}
          <button
            style={{marginTop: 12, padding: '8px 16px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}
            onClick={() => {
              if (window.confirm('Seçili node silinsin mi?')) {
                setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
                if (graphRef && graphRef.current) {
                  const node = graphRef.current.getCellById(selectedNode.id);
                  if (node) {
                    node.removeTools && node.removeTools();
                  }
                  graphRef.current.removeNode(selectedNode.id);
                }
              }
            }}
          >Node'u Sil</button>
        </div>
      ) : null}
      {nodeList.length === 0 && <p>Henüz node yok.</p>}
      <ul>
        {nodeList.map((node) => (
          <li key={node.id}>{node.label || node.type || node.id}</li>
        ))}
      </ul>
    </div>
  );
}
