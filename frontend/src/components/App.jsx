import React, { useRef, useState, useEffect } from 'react';
import Topbar from './TopBar';
import Sidebar from './SideBar';
import Toolbar from './ToolBar';
import GraphCanvas from './GraphCanvas';
import './App.css';

function App() {
  const graphRef = useRef(null);
  const [mode, setMode] = useState('edit');
  const [nodes, setNodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [schemaInfo, setSchemaInfo] = useState(null);
  const [schemas, setSchemas] = useState([]);

  // Şemaları yükle
  useEffect(() => {
    fetch('http://localhost:8000/api/list-schemas/')
      .then(res => res.json())
      .then(setSchemas)
      .catch(err => console.error('Şema yükleme hatası:', err));
  }, []);

  // Node ekleme fonksiyonu
  const addNode = (type) => {
    if (!graphRef.current) return;

    const nodeId = `node-${Date.now()}`;
    
    // Node tipine göre port konfigürasyonu
    let portConfig;
    if (type === 'ADP') {
      portConfig = {
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
      portConfig = {
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
      portConfig = {
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

    const nodeConfig = {
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

    graphRef.current.addNode(nodeConfig);
    setNodes(prev => [...prev, { id: nodeId, type }]);
  };

  // Şemayı kaydetme fonksiyonu
  const onSave = async () => {
  if (!graphRef.current) return;

  const nodes = graphRef.current.getNodes();
  const edges = graphRef.current.getEdges();

  const cells = [];

  nodes.forEach(node => {
    console.log('node:',node)
    const position = node.getPosition();
    const size = node.getSize();
    // label/text olarak metin al, yoksa boş string
    const labelText = node.getAttrByPath('text/text') || '';
    // nodeType varsa onu kullan, yoksa labelText
    const nodeType = node.getAttrByPath('nodeType') || labelText;

    cells.push({
      id: node.id,
      shape: 'rect',
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      label:  labelText ,
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
      source: source.cell,
      target: target.cell,
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


  // Yeni şema oluşturma fonksiyonu
  const createSchema = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/create-schema/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: schemaName, 
          station_id: `station_${Date.now()}` 
        })
      });
      const data = await response.json();
      setSchemaInfo(data);
      setShowModal(false);
      setSchemas(prev => [data, ...prev]);
    } catch (error) {
      alert(`Şema oluşturma hatası: ${error.message}`);
    }
  };

  // Şema seçildiğinde node ve edge verilerini yükle
  useEffect(() => {
    if (!schemaInfo) return;

    const loadSchemaData = () => {
      if (graphRef.current) {
        if (schemaInfo.schema_id && schemaInfo.schema_id > 0) {
          fetch(`http://localhost:8000/api/schema-detail/${schemaInfo.schema_id}/`)
            .then(res => res.json())
            .then(data => {
              graphRef.current.clearCells();
              data.nodes.forEach(node => {
                // Node tipine göre port konfigürasyonu
                let portConfig;
                const nodeType = node.type || node.label; // Backend'den gelen type alanını kullan
                if (nodeType === 'ADP') {
                  portConfig = {
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
                } else if (nodeType === 'Inv') {
                  portConfig = {
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
                  portConfig = {
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

                graphRef.current.addNode({
                  id: node.id,
                  x: node.x,
                  y: node.y,
                  width: node.width,
                  height: node.height,
                  label: node.label,
                  nodeType: nodeType, // Node tipini sakla
                  attrs: {
                    body: { fill: nodeType === 'ADP' ? '#a3d5ff' : '#ffd59e', stroke: '#333' },
                    label: { fill: '#000' }
                  },
                  ports: portConfig,
                });
              });
              data.edges.forEach(edge => {
                graphRef.current.addEdge({ ...edge, shape: 'edge' });
              });
              setNodes(data.nodes);
            })
            .catch(err => {
              console.error('Backend hatası:', err);
              if (graphRef.current) graphRef.current.clear();
              setNodes([]);
            });
        } else {
          graphRef.current.clear();
          setNodes([]);
        }
      } else {
        setTimeout(loadSchemaData, 100);
      }
    };

    loadSchemaData();
  }, [schemaInfo]);

  // Şema seçilmemişse seçim ekranı
  if (!schemaInfo) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ 
          background: '#fff',
          padding: 48,
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          minWidth: 400
        }}>
          <h1 style={{ marginBottom: 32, color: '#333', fontSize: 28 }}>Şema Seçin</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {schemas.map(s => (
            <button
              key={s.schema_id}
              style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: '2px solid #1976d2',
                background: '#fff',
                color: '#1976d2',
                  fontWeight: 'bold',
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#1976d2';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#1976d2';
              }}
              onClick={() => setSchemaInfo(s)}
            >
              {s.name}
            </button>
          ))}
          <button
            style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: '2px solid #1976d2',
              background: '#1976d2',
              color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1565c0';
                e.target.style.borderColor = '#1565c0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#1976d2';
                e.target.style.borderColor = '#1976d2';
            }}
            onClick={() => {
              setShowModal(true);
              setSchemaName('');
            }}
          >
            + Yeni Şema Oluştur
          </button>
        </div>

        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: 32,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: '0 2px 16px #0002'
              }}
            >
              <h2>Yeni Şema Yarat</h2>
              <input
                type="text"
                placeholder="Şema Adı"
                value={schemaName}
                onChange={e => setSchemaName(e.target.value)}
                style={{ width: '100%', marginBottom: 12, padding: 8 }}
              />
              <button
                onClick={createSchema}
                disabled={!schemaName}
                style={{
                  width: '100%',
                  padding: 10,
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 'bold'
                }}
              >
                Oluştur
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  // Ana uygulama görünümü
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        schemaName={schemaInfo?.name || ''}
        mode={mode}
        onModeChange={setMode}
        onSave={onSave}
        onChangeSchema={() => setSchemaInfo(null)}
      />

      <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        {mode === 'edit' && <Toolbar onAddNode={addNode} />}
        <div
          style={{
            flex: 1,
            minHeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9f9f9',
            padding: 0,
            overflow: 'hidden'
          }}
        >
          <GraphCanvas key={schemaInfo?.schema_id || 'new'} graphRef={graphRef} mode={mode} />
        </div>
        <Sidebar nodes={nodes} />
      </div>
    </div>
  );
}

export default App;
