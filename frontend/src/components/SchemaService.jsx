// importlar sadeleştirildi, kullanılmayanlar kaldırıldı
// Graph'ı backend'e kaydeder
export const saveSchema = async (graphRef, schemaInfo) => {
  if (!graphRef.current) return;

  const nodes = graphRef.current.getNodes();
  const edges = graphRef.current.getEdges();

  const cells = [];

  // findAllConnectedTargets fonksiyonu kaldırıldı

  nodes.forEach(node => {
    console.log(node.getData())
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
    let parentId = null;
    if (typeof node.getParent === 'function') {
      const parent = node.getParent();
      if (parent) parentId = parent.id;
    }
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
      // parent: parentId kaldırıldı
    });
  });

  edges.forEach(edge => {
    if (edge.logic) return; // mantıksal edge'i kaydetme
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

  // Mantıksal (transitif) INV-ADP edge'leri ekle
  // KALDIRILDI: Mantıksal edge'ler artık eklenmiyor

  const graphData = { cells };

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

// Backend'den şema verilerini yükler
export const loadSchemaData = async (schemaId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/schema-detail/${schemaId}/`);
    return await response.json();
  } catch (error) {
    console.error('Backend hatası:', error);
    throw error;
  }
};

// TOML ID ile node detayını getirir
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