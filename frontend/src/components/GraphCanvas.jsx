import React, { useEffect, useCallback } from 'react';
import { Graph } from '@antv/x6';
import { createEdge, removeEdge, updateEdge, edgeConnectingConfig } from './sld_nodes/Edge';

// Kenar tespiti fonksiyonu
function getNearestEdge(x, y, width, height) {
  const top = y;
  const bottom = height - y;
  const left = x;
  const right = width - x;
  const min = Math.min(top, bottom, left, right);
  if (min === top) return { x: x, y: 0 };
  if (min === bottom) return { x: x, y: height };
  if (min === left) return { x: 0, y: y };
  return { x: width, y: y };
}

let edgeStart = null;

export default function GraphCanvas({ graphRef, mode, setSelectedNode, onAddEdge, nodes = [], setNodes, onGraphChange }) {
  // X6 Graph init
  useEffect(() => {
    if (!graphRef.current && document.getElementById('graph-container')) {
      graphRef.current = new Graph({
        container: document.getElementById('graph-container'),
        width: 800,
        height: 600,
        grid: true,
        interacting: { nodeMovable: true, edgeMovable: true, magnetConnectable: true },
        translating: { restrict: true },
        connecting: edgeConnectingConfig,
      });
    }
    return () => {
      if (graphRef.current) {
        graphRef.current.dispose();
        graphRef.current = null;
      }
    };
  }, [graphRef]);

  // Mode değişiminde interacting güncelle
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.options.interacting = { nodeMovable: true, edgeMovable: true, magnetConnectable: true };
    }
  }, [graphRef]);

  // Node seçimi
  useEffect(() => {
    if (!graphRef.current) return;
    const handler = ({ node }) => {
      setSelectedNode({
        id: node.id,
        label: node.getAttrByPath('label/text') || node.getAttrByPath('text/text') || node.getProp('label') || '',
        type: node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '',
        ...node.getData?.()
      });
    };
    graphRef.current.on('node:click', handler);
    return () => {
      graphRef.current?.off('node:click', handler);
    };
  }, [graphRef, setSelectedNode]);

  // Graph değişim eventleri
  useEffect(() => {
    if (!graphRef.current) return;
    const handler = () => {
      if (typeof onGraphChange === 'function') onGraphChange();
    };
    const events = [
      'node:added', 'node:removed', 'node:moved',
      'edge:added', 'edge:removed', 'edge:change:source', 'edge:change:target'
    ];
    events.forEach(ev => graphRef.current.on(ev, handler));
    return () => {
      events.forEach(ev => graphRef.current?.off(ev, handler));
    };
  }, [graphRef, onGraphChange]);

  // Edge başlatma ve bırakma
  const handleNodeMouseDown = useCallback(({ node, e }) => {
    const bbox = node.getBBox();
    const clientRect = graphRef.current.container.getBoundingClientRect();
    const x = e.clientX - clientRect.left - bbox.x;
    const y = e.clientY - clientRect.top - bbox.y;
    const anchor = getNearestEdge(x, y, bbox.width, bbox.height);
    edgeStart = { nodeId: node.id, anchor };
  }, [graphRef]);

  const handleNodeMouseUp = useCallback(({ node, e }) => {
    if (!edgeStart) return;
    const bbox = node.getBBox();
    const clientRect = graphRef.current.container.getBoundingClientRect();
    const x = e.clientX - clientRect.left - bbox.x;
    const y = e.clientY - clientRect.top - bbox.y;
    const anchor = getNearestEdge(x, y, bbox.width, bbox.height);
    if (edgeStart.nodeId !== node.id) {
      createEdge(graphRef.current, edgeStart.nodeId, node.id);
    }
    edgeStart = null;
  }, [graphRef]);

  useEffect(() => {
    if (!graphRef.current) return;
    const graph = graphRef.current;
    graph.on('node:mousedown', handleNodeMouseDown);
    graph.on('node:mouseup', handleNodeMouseUp);
    return () => {
      graph.off('node:mousedown', handleNodeMouseDown);
      graph.off('node:mouseup', handleNodeMouseUp);
    };
  }, [graphRef, handleNodeMouseDown, handleNodeMouseUp]);

  return (
    <>
      <style>{`
        @keyframes dash-animation {
          to {
            stroke-dashoffset: -10px;
          }
        }
      `}</style>
      <div
        id="graph-container"
        style={{ width: 1200, height: 900, border: '1px solid #ccc', background: '#fff', position: 'relative' }}
      />
    </>
  );
}