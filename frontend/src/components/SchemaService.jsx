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
    const labelText = node.getAttrByPath('label/text') || node.getProp('label') || '';
    const nodeType = node.getProp('nodeType') || node.getAttrByPath('nodeType') || '';

    cells.push({
      id: node.id,
      shape: 'rect',
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      label: labelText,
      type: nodeType,
      attrs: node.getAttrs()
    });
  });

  edges.forEach(edge => {
    const source = edge.getSource();
    const target = edge.getTarget();
    const labelText = edge.getAttrByPath('label/text') || '';

    cells.push({
      id: edge.id,
      shape: 'edge',
      source: source.cell || source,
      target: target.cell || target,
      label: { text: labelText },
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