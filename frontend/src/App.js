import React, { useEffect, useRef } from "react";
import { Graph } from "@antv/x6";
import axios from "axios";

const App = () => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);

  useEffect(() => {
    const graph = new Graph({
      container: containerRef.current,
      grid: true,
    });
    graphRef.current = graph;

    loadGraph(graph);
  }, []);

  const loadGraph = async (graph) => {
    const [nodesRes, edgesRes] = await Promise.all([
      axios.get("http://localhost:8000/api/nodes/"),
      axios.get("http://localhost:8000/api/edges/")
    ]);

    nodesRes.data.forEach((node) => {
      graph.addNode({
        id: node.node_id,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        label: node.label,
      });
    });

    edgesRes.data.forEach((edge) => {
      graph.addEdge({
        id: edge.edge_id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      });
    });

    // Save on change
    graph.on('node:change:*', () => saveGraph(graph));
    graph.on('edge:change:*', () => saveGraph(graph));
    graph.on('node:added', () => saveGraph(graph));
    graph.on('edge:added', () => saveGraph(graph));
    graph.on('node:removed', () => saveGraph(graph));
    graph.on('edge:removed', () => saveGraph(graph));
  };

  const saveGraph = async (graph) => {
    const cells = graph.getCells();
    const nodes = cells.filter(cell => cell.isNode());
    const edges = cells.filter(cell => cell.isEdge());

    // Clear old data
    await axios.delete("http://localhost:8000/api/nodes/");
    await axios.delete("http://localhost:8000/api/edges/");

    // Save new data
    for (let node of nodes) {
      const data = node.getData();
      await axios.post("http://localhost:8000/api/nodes/", {
        node_id: node.id,
        label: node.attr("label/text"),
        x: node.getPosition().x,
        y: node.getPosition().y,
        width: node.size().width,
        height: node.size().height,
      });
    }

    for (let edge of edges) {
      await axios.post("http://localhost:8000/api/edges/", {
        edge_id: edge.id,
        source: edge.getSourceCellId(),
        target: edge.getTargetCellId(),
        label: edge.attr("label/text") || "",
      });
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>X6 Graph Editor</h2>
      <div ref={containerRef} style={{ height: "600px", border: "1px solid #ddd" }} />
    </div>
  );
};

export default App;
