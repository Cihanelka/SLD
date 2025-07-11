from .models import Schema, Node, Edge
from rest_framework import serializers


class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = '__all__'

class EdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edge
        fields = '__all__'

class SchemaSerializer(serializers.ModelSerializer):
    nodes = NodeSerializer(many=True)
    edges = EdgeSerializer(many=True)

    class Meta:
        model = Schema
        fields = ['id', 'station_id', 'name', 'created_at', 'nodes', 'edges']

    def create(self, validated_data):
        nodes_data = validated_data.pop('nodes')
        edges_data = validated_data.pop('edges')
        schema = Schema.objects.create(**validated_data)

        for node_data in nodes_data:
            Node.objects.create(schema=schema, **node_data)
        for edge_data in edges_data:
            Edge.objects.create(schema=schema, **edge_data)

        return schema
