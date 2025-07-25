import React, { useRef, useState, useEffect } from 'react';
import Topbar from './TopBar';
import Sidebar from './SideBar';
import Toolbar from './ToolBar';
import GraphCanvas from './GraphCanvas';
import { addNode, createNodeConfig } from './nodeUtils'; 
import { saveSchema, loadSchemaData } from './SchemaService';
import { createEdgeConfig } from './sld_nodes/Edge';

function SchemaEditor({ schemaInfo, onBackToSchemas }) {
  const graphRef = useRef(null);
  const [state, setState] = useState({
    mode: 'edit',
    nodes: [],
    edges: [],
    selectedNode: null,
    isDirty: false,
    suppressDirty: false,
  });

  useEffect(() => {
    if (!schemaInfo) return;

    const loadData = async () => {
      setState(prev => ({ ...prev, suppressDirty: true }));
      if (graphRef.current) {
        if (schemaInfo.schema_id && schemaInfo.schema_id > 0) {
          try {
            const data = await loadSchemaData(schemaInfo.schema_id);
            graphRef.current.clearCells();
            setState(prev => ({ ...prev, nodes: [], edges: [] }));

            data.nodes.forEach(node => {
              const nodeType = node.type || node.label || 'rect';
              const defaultConfig = createNodeConfig(nodeType);
              const tomlId = node.toml_id; 

              const mergedNodeConfig = {
                ...defaultConfig,
                id: node.id,
                x: node.x,
                y: node.y,
                width: node.width || defaultConfig.width,
                height: node.height || defaultConfig.height,
                data: { ...defaultConfig.data, label: (node.label || nodeType), type: nodeType, tomlId: tomlId },
                attrs: node.attrs || defaultConfig.attrs,
              };

              graphRef.current.addNode(mergedNodeConfig);
            });

            data.edges.forEach(edge => {
              if (edge.logic) return;
              const edgeConfig = createEdgeConfig(edge, graphRef.current);
              if (edgeConfig) graphRef.current.addEdge(edgeConfig);
            });

            setState(prev => ({
              ...prev,
              nodes: data.nodes,
              edges: data.edges.filter(e => !e.logic),
              isDirty: false,
            }));
          } catch (error) {
            console.error('Backend hatası:', error);
            graphRef.current.clearCells();
            setState(prev => ({ ...prev, nodes: [], edges: [], isDirty: false }));
          }
        } else {
          graphRef.current.clearCells();
          setState(prev => ({ ...prev, nodes: [], edges: [] }));
          setState(prev => ({ ...prev, isDirty: false }));
        }
      } else {
        setTimeout(loadData, 100);
      }
      setState(prev => ({ ...prev, suppressDirty: false }));
    };

    loadData();
  }, [schemaInfo]);

  const handleAddNode = (type) => {
    addNode(graphRef, type, nodes => setState(prev => ({ ...prev, nodes })));
  };

  const handleGraphChange = () => {
    if (!state.suppressDirty) setState(prev => ({ ...prev, isDirty: true }));
  };

  const handleSave = async () => {
    setState(prev => ({ ...prev, suppressDirty: true }));
    await saveSchema(graphRef, schemaInfo);
    setState(prev => ({ ...prev, suppressDirty: false, isDirty: false }));
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        schemaName={schemaInfo?.name || ''}
        mode={state.mode}
        onModeChange={setMode => setState(prev => ({ ...prev, mode: setMode }))}
        onSave={handleSave}
        onChangeSchema={onBackToSchemas}
        canSave={state.isDirty}
      />

      <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        {state.mode === 'edit' && <Toolbar onAddNode={handleAddNode} />}
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
          <GraphCanvas
            key={schemaInfo?.schema_id}
            graphRef={graphRef}
            mode={state.mode}
            setSelectedNode={setSelectedNode => setState(prev => ({ ...prev, selectedNode: setSelectedNode }))}
            nodes={state.nodes}
            edges={state.edges}
            setNodes={nodes => setState(prev => ({ ...prev, nodes }))}
            onGraphChange={handleGraphChange}
          />
        </div>
        <Sidebar
          nodes={state.nodes}
          selectedNode={state.selectedNode}
          setNodes={nodes => setState(prev => ({ ...prev, nodes }))}
          graphRef={graphRef}
        />
      </div>
    </div>
  );
}

export default SchemaEditor;
