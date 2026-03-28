from rest_framework import serializers
from .models import Usuario, Empresa, Vacante, Aplicacion
from .models import Plan, Suscripcion, Notificacion
from .models import Aspirante

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