from django.contrib import admin
from .models import Usuario, Empresa, Vacante, Aplicacion
from .models import Plan, Suscripcion, Notificacion

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'tipo', 'is_active']
    list_filter = ['tipo', 'is_active']
    search_fields = ['username', 'email']

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ['nombre_empresa', 'sector', 'ubicacion', 'fecha_registro']
    list_filter = ['sector']
    search_fields = ['nombre_empresa', 'sector']

@admin.register(Vacante)
class VacanteAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'empresa', 'modalidad', 'salario_min', 'salario_max', 'activa', 'fecha_publicacion']
    list_filter = ['modalidad', 'activa', 'fecha_publicacion']
    search_fields = ['titulo', 'empresa__nombre_empresa']

@admin.register(Aplicacion)
class AplicacionAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'vacante', 'estado', 'fecha_aplicacion']
    list_filter = ['estado', 'fecha_aplicacion']
    search_fields = ['usuario__username', 'vacante__titulo']

admin.site.register(Plan)
admin.site.register(Suscripcion)
admin.site.register(Notificacion)

