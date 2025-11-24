from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VacanteViewSet, EmpresaViewSet, AplicacionViewSet, register

router = DefaultRouter()
router.register(r'vacantes', VacanteViewSet)
router.register(r'empresas', EmpresaViewSet)
router.register(r'aplicaciones', AplicacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register, name='register'),
]