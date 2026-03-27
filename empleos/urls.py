from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    login,
    VacanteViewSet,
    EmpresaViewSet,
    AplicacionViewSet,
    PlanViewSet,
    SuscripcionViewSet,
    NotificacionViewSet,
    capturar_pago,
    register,
    get_user_info,
    crear_pago,
    capturar_pago
)

router = DefaultRouter()

router.register(r'vacantes', VacanteViewSet)
router.register(r'empresas', EmpresaViewSet)
router.register(r'aplicaciones', AplicacionViewSet)
router.register(r'planes', PlanViewSet)
router.register(r'suscripciones', SuscripcionViewSet)
router.register(r'notificaciones', NotificacionViewSet, basename='notificaciones')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register),
    path('user-info/', get_user_info),
    path('pago/crear/', crear_pago),
    path("pago/capturar/", capturar_pago),
    path('login/', login)
]

