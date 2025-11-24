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
        usuario = Usuario.objects.create(
            username=request.data['username'],
            email=request.data['email'],
            password=make_password(request.data['password']),
            tipo=request.data['tipo'],
            telefono=request.data.get('telefono', '')
        )
        return Response({'message': 'Usuario creado exitosamente'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)