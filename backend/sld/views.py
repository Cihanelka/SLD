from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Node, Edge, Schema
from .serializers import NodeSerializer, EdgeSerializer
import random


class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer


class EdgeViewSet(viewsets.ModelViewSet):
    queryset = Edge.objects.all()
    serializer_class = EdgeSerializer


class SaveSchemaView(APIView):
    def post(self, request):
        data = request.data.get("data")
        name = request.data.get("name", "Untitled")

        if not data:
            return Response({"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Her kaydetmede yeni bir schema oluştur
        schema = Schema.objects.create(name=name, station_id=f"station_{random.randint(1, 1000000)}")

        cells = data.get("cells", [])
        nodes_map = {}

        # Node'ları kaydet
        for cell in cells:
            if cell.get("shape") == "edge":
                continue

            node_id = cell.get("id")
            x = cell.get("x", 0)
            y = cell.get("y", 0)
            width = cell.get("width", 0)
            height = cell.get("height", 0)
            label = cell.get("label", {}).get("text", "") or ""
            node_type = cell.get("type", "")

            node = Node.objects.create(
                node_id=node_id,
                label=label,
                x=x,
                y=y,
                width=width,
                height=height,
                schema=schema,
                node_type=node_type
            )
            nodes_map[node_id] = node

        # Edge'leri kaydet
        for cell in cells:
            if cell.get("shape") != "edge":
                continue

            edge_id = cell.get("id")
            source_id = cell.get("source", {}).get("cell") if isinstance(cell.get("source"), dict) else cell.get("source")
            target_id = cell.get("target", {}).get("cell") if isinstance(cell.get("target"), dict) else cell.get("target")
            label = cell.get("label", {}).get("text", "") if isinstance(cell.get("label"), dict) else cell.get("label", "")

            source_node = nodes_map.get(source_id)
            target_node = nodes_map.get(target_id)

            if source_node and target_node:
                Edge.objects.create(
                    edge_id=edge_id,
                    source=source_node,
                    target=target_node,
                    label=label,
                    schema=schema
                )

        return Response({"message": "Schema saved successfully"}, status=status.HTTP_201_CREATED)


class CreateSchemaView(APIView):
    def post(self, request):
        name = request.data.get("name")
        station_id = request.data.get("station_id")
        if not name or not station_id:
            return Response({"error": "name ve station_id zorunlu"}, status=status.HTTP_400_BAD_REQUEST)
        schema = Schema.objects.create(name=name, station_id=station_id)
        return Response({"schema_id": schema.id, "name": schema.name}, status=status.HTTP_201_CREATED)


class ListSchemasView(APIView):
    def get(self, request):
        schemas = Schema.objects.all().order_by('-id')
        data = [{"schema_id": s.id, "name": s.name} for s in schemas]
        return Response(data, status=status.HTTP_200_OK)


class SchemaDetailView(APIView):
    def get(self, request, schema_id):
        nodes = Node.objects.filter(schema_id=schema_id)
        edges = Edge.objects.filter(schema_id=schema_id)
        node_data = [
            {
                "id": n.node_id,
                "label": n.label,
                "x": n.x,
                "y": n.y,
                "width": n.width,
                "height": n.height,
                "type": n.node_type,
            }
            for n in nodes
        ]
        edge_data = [
            {
                "id": e.edge_id,
                "source": e.source.node_id,
                "target": e.target.node_id,
                "label": e.label,
            }
            for e in edges
        ]
        return Response({"nodes": node_data, "edges": edge_data}, status=200)
