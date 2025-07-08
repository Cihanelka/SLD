from django.db import models

class Node(models.Model):
    node_id = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=200)
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()

class Edge(models.Model):
    edge_id = models.CharField(max_length=100, unique=True)
    source = models.CharField(max_length=100)
    target = models.CharField(max_length=100)
    label = models.CharField(max_length=200, blank=True)
