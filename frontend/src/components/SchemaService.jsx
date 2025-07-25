const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
};

export const saveSchema = async (graphRef, schemaInfo) => {
  if (!graphRef.current) return;

  const nodes = graphRef.current.getNodes();
  const edges = graphRef.current.getEdges();

  const cells = [];

  nodes.forEach(node => {
    const position = node.getPosition();
    const size = node.getSize();
    const labelText = node.getAttrByPath('label/text')
      || node.getProp('label')
      || node.getProp('type')
      || node.getAttrByPath('nodeType')
      || '';
    const nodeType = node.getProp('nodeType')
      || node.getAttrByPath('nodeType')
      || '';
    cells.push({
      id: node.id,
      shape: 'rect',
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      label: labelText || nodeType,
      type: nodeType,
      attrs: node.getAttrs(),
      toml_id: (
        typeof node.getData === 'function'
          ? (node.getData() && node.getData().tomlId ? node.getData().tomlId : '')
          : ''
      )
    });
  });

  edges.forEach(edge => {
    if (edge.logic) return;
    const source = edge.getSource();
    const target = edge.getTarget();
    const labelTextEdge = edge.getAttrByPath('label/text')
      || (edge.getProp && edge.getProp('type'))
      || '';
    const edgeType = (edge.getProp && edge.getProp('type'))
      || '';
    cells.push({
      id: edge.id,
      shape: 'edge',
      source: (source.cell || source),
      target: (target.cell || target),
      label: (labelTextEdge || edgeType),
      router: { name: 'manhattan' },
      connector: { name: 'jumpover' },
      attrs: edge.getAttrs()
    });
  });

  const graphData = { cells };

  try {
    await fetchJson('http://localhost:8000/api/save-schema/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: schemaInfo?.name || 'Untitled',
        schema_id: schemaInfo?.schema_id,
        data: graphData,
      }),
    });
    alert('Şema başarıyla kaydedildi!');
  } catch (error) {
    alert(`Kaydetme hatası: ${error.message}`);
  }
};

export const loadSchemaData = async (schemaId) => {
  try {
    return await fetchJson(`http://localhost:8000/api/schema-detail/${schemaId}/`);
  } catch (error) {
    console.error('Backend hatası:', error);
    throw error;
  }
};

export const getNodeDetailByTomlId = async (tomlId) => {
  try {
    return await fetchJson(`http://localhost:8000/api/node-detail/${tomlId}/`);
  } catch (error) {
    console.error('Node detay hatası:', error);
    throw error;
  }
}; 