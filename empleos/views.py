from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta

import requests
import json

# Esto le dice a Django: "Trae el modelo de usuarios que estemos usando en este proyecto"
User = get_user_model()

from .models import (
    Usuario,
    Empresa,
    Vacante,
    Aplicacion,
    Plan,
    Suscripcion,
    Notificacion,
    Aspirante,
    Tecnologia,
)

from .serializers import (
    UsuarioSerializer,
    EmpresaSerializer,
    VacanteSerializer,
    AplicacionSerializer,
    PlanSerializer,
    SuscripcionSerializer,
    NotificacionSerializer,
    AspiranteSerializer,
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
# VACANTES
# ==============================

class VacanteViewSet(viewsets.ModelViewSet):
    queryset = Vacante.objects.all() 
    serializer_class = VacanteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        empresa_id = self.request.query_params.get('empresa')
        if empresa_id:
            return Vacante.objects.filter(empresa_id=empresa_id)
            
        return Vacante.objects.filter(activa=True)

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
        usuario = self.request.user

        if usuario.tipo == 'aspirante':
            return Aplicacion.objects.filter(usuario=usuario)
        
        elif usuario.tipo == 'empresa':
            vacantes_empresa = Vacante.objects.filter(empresa__usuario=usuario)
            return Aplicacion.objects.filter(vacante__in=vacantes_empresa)
            
        elif usuario.tipo == 'validador' or usuario.is_superuser:
            return Aplicacion.objects.all()
            
        return Aplicacion.objects.none()

    def create(self, request, *args, **kwargs):
        usuario = request.user

        if usuario.tipo == 'aspirante':
            perfil = Aspirante.objects.filter(usuario=usuario).first()
            if not perfil or not perfil.cv:
                return Response(
                    {"error": "CV_MISSING", "detail": "Debes subir tu CV en tu perfil antes de poder postularte."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cv_url_automatico = request.build_absolute_uri(perfil.cv.url)
        else:
            cv_url_automatico = ""

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
                    {"detail": "Has alcanzado el límite de postulaciones diarias de tu plan."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(usuario=usuario, cv_url=cv_url_automatico)

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
        'tipo': user.tipo,
        'telefono': user.telefono
    })

# ==============================
# PLANES Y SUSCRIPCIONES
# ==============================

class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]

class SuscripcionViewSet(viewsets.ModelViewSet):
    queryset = Suscripcion.objects.all()
    serializer_class = SuscripcionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

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
def capturar_pago(request):
    try:
        order_id = request.data.get('order_id')
        plan_id = request.data.get('plan_id') 
        
        access_token = get_paypal_access_token()
        url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        
        response = requests.post(url, headers=headers)
        capture_data = response.json()

        if capture_data.get('status') == 'COMPLETED':
            usuario = request.user
            nuevo_plan = Plan.objects.get(id=plan_id)

            Suscripcion.objects.filter(usuario=usuario, activa=True).update(activa=False)
            fecha_fin = timezone.now() + timedelta(days=30)

            Suscripcion.objects.create(
                usuario=usuario,
                plan=nuevo_plan,
                fecha_inicio=timezone.now(),
                fecha_fin=fecha_fin,
                activa=True
            )

            Notificacion.objects.create(
                usuario=usuario,
                mensaje=f"¡Tu pago fue procesado! Tu cuenta ha sido mejorada al plan {nuevo_plan.nombre}. Tienes acceso hasta el {fecha_fin.strftime('%d/%m/%Y')}."
            )
            
            return Response({
                "status": "success", 
                "message": "Suscripción activada con éxito"
            })
        else:
            return Response({"error": "El pago no se pudo completar", "details": capture_data}, status=400)

    except Exception as e:
        print("Error en capturar_pago:", str(e))
        return Response({"error": str(e)}, status=500)

PAYPAL_CLIENT_ID = "AekJ2ycu6mOuqPUg8IG97Z7KVb_tawnIH2V6gX6qzSPRh1ilpvFlgwFwVdrPzE_R3e6atC-jqbS49bvX"
PAYPAL_SECRET = "EI0yTmup4YKCwyMst6MgMGH3DScg3mJrb1m8xYfeim6btwtynOFALY0yiq7CrhHA08pNhxulWMerljo4"

def get_paypal_access_token():
    url = "https://api-m.sandbox.paypal.com/v1/oauth2/token"
    headers = {"Accept": "application/json", "Accept-Language": "es_MX"}
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET), headers=headers, data=data)
    return response.json()['access_token']

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_pago(request):
    try:
        plan_id = request.data.get('plan_id')
        plan = Plan.objects.get(id=plan_id)
        access_token = get_paypal_access_token()
        
        url = "https://api-m.sandbox.paypal.com/v2/checkout/orders"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "MXN",
                    "value": str(plan.precio) 
                }
            }]
        }
        
        response = requests.post(url, json=order_data, headers=headers)
        order = response.json()
        return Response({"id": order['id']})
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mi_suscripcion(request):
    try:
        suscripcion = Suscripcion.objects.filter(usuario=request.user, activa=True).first()
        if suscripcion:
            return Response({
                "plan": suscripcion.plan.nombre,
                "fecha_fin": suscripcion.fecha_fin,
            })
        return Response({"plan": "GRATIS", "fecha_fin": None})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancelar_suscripcion(request):
    try:
        suscripcion = Suscripcion.objects.filter(usuario=request.user, activa=True).first()
        
        if suscripcion and suscripcion.plan.nombre.upper() != 'GRATIS':
            suscripcion.activa = False
            suscripcion.save()
            
            plan_gratis = Plan.objects.filter(nombre__icontains='Gratis', tipo_usuario=request.user.tipo).first()
            if plan_gratis:
                Suscripcion.objects.create(
                    usuario=request.user,
                    plan=plan_gratis,
                    fecha_inicio=timezone.now(),
                    fecha_fin=None,
                    activa=True
                )
            return Response({"status": "success", "message": "Suscripción cancelada correctamente."})
        
        return Response({"error": "No tienes un plan de pago activo."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ==============================
# VALIDADOR Y ADMIN
# ==============================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vacantes_pendientes(request):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso para ver esto"}, status=403)
    
    vacantes = Vacante.objects.filter(estado_validacion='pendiente').order_by('fecha_publicacion')
    data = []
    for v in vacantes:
        data.append({
            "id": v.id,
            "titulo": v.titulo,
            "empresa_nombre": v.empresa.nombre_empresa,
            "descripcion": v.descripcion,
            "salario_min": v.salario_min,
            "salario_max": v.salario_max,
            "modalidad": v.modalidad,
            "fecha_publicacion": v.fecha_publicacion
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validar_vacante(request, pk):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso para hacer esto"}, status=403)
    try:
        vacante = Vacante.objects.get(pk=pk)
        accion = request.data.get('accion')
        
        if accion == 'aprobar':
            vacante.estado_validacion = 'aprobada'
            vacante.activa = True
        elif accion == 'rechazar':
            vacante.estado_validacion = 'rechazada'
            vacante.activa = False
        else:
            return Response({"error": "Acción no válida"}, status=400)
            
        vacante.save()
        return Response({"status": "success", "message": f"Vacante {accion}da con éxito"})
        
    except Vacante.DoesNotExist:
        return Response({"error": "Vacante no encontrada"}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metricas_validador(request):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso para ver esto"}, status=403)

    return Response({
        "total_usuarios": Usuario.objects.count(),
        "total_empresas": Empresa.objects.count(),
        "vacantes_activas": Vacante.objects.filter(activa=True, estado_validacion='aprobada').count(),
        "total_postulaciones": Aplicacion.objects.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios(request):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    usuarios = Usuario.objects.exclude(tipo='validador').exclude(is_superuser=True).values(
        'id', 'username', 'email', 'tipo', 'is_active', 'date_joined'
    ).order_by('-date_joined')
    
    return Response(usuarios)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suspender_usuario(request, pk):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    try:
        usuario = Usuario.objects.get(pk=pk)
        if usuario.is_superuser or usuario.tipo == 'validador':
            return Response({"error": "No puedes suspender a un administrador del sistema"}, status=403)

        usuario.is_active = not usuario.is_active
        usuario.save()
        
        accion = "reactivado" if usuario.is_active else "bloqueado"
        return Response({"mensaje": f"Usuario {accion} correctamente", "is_active": usuario.is_active})
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historial_vacantes(request):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    vacantes = Vacante.objects.exclude(estado_validacion='pendiente').order_by('-fecha_publicacion')
    data = []
    for v in vacantes:
        data.append({
            "id": v.id,
            "titulo": v.titulo,
            "empresa_nombre": v.empresa.nombre_empresa,
            "estado_validacion": v.estado_validacion,
            "activa": v.activa,
            "fecha_publicacion": v.fecha_publicacion
        })
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def catalogo_tecnologias(request):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    if request.method == 'GET':
        tecnologias = Tecnologia.objects.all().values('id', 'nombre').order_by('nombre')
        return Response(tecnologias)
    
    elif request.method == 'POST':
        nombre = request.data.get('nombre', '').strip()
        if not nombre:
            return Response({"error": "El nombre no puede estar vacío"}, status=400)
        
        tech, created = Tecnologia.objects.get_or_create(nombre__iexact=nombre, defaults={'nombre': nombre})
        if not created:
            return Response({"error": "Esta tecnología ya existe en el catálogo"}, status=400)
        
        return Response({"id": tech.id, "nombre": tech.nombre}, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_tecnologia(request, pk):
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)
    try:
        tech = Tecnologia.objects.get(pk=pk)
        tech.delete()
        return Response({"mensaje": "Tecnología eliminada correctamente"})
    except Tecnologia.DoesNotExist:
        return Response({"error": "Tecnología no encontrada"}, status=404)

# ==============================
# RECUPERACIÓN DE CONTRASEÑA
# ==============================

@api_view(['POST'])
def solicitar_recuperacion_password(request):
    correo = request.data.get('email')
    
    if not correo:
        return Response({"error": "Debes proporcionar un correo electrónico."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=correo)
    except User.DoesNotExist:
        return Response({"mensaje": "Si el correo coincide con una cuenta, enviaremos un enlace."}, status=status.HTTP_200_OK)
    
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    
    frontend_url = "https://www.talent-hub.me/restablecer-password" 
    enlace_recuperacion = f"{frontend_url}/{uid}/{token}/"
    
    asunto = "Recuperación de contraseña - TalentHub"
    mensaje = f"Hola,\n\nRecibimos una solicitud para restablecer tu contraseña en TalentHub.\n\nHaz clic en el siguiente enlace para crear una nueva:\n{enlace_recuperacion}\n\nSi no solicitaste esto, puedes ignorar este correo sin problema."
    
    try:
        send_mail(
            asunto,
            mensaje,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return Response({"mensaje": "Si el correo coincide con una cuenta, enviaremos un enlace."}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"ERROR DE CORREO: {e}") 
        return Response({"error": "Hubo un problema al enviar el correo desde el servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def confirmar_nueva_password(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    nueva_password = request.data.get('new_password')
    
    if not all([uidb64, token, nueva_password]):
        return Response({"error": "Faltan datos requeridos."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
        
    if user is not None and default_token_generator.check_token(user, token):
        user.set_password(nueva_password)
        user.save()
        return Response({"mensaje": "¡Contraseña actualizada con éxito!"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "El enlace de recuperación no es válido o ya expiró."}, status=status.HTTP_400_BAD_REQUEST)

# ==============================
# PERFIL DEL ASPIRANTE (LÓGICA UNIFICADA Y CORREGIDA)
# ==============================

@api_view(['GET', 'POST']) # 🔥 AHORA ACEPTA POST PARA SUBIR ARCHIVOS CORRECTAMENTE
@permission_classes([IsAuthenticated])
def mi_perfil_aspirante(request):
    """Obtiene o actualiza el perfil del aspirante logueado"""
    if request.user.tipo != 'aspirante':
        return Response({"error": "Solo los aspirantes tienen este perfil."}, status=403)

    perfil, created = Aspirante.objects.get_or_create(usuario=request.user)
    usuario = request.user

    if request.method == 'GET':
        # Pasamos el request en el contexto para asegurar URLs absolutas en las fotos y PDFs
        serializer = AspiranteSerializer(perfil, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        
        # 1. ACTUALIZAR CUENTA PRINCIPAL (Correo y Teléfono)
        email = request.data.get('email')
        telefono = request.data.get('telefono')
        
        cambios_usuario = False
        if email and email != usuario.email:
            usuario.email = email
            cambios_usuario = True
            
        if telefono is not None and telefono != usuario.telefono:
            usuario.telefono = telefono
            cambios_usuario = True
            
        if cambios_usuario:
            usuario.save()

        # 2. S-SDLC FIX: Evitar el "QueryDict Trap" de los forms de Django
        data = {key: request.data.get(key) for key in request.data.keys()}
        
        # Procesamos las habilidades si vienen como JSON (ej: '["React", "Python"]')
        if 'habilidades' in data and isinstance(data['habilidades'], str):
            try:
                data['habilidades'] = json.loads(data['habilidades'])
            except json.JSONDecodeError:
                pass # Si falla, se queda el string nativo

        # 3. GUARDAR EL PERFIL DEL ASPIRANTE (Archivos y textos)
        serializer = AspiranteSerializer(perfil, data=data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        
        # 1. ACTUALIZAR CUENTA PRINCIPAL (Username, Correo y Teléfono)
        username = request.data.get('username')  # <--- NUEVO
        email = request.data.get('email')
        telefono = request.data.get('telefono')
        
        cambios_usuario = False
        
        # --- BLOQUE NUEVO PARA EL USERNAME ---
        if username and username != usuario.username:
            usuario.username = username
            cambios_usuario = True
        # -------------------------------------

        if email and email != usuario.email:
            usuario.email = email
            cambios_usuario = True
            
        if telefono is not None and telefono != usuario.telefono:
            usuario.telefono = telefono
            cambios_usuario = True
            
        if cambios_usuario:
            usuario.save()