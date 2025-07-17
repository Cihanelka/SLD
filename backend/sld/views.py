from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Node, Edge, Schema
from .serializers import NodeSerializer, EdgeSerializer
import random
from django.http import JsonResponse


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
        schema_id = request.data.get("schema_id")

        if not data:
            return Response({"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Eğer schema_id varsa mevcut schema'yı kullan, yoksa yeni oluştur
        if schema_id:
            try:
                schema = Schema.objects.get(id=schema_id)
                schema.name = name  # İsmi güncelle
                schema.save()
            except Schema.DoesNotExist:
                return Response({"error": "Schema not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Yeni schema oluştur
            schema = Schema.objects.create(name=name, station_id=f"station_{random.randint(1, 1000000)}")

        # Mevcut node'ları ve edge'leri sil
        schema.nodes.all().delete()
        schema.edges.all().delete()

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
            label = cell.get("label", "") or ""  # label artık sadece string
            node_type = cell.get("type", "")
            toml_id = cell.get("toml_id")
            node = Node.objects.create(
                node_id=node_id,
                label=label,
                x=x,
                y=y,
                width=width,
                height=height,
                schema=schema,
                node_type=node_type,
                toml_id=toml_id
            )
            nodes_map[node_id] = node

        # Edge'leri kaydet
        for cell in cells:
            if cell.get("shape") != "edge":
                continue

            edge_id = cell.get("id")
            source = cell.get("source")
            target = cell.get("target")
            source_id = source.get("cell") if isinstance(source, dict) else source
            target_id = target.get("cell") if isinstance(target, dict) else target
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
        label = request.data.get("label")
        type_ = request.data.get("type")
        
        if not name or not station_id:
            return Response({"error": "name ve station_id zorunlu"}, status=status.HTTP_400_BAD_REQUEST)
        
        schema = Schema.objects.create(name=name, station_id=station_id)

        # Örneğin label ve type Node'daysa:
        if label and type_:
            Node.objects.create(schema=schema, label=label, type=type_)

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
                "toml_id": n.toml_id,
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


class NodeDetailByTomlIdView(APIView):
    def get(self, request, toml_id):
        try:
            node = Node.objects.get(toml_id=toml_id)
            node_data = {
                "id": node.node_id,
                "label": node.label,
                "type": node.node_type,
                "toml_id": node.toml_id,
                "voltage": node.voltage,
                "current": node.current,
                "status": node.status,
                "timestamp": node.timestamp,
                "x": node.x,
                "y": node.y,
                "width": node.width,
                "height": node.height,
            }
            return Response(node_data, status=status.HTTP_200_OK)
        except Node.DoesNotExist:
            return Response({"error": "Node not found"}, status=status.HTTP_404_NOT_FOUND)


def realtime_data(request):
    data = {
        "realtimedata": [
            {
                "id": "datalogger_id",
                "name": "Datalogger1",
                "devices": [
                    {
                        "toml_id": "toml_id_1",
                        "name": "Schema Button",
                        "data": {
                            "status": True,
                        }
                    }
                ]
            }
        ]
    }
    return JsonResponse(data)
