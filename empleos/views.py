from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count
from .models import Usuario, Empresa, Vacante, Aplicacion
from .serializers import UsuarioSerializer, EmpresaSerializer, VacanteSerializer, AplicacionSerializer

class VacanteViewSet(viewsets.ModelViewSet):
    queryset = Vacante.objects.filter(activa=True)
    serializer_class = VacanteSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        stats = {
            'total_vacantes': Vacante.objects.filter(activa=True).count(),
            'salario_promedio': Vacante.objects.aggregate(Avg('salario_min'))['salario_min__avg'],
            'por_modalidad': Vacante.objects.values('modalidad').annotate(count=Count('id'))
        }
        return Response(stats)

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny]

class AplicacionViewSet(viewsets.ModelViewSet):
    queryset = Aplicacion.objects.all()
    serializer_class = AplicacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.tipo == 'empresa':
            # Las empresas ven las aplicaciones a sus vacantes
            return Aplicacion.objects.filter(vacante__empresa__usuario=self.request.user)
        else:
            # Los aspirantes ven solo sus aplicaciones
            return Aplicacion.objects.filter(usuario=self.request.user)
        

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        # Crear usuario
        usuario = Usuario.objects.create(
            username=request.data['username'],
            email=request.data['email'],
            password=make_password(request.data['password']),
            tipo=request.data['tipo'],
            telefono=request.data.get('telefono', '')
        )
        
        # Si es empresa, crear registro en tabla Empresa
        if request.data['tipo'] == 'empresa':
            Empresa.objects.create(
                usuario=usuario,
                nombre_empresa=request.data.get('nombre_empresa', request.data['username']),
                sector='Tecnología',  # Default
                descripcion='Empresa registrada en TalentHub México',
                ubicacion='México',
                sitio_web='',
            )
        
        return Response({
            'message': 'Usuario creado exitosamente',
            'tipo': usuario.tipo
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    


from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Actualiza la clase VacanteViewSet:
class VacanteViewSet(viewsets.ModelViewSet):
    queryset = Vacante.objects.all()  # Agregar esta línea de vuelta
    serializer_class = VacanteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Vacante.objects.filter(activa=True)
        empresa_id = self.request.query_params.get('empresa', None)
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        stats = {
            'total_vacantes': Vacante.objects.filter(activa=True).count(),
            'salario_promedio': Vacante.objects.aggregate(Avg('salario_min'))['salario_min__avg'],
            'por_modalidad': Vacante.objects.values('modalidad').annotate(count=Count('id'))
        }
        return Response(stats)
    

from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'tipo': user.tipo,
    })