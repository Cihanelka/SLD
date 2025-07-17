from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NodeViewSet, EdgeViewSet
from .views import SaveSchemaView, CreateSchemaView, ListSchemasView, SchemaDetailView, NodeDetailByTomlIdView
from .views import realtime_data


router = DefaultRouter()
router.register(r'nodes', NodeViewSet)
router.register(r'edges', EdgeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('save-schema/', SaveSchemaView.as_view(), name='save-schema'),
    path('create-schema/', CreateSchemaView.as_view(), name='create-schema'),
    path('list-schemas/', ListSchemasView.as_view(), name='list-schemas'),
    path('schema-detail/<int:schema_id>/', SchemaDetailView.as_view(), name='schema-detail'),
    path('node-detail/<str:toml_id>/', NodeDetailByTomlIdView.as_view(), name='node-detail-by-toml'),
]
urlpatterns += [
    path('api/realtime-data/', realtime_data),
]