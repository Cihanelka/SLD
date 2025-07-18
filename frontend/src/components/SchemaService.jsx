// Şemayı kaydetme
export const saveSchema = async (graphRef, schemaInfo) => {
  if (!graphRef.current) return;

  const nodes = graphRef.current.getNodes();
  const edges = graphRef.current.getEdges();

  const cells = [];

  nodes.forEach(node => {
    console.log('node:', node);
    const position = node.getPosition();
    const size = node.getSize();
    const labelText = node.getAttrByPath('label/text') || node.getProp('label') || node.getProp('type') || node.getAttrByPath('nodeType') || '';
    const nodeType = node.getProp('nodeType') || node.getAttrByPath('nodeType') || '';

    cells.push({
      id: node.id,
      shape: 'rect',
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      label: labelText || nodeType, // label boşsa type kullan
      type: nodeType,
      attrs: node.getAttrs(),
      toml_id: (typeof node.getData === 'function' && node.getData() && node.getData().toml_id) ? node.getData().toml_id : ''
    });
  });

  edges.forEach(edge => {
    const source = edge.getSource();
    const target = edge.getTarget();
    const labelText = edge.getAttrByPath('label/text') || edge.getProp && edge.getProp('type') || '';
    const edgeType = edge.getProp && edge.getProp('type') || '';

    cells.push({
      id: edge.id,
      shape: 'edge',
      source: source.cell || source,
      target: target.cell || target,
      label: labelText || edgeType, // label boşsa type kullan
      router: { name: 'manhattan' }, // L çizgi
      connector: { name: 'jumpover' }, // atlama efekti
      attrs: edge.getAttrs()
    });
  });

  const graphData = { cells };
  console.log(JSON.stringify(graphData, null, 2));

  try {
    const response = await fetch('http://localhost:8000/api/save-schema/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: schemaInfo?.name || 'Untitled',
        schema_id: schemaInfo?.schema_id,
        data: graphData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    alert('Şema başarıyla kaydedildi!');
  } catch (error) {
    alert(`Kaydetme hatası: ${error.message}`);
  }
};

// Şema verilerini yükle
export const loadSchemaData = async (schemaId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/schema-detail/${schemaId}/`);
    return await response.json();
  } catch (error) {
    console.error('Backend hatası:', error);
    throw error;
  }
};

// TOML ID ile node detayını getir
export const getNodeDetailByTomlId = async (tomlId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/node-detail/${tomlId}/`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Node detay hatası:', error);
    throw error;
  }
}; 