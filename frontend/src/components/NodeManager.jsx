// Node tipine göre port konfigürasyonu
export const getPortConfig = (type) => {
  if (type === 'ADP') {
    return {
      groups: {
        out: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'out' },
      ],
    };
  } else if (type === 'Inv') {
    return {
      groups: {
        in: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'in' },
      ],
    };
  } else {
    // Diğer node tipleri için varsayılan konfigürasyon
    return {
      groups: {
        in: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        out: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'in' },
        { group: 'out' },
      ],
    };
  }
};

// Node konfigürasyonu oluştur
export const createNodeConfig = (type) => {
  const nodeId = `node-${Date.now()}`;
  const portConfig = getPortConfig(type);
  
  return {
    id: nodeId,
    x: type === 'ADP' ? 100 : 300,
    y: 100,
    width: type === 'Inv' ? 30 : 120,
    height: type === 'Inv' ? 30 : 40,
    label: type,
    attrs: {
      body: { fill: type === 'ADP' ? '#a3d5ff' : '#ffd59e', stroke: '#333' },
      label: { fill: '#000' }
    },
    ports: portConfig,
  };
};

// Node ekleme fonksiyonu
export const addNode = (graphRef, type, setNodes) => {
  if (!graphRef.current) return;

  const nodeConfig = createNodeConfig(type);
  graphRef.current.addNode(nodeConfig);
  setNodes(prev => [...prev, { id: nodeConfig.id, type }]);
}; 