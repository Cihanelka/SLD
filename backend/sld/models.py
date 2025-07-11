from django.db import models

class Schema(models.Model):
    station_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200, default="Untitled")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

from django.db import models

class Node(models.Model):
    schema = models.ForeignKey(Schema, related_name='nodes', on_delete=models.CASCADE)
    node_id = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=200)  # cihaz adı gibi davranır
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()

    # Ortak teknik özellikler
    voltage = models.FloatField(null=True, blank=True, help_text="Gerilim (V)")
    current = models.FloatField(null=True, blank=True, help_text="Akım (A)")
    status = models.CharField(
        max_length=20,
        choices=[('online', 'Online'), ('offline', 'Offline')],
        default='offline'
    )
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.label} ({self.node_id})"


    # Opsiyonel: node tipi ekleyebilirsin (inverter, adp vs)
    node_type = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.label} ({self.node_id})"

class Edge(models.Model):
    schema = models.ForeignKey(Schema, related_name='edges', on_delete=models.CASCADE)
    edge_id = models.CharField(max_length=100, unique=True)
    source = models.ForeignKey(Node, related_name='edges_source', on_delete=models.CASCADE)
    target = models.ForeignKey(Node, related_name='edges_target', on_delete=models.CASCADE)
    label = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.source} -> {self.target}"

