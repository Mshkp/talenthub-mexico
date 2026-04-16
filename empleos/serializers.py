from rest_framework import serializers
from .models import Usuario, Empresa, Vacante, Aplicacion
from .models import Plan, Suscripcion, Notificacion
from .models import Aspirante
import os

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
    
    # 🔥 MAGIA PRO: Campo dinámico que busca el CV en tiempo real
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = Aplicacion
        fields = '__all__'

    def get_cv_url(self, obj):
        # Buscamos el perfil del aspirante que hizo esta postulación
        from .models import Aspirante
        try:
            perfil = Aspirante.objects.get(usuario=obj.usuario)
            if perfil.cv:
                # Armamos la URL absoluta para que no se rompa en React
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(perfil.cv.url)
                return perfil.cv.url
        except Aspirante.DoesNotExist:
            pass # Si no tiene perfil, regresamos nulo y React muestra la alerta
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # S-SDLC: Data Masking para protección de PII
        if instance.estado in ['revisado', 'aceptado']:
            data['usuario_email'] = instance.usuario.email
            data['usuario_telefono'] = instance.usuario.telefono
        else:
            data['usuario_email'] = None
            data['usuario_telefono'] = None
        return data

class AspiranteSerializer(serializers.ModelSerializer):
    # Inyección de URLs absolutas para evitar errores de carga en Frontend
    foto_url = serializers.SerializerMethodField()
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = Aspirante
        fields = '__all__'
        read_only_fields = ['usuario']

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
            return obj.foto.url
        return None

    def get_cv_url(self, obj):
        if obj.cv:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cv.url)
            return obj.cv.url
        return None

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