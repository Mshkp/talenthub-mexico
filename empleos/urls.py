from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

from .views import (
    login,
    VacanteViewSet,
    EmpresaViewSet,
    AplicacionViewSet,
    PlanViewSet,
    SuscripcionViewSet,
    NotificacionViewSet,
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
    # 1️⃣ RUTAS MANUALES DE PRIORIDAD
    path('vacantes/pendientes/', views.vacantes_pendientes, name='vacantes_pendientes'),
    path('vacantes/validar/<int:pk>/', views.validar_vacante, name='validar_vacante'),
    
    # 2️⃣ ROUTER AUTOMÁTICO
    path('', include(router.urls)),
    
    # 3️⃣ RUTAS DE USUARIO Y SISTEMA
    path('register/', register), 
    path('login/', login),       
    path('user-info/', get_user_info),
    path('pago/crear/', crear_pago),
    path("pago/capturar/", capturar_pago),
    path('suscripcion/actual/', views.mi_suscripcion, name='mi_suscripcion'),
    path('suscripcion/cancelar/', views.cancelar_suscripcion, name='cancelar_suscripcion'),
    path('perfil/aspirante/', views.mi_perfil_aspirante, name='mi_perfil_aspirante'),
    path('validador/metricas/', views.metricas_validador, name='metricas_validador'),
    path('validador/usuarios/', views.lista_usuarios, name='lista_usuarios'),
    path('validador/usuarios/<int:pk>/suspender/', views.suspender_usuario, name='suspender_usuario'),
    path('validador/vacantes/historial/', views.historial_vacantes, name='historial_vacantes'),
    path('validador/tecnologias/', views.catalogo_tecnologias, name='catalogo_tecnologias'),
    path('validador/tecnologias/<int:pk>/', views.eliminar_tecnologia, name='eliminar_tecnologia'),
    path('recuperar-password/', views.solicitar_recuperacion_password, name='recuperar_password'),
    path('confirmar-password/', views.confirmar_nueva_password, name='confirmar_password'),
]