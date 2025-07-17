// Node konfigürasyonu oluştur
export const createNodeConfig = (type) => {
  const nodeId = `node-${Date.now()}`;
  return {
    id: nodeId,
    x: type === 'ADP' ? 100 : 300,
    y: 100,
    width: type === 'Inv' ? 30 : 120,
    height: type === 'Inv' ? 30 : 40,
    label: type, // Başlangıçta type ile aynı
    nodeType: type, // Type sabit kalacak
    attrs: {
      body: {
        fill: 'none',
        stroke: '#bbb',
        rx: 12,
        ry: 12,
        magnet: true, // Bağlantı için gerekli!
      },
      label: { 
        text: type,
        fill: '#000' 
      },
    },
  };
};


// Node ekleme fonksiyonu
export const addNode = (graphRef, type, setNodes) => {
  if (!graphRef.current) return;

  const nodeConfig = createNodeConfig(type);
  graphRef.current.addNode(nodeConfig);
  setNodes(prev => [...prev, { id: nodeConfig.id, type }]);
};
