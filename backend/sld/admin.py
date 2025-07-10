from django.contrib import admin
from django.contrib import admin
from .models import InverterData, AdpData, Schema , Node,Edge

admin.site.register(InverterData)
admin.site.register(AdpData)
admin.site.register(Schema)
admin.site.register(Node)
admin.site.register(Edge)
# Register your models here.
