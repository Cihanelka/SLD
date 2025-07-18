import React, { useRef, useState, useEffect } from 'react';
import { Graph } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import Busbar from './sld_nodes/Busbar.jsx';
import ADP from './sld_nodes/ADP.jsx';
import Inv from './sld_nodes/Inv';
import Meter from './sld_nodes/Meter';

// register kodlarını kaldır

// Burada da nodeUtils.js'deki createNodeConfig'u kullanmak daha iyi olur, ama istersen tekrar yazabilirsin
import { createNodeConfig } from './nodeUtils';

const NodeManager = () => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    graphRef.current = new Graph({
      container: containerRef.current,
      width: 1000,
      height: 600,
      grid: true,
      connecting: {
        router: 'orth',
        connector: 'rounded',
        anchor: 'center',
        connectionPoint: 'anchor',
      },
    });
  }, []);

  const handleAddNode = (type) => {
    if (!graphRef.current) return;
    const config = createNodeConfig(type);
    graphRef.current.addNode(config);
    setNodes((prev) => [...prev, { id: config.id, type }]);
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => handleAddNode('ADP')}>ADP Ekle</button>
        <button onClick={() => handleAddNode('Inv')}>Inv Ekle</button>
        <button onClick={() => handleAddNode('Meter')}>Meter Ekle</button>
        <button onClick={() => handleAddNode('Busbar')}>Busbar Ekle</button>
      </div>
      <div ref={containerRef} style={{ border: '1px solid #ccc', width: '100%', height: '600px' }} />
    </div>
  );
};

export default NodeManager;
