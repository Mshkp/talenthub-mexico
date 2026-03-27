from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.authtoken.models import Token

from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from django.db.models import Avg, Count
from django.utils import timezone

import requests

from .models import (
    Usuario,
    Empresa,
    Vacante,
    Aplicacion,
    Plan,
    Suscripcion,
    Notificacion
)

from .serializers import (
    UsuarioSerializer,
    EmpresaSerializer,
    VacanteSerializer,
    AplicacionSerializer,
    PlanSerializer,
    SuscripcionSerializer,
    NotificacionSerializer
)

from .paypal_config import get_access_token


# ==============================
# LOGIN
# ==============================

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):

    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Credenciales incorrectas"},
            status=status.HTTP_400_BAD_REQUEST
        )

    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "id": user.id,
        "username": user.username,
        "tipo": user.tipo
    })


# ==============================
# REGISTER
# ==============================

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

        if request.data['tipo'] == 'empresa':

            Empresa.objects.create(
                usuario=usuario,
                nombre_empresa=request.data.get('nombre_empresa', request.data['username']),
                sector='Tecnología',
                descripcion='Empresa registrada en TalentHub México',
                ubicacion='México',
                sitio_web=''
            )

        return Response({
            'message': 'Usuario creado exitosamente',
            'tipo': usuario.tipo
        }, status=status.HTTP_201_CREATED)

    except Exception as e:

        return Response(
            {'message': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


# ==============================
# VACANTES (Unificado y Corregido)
# ==============================

class VacanteViewSet(viewsets.ModelViewSet):
    # ESTA LÍNEA EVITA EL ERROR DE "basename" EN LA TERMINAL
    queryset = Vacante.objects.all() 
    serializer_class = VacanteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Filtro base: Solo mostrar las vacantes que están activas
        queryset = Vacante.objects.filter(activa=True)
        
        # Filtro adicional: Si se busca por una empresa en específico
        empresa_id = self.request.query_params.get('empresa')
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

# ==============================
# EMPRESAS
# ==============================

class EmpresaViewSet(viewsets.ModelViewSet):

    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        queryset = Empresa.objects.all()
        usuario_id = self.request.query_params.get('usuario')

        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)

        return queryset


# ==============================
# APLICACIONES
# ==============================

class AplicacionViewSet(viewsets.ModelViewSet):

    queryset = Aplicacion.objects.all()
    serializer_class = AplicacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.tipo == 'empresa':

            return Aplicacion.objects.filter(
                vacante__empresa__usuario=self.request.user
            )

        return Aplicacion.objects.filter(usuario=self.request.user)


    def create(self, request, *args, **kwargs):

        usuario = request.user

        suscripcion = Suscripcion.objects.filter(
            usuario=usuario,
            activa=True
        ).first()

        if suscripcion and suscripcion.plan.max_postulaciones_dia:

            hoy = timezone.now().date()

            postulaciones_hoy = Aplicacion.objects.filter(
                usuario=usuario,
                fecha_creacion__date=hoy
            ).count()

            if postulaciones_hoy >= suscripcion.plan.max_postulaciones_dia:

                return Response(
                    {"error": "Has alcanzado el límite de postulaciones diarias de tu plan."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(usuario=usuario)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


    def update(self, request, *args, **kwargs):

        instance = self.get_object()
        estado_anterior = instance.estado

        response = super().update(request, *args, **kwargs)

        instance.refresh_from_db()

        if estado_anterior != instance.estado:

            mensaje = ""

            if instance.estado == "revisado":
                mensaje = f"Tu postulación a '{instance.vacante.titulo}' ha sido revisada."

            elif instance.estado == "aceptado":
                mensaje = f"¡Felicidades! Has sido aceptado para la vacante '{instance.vacante.titulo}'."

            elif instance.estado == "rechazado":
                mensaje = f"Tu postulación a '{instance.vacante.titulo}' fue rechazada."

            if mensaje:

                Notificacion.objects.create(
                    usuario=instance.usuario,
                    mensaje=mensaje
                )

        return response


# ==============================
# USER INFO
# ==============================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):

    user = request.user

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'tipo': user.tipo
    })


# ==============================
# PLANES
# ==============================

class PlanViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]


# ==============================
# SUSCRIPCIONES
# ==============================

class SuscripcionViewSet(viewsets.ModelViewSet):

    queryset = Suscripcion.objects.all()
    serializer_class = SuscripcionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        serializer.save(usuario=self.request.user)


# ==============================
# NOTIFICACIONES
# ==============================

class NotificacionViewSet(viewsets.ModelViewSet):

    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notificacion.objects.filter(
            usuario=self.request.user
        ).order_by('-fecha')


# ==============================
# PAYPAL
# ==============================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_pago(request):

    plan_id = request.data.get("plan_id")
    plan = Plan.objects.get(id=plan_id)

    access_token = get_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "MXN",
                "value": str(plan.precio)
            }
        }]
    }

    response = requests.post(
        "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        headers=headers,
        json=data
    )

    return Response(response.json())


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def capturar_pago(request):

    order_id = request.data.get("orderID")
    plan_id = request.data.get("plan_id")

    access_token = get_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.post(
        f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture",
        headers=headers
    )

    if response.status_code == 201:

        plan = Plan.objects.get(id=plan_id)

        Suscripcion.objects.create(
            usuario=request.user,
            plan=plan,
            activa=True
        )

        return Response({"message": "Pago exitoso"})

    return Response(
        {"error": "Pago fallido"},
        status=400
    )