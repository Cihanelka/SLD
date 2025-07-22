// Edge işlemleri ve X6 edge config ayarları burada merkezi olarak tanımlanır

// Edge oluşturma ve konfigürasyon fonksiyonlarını sadeleştir, ortak edgeAttrs fonksiyonu ile tekrarları azalt

function edgeAttrs(color = '#ff0000') {
  return {
    line: {
      stroke: color,
      strokeWidth: 2,
      strokeDasharray: '4 4',
      targetMarker: {
        name: 'classic',
        size: 6,
        fill: color,
        stroke: color,
      },
      style: {
        animation: 'dash-animation 1s linear infinite',
      },
    },
  };
}

// Edge konfigürasyonunu merkezi olarak döndüren fonksiyon
export function createEdgeConfig(edge, graph) {
  let source = edge.source;
  let target = edge.target;
  if (typeof source === 'string') source = { cell: source };
  if (typeof target === 'string') target = { cell: target };
  return {
    ...edge,
    shape: 'edge',
    source,
    target,
    label: edge.label || edge.type || '',
    router: { name: 'manhattan' },
    connector: { name: 'jumpover' },
    attrs: edgeAttrs(),
  };
}

// Edge oluşturma
export function createEdge(graph, sourceId, targetId, color = '#ff0000') {
  if (!graph) return;
  const source = { cell: sourceId };
  const target = { cell: targetId };
  graph.addEdge({
    shape: 'edge',
    source,
    target,
    attrs: edgeAttrs(color),
    router: { name: 'manhattan' },
    connector: { name: 'jumpover' },
  });
}

// Edge silme
export function removeEdge(graph, edgeId) {
  if (!graph) return;
  const edge = graph.getCellById(edgeId);
  if (edge) graph.removeCell(edge);
}

// Edge bağlantı güncelleme
export function updateEdge(graph, edgeId, newSourceId, newTargetId) {
  if (!graph) return;
  const edge = graph.getCellById(edgeId);
  if (edge) {
    edge.setSource({ cell: newSourceId, anchor: 'center', connectionPoint: 'boundary' });
    edge.setTarget({ cell: newTargetId, anchor: 'center', connectionPoint: 'boundary' });
  }
}

// X6 edge bağlantı kuralları (opsiyonel, merkezi tanım)
export const edgeConnectingConfig = {
  allowNodeMove: true,
  allowBlank: false,
  allowLoop: false,
  highlight: true,
  snap: true,
  connector: 'normal',
  allowNode: true,
  allowEdge: true,
  allowMulti: true,
  highlighting: {
    magnetAvailable: {
      name: 'stroke',
      args: {
        attrs: {
          stroke: '#00c853',
          'stroke-width': 3,
        },
      },
    },
    magnetAdsorbed: {
      name: 'stroke',
      args: {
        attrs: {
          stroke: '#00c853',
          'stroke-width': 4,
        },
      },
    },
  },
  validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet, sourcePort, targetPort }) {
    console.log('validateConnection', { sourceCell, targetCell, sourceMagnet, targetMagnet, sourcePort, targetPort });
    if (sourceCell && sourceCell.isEdge && sourceCell.isEdge()) return false;
    if (targetCell && targetCell.isEdge && targetCell.isEdge()) return false;
    if (
      (sourceCell && targetCell && sourceCell.id === targetCell.id) ||
      (sourcePort && targetPort && sourcePort === targetPort)
    ) return false;
    return true;
  },
};
