from rest_framework import serializers
from .models import Usuario, Empresa, Vacante, Aplicacion
from .models import Plan, Suscripcion, Notificacion
from .models import Aspirante
import json
import os
from rest_framework import serializers

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'tipo', 'telefono']
        extra_kwargs = {'password': {'write_only': True}}

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class VacanteSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.CharField(source='empresa.nombre_empresa', read_only=True)
    
    class Meta:
        model = Vacante
        fields = '__all__'

class AplicacionSerializer(serializers.ModelSerializer):
    vacante_titulo = serializers.CharField(source='vacante.titulo', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = Aplicacion
        fields = '__all__'

    # S-SDLC: Control de Acceso y Prevención de Fuga de Datos (Data Leakage Prevention)
    def to_representation(self, instance):
        # Obtenemos los datos base
        data = super().to_representation(instance)
        
        # Solo inyectamos los datos sensibles si el estado lo permite
        if instance.estado in ['revisado', 'aceptado']:
            data['usuario_email'] = instance.usuario.email
            data['usuario_telefono'] = instance.usuario.telefono
        else:
            # Si está pendiente o rechazado, enviamos nulo (Data Masking)
            data['usuario_email'] = None
            data['usuario_telefono'] = None
            
        return data



class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'


class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscripcion
        fields = '__all__'


class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'



class AspiranteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aspirante
        fields = '__all__'
        read_only_fields = ['usuario']

    # Solo conservamos la validación de archivos (S-SDLC)
    def validate_cv(self, value):
        if value and hasattr(value, 'name'):
            ext = os.path.splitext(value.name)[1].lower()
            if ext != '.pdf':
                raise serializers.ValidationError("Riesgo de seguridad: El CV debe ser estrictamente un documento PDF.")
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("El archivo PDF excede el límite permitido de 5MB.")
        return value

    def validate_foto(self, value):
        if value and hasattr(value, 'name'):
            ext = os.path.splitext(value.name)[1].lower()
            valid_extensions = ['.jpg', '.jpeg', '.png']
            if ext not in valid_extensions:
                raise serializers.ValidationError("Formato no admitido. La foto debe ser JPG o PNG.")
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError("La imagen excede el límite permitido de 2MB.")
        return value
