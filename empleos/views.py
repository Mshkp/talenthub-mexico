from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.authtoken.models import Token


from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta

import requests

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
# VACANTES (Unificado y Corregido)
# ==============================

class VacanteViewSet(viewsets.ModelViewSet):
    # ESTA LÍNEA EVITA EL ERROR DE "basename" EN LA TERMINAL
    queryset = Vacante.objects.all() 
    serializer_class = VacanteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        empresa_id = self.request.query_params.get('empresa')
        if empresa_id:
            # La empresa ve TODAS sus vacantes (activas e inactivas)
            return Vacante.objects.filter(empresa_id=empresa_id)
            
        # El público solo ve las activas
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
        queryset = super().get_queryset()
        usuario_id = self.request.query_params.get('usuario')
        empresa_id = self.request.query_params.get('empresa')

        # Si pregunta un aspirante, le damos solo sus postulaciones
        if usuario_id:
            return queryset.filter(usuario_id=usuario_id)
            
        # Si pregunta una empresa, le damos solo las de sus vacantes
        if empresa_id:
            return queryset.filter(vacante__empresa_id=empresa_id)

        return queryset




    def create(self, request, *args, **kwargs):
        usuario = request.user

        # --- 1. NUEVA LÓGICA: VERIFICAR Y AUTO-ADJUNTAR CV ---
        if usuario.tipo == 'aspirante':
            # Buscamos el perfil del aspirante
            perfil = Aspirante.objects.filter(usuario=usuario).first()
            
            # Si no tiene perfil o no ha subido su CV, lo bloqueamos
            if not perfil or not perfil.cv:
                return Response(
                    {"error": "CV_MISSING", "detail": "Debes subir tu CV en tu perfil antes de poder postularte."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Construimos la URL pública de su PDF para guardarla en la postulación
            cv_url_automatico = request.build_absolute_uri(perfil.cv.url)
        else:
            cv_url_automatico = ""

        # --- 2. LÓGICA ORIGINAL DE SUSCRIPCIONES ---
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

        # --- 3. GUARDAR LA POSTULACIÓN ---
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # MAGIA AQUÍ: Le inyectamos el cv_url_automatico sin que el usuario lo haya enviado
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
    try:
        order_id = request.data.get('order_id')
        plan_id = request.data.get('plan_id') # <--- Ahora recibimos qué plan compró
        
        access_token = get_paypal_access_token()
        url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        
        response = requests.post(url, headers=headers)
        capture_data = response.json()

        if capture_data.get('status') == 'COMPLETED':
            
            # ========================================================
            # 🎯 LÓGICA DE SUSCRIPCIÓN EN LA BASE DE DATOS
            # ========================================================
            usuario = request.user
            nuevo_plan = Plan.objects.get(id=plan_id)

            # 1. Desactivamos cualquier suscripción anterior (Upgrade/Downgrade)
            Suscripcion.objects.filter(usuario=usuario, activa=True).update(activa=False)

            # 2. Calculamos la vigencia (30 días a partir de hoy)
            fecha_fin = timezone.now() + timedelta(days=30)

            # 3. Creamos la nueva suscripción
            Suscripcion.objects.create(
                usuario=usuario,
                plan=nuevo_plan,
                fecha_inicio=timezone.now(),
                fecha_fin=fecha_fin,
                activa=True
            )

            # 4. Le mandamos una notificación de felicitación (Toque Pro)
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
    


# ============================================================================ #
# Credenciales de TalentHub Sandbox
PAYPAL_CLIENT_ID = "AekJ2ycu6mOuqPUg8IG97Z7KVb_tawnIH2V6gX6qzSPRh1ilpvFlgwFwVdrPzE_R3e6atC-jqbS49bvX"
PAYPAL_SECRET = "EI0yTmup4YKCwyMst6MgMGH3DScg3mJrb1m8xYfeim6btwtynOFALY0yiq7CrhHA08pNhxulWMerljo4"

def get_paypal_access_token():
    """Función auxiliar para pedirle permiso a PayPal antes de cobrar"""
    url = "https://api-m.sandbox.paypal.com/v1/oauth2/token"
    headers = {"Accept": "application/json", "Accept-Language": "es_MX"}
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET), headers=headers, data=data)
    return response.json()['access_token']

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_pago(request):
    try:
        # 1. Recibimos qué plan quiere comprar el usuario
        plan_id = request.data.get('plan_id')
        plan = Plan.objects.get(id=plan_id)

        # 2. Nos autenticamos con PayPal
        access_token = get_paypal_access_token()
        
        # 3. Le decimos a PayPal de cuánto va a ser el cobro
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
                    "value": str(plan.precio)  # El precio que tienes en la BD
                }
            }]
        }
        
        # 4. Hacemos la petición y devolvemos el ID de la orden a React
        response = requests.post(url, json=order_data, headers=headers)
        order = response.json()

        # ¡Este es el ID que React necesita para abrir la ventanita!
        return Response({"id": order['id']})
        
    except Exception as e:
        print("Error en crear_pago:", str(e))
        return Response({"error": str(e)}, status=500)
    



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mi_suscripcion(request):
    """Devuelve la suscripción activa del usuario actual"""
    try:
        suscripcion = Suscripcion.objects.filter(usuario=request.user, activa=True).first()
        if suscripcion:
            return Response({
                "plan": suscripcion.plan.nombre,
                "fecha_fin": suscripcion.fecha_fin,
            })
        # Si no tiene suscripción activa, por defecto es GRATIS
        return Response({"plan": "GRATIS", "fecha_fin": None})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancelar_suscripcion(request):
    """Cancela la suscripción actual y lo regresa al plan Gratis"""
    try:
        suscripcion = Suscripcion.objects.filter(usuario=request.user, activa=True).first()
        
        if suscripcion and suscripcion.plan.nombre.upper() != 'GRATIS':
            # 1. Desactivamos su plan de pago
            suscripcion.activa = False
            suscripcion.save()
            
            # 2. Le buscamos y asignamos el plan Gratis de su tipo de usuario
            plan_gratis = Plan.objects.filter(nombre__icontains='Gratis', tipo_usuario=request.user.tipo).first()
            if plan_gratis:
                Suscripcion.objects.create(
                    usuario=request.user,
                    plan=plan_gratis,
                    fecha_inicio=timezone.now(),
                    fecha_fin=None, # El gratis no expira
                    activa=True
                )
            
            return Response({"status": "success", "message": "Suscripción cancelada correctamente."})
        
        return Response({"error": "No tienes un plan de pago activo."}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vacantes_pendientes(request):
    """Devuelve solo las vacantes que están esperando aprobación"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso para ver esto"}, status=403)
    
    vacantes = Vacante.objects.filter(estado_validacion='pendiente').order_by('fecha_publicacion')
    
    # Armamos la lista a mano para asegurarnos de enviar el nombre de la empresa
    data = []
    for v in vacantes:
        data.append({
            "id": v.id,
            "titulo": v.titulo,
            "empresa_nombre": v.empresa.nombre_empresa, # Aquí sacamos el nombre real
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
    """Aprueba o rechaza una vacante"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso para hacer esto"}, status=403)
    
    try:
        vacante = Vacante.objects.get(pk=pk)
        accion = request.data.get('accion') # Esperamos 'aprobar' o 'rechazar'
        
        if accion == 'aprobar':
            vacante.estado_validacion = 'aprobada'
            vacante.activa = True  # Se enciende automáticamente al aprobar
        elif accion == 'rechazar':
            vacante.estado_validacion = 'rechazada'
            vacante.activa = False # Se queda apagada
        else:
            return Response({"error": "Acción no válida"}, status=400)
            
        vacante.save()
        return Response({"status": "success", "message": f"Vacante {accion}da con éxito"})
        
    except Vacante.DoesNotExist:
        return Response({"error": "Vacante no encontrada"}, status=404)
    

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def mi_perfil_aspirante(request):
    """Obtiene o actualiza el perfil del aspirante logueado"""
    if request.user.tipo != 'aspirante':
        return Response({"error": "Solo los aspirantes tienen este perfil."}, status=403)

    # TRUCO: Buscamos si ya tiene perfil, si no, lo creamos en blanco mágicamente
    perfil, created = Aspirante.objects.get_or_create(usuario=request.user)

    if request.method == 'GET':
        serializer = AspiranteSerializer(perfil)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = AspiranteSerializer(perfil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metricas_validador(request):
    """Devuelve las métricas generales para el panel del Validador"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso para ver esto"}, status=403)

    # Contamos todo en la base de datos
    total_usuarios = Usuario.objects.count()
    total_empresas = Empresa.objects.count()
    vacantes_activas = Vacante.objects.filter(activa=True, estado_validacion='aprobada').count()
    total_postulaciones = Aplicacion.objects.count()

    return Response({
        "total_usuarios": total_usuarios,
        "total_empresas": total_empresas,
        "vacantes_activas": vacantes_activas,
        "total_postulaciones": total_postulaciones
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios(request):
    """Auditoría de todos los usuarios registrados"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    # NUEVO FILTRO: Excluimos a los validadores Y a los superusuarios de la terminal
    usuarios = Usuario.objects.exclude(tipo='validador').exclude(is_superuser=True).values(
        'id', 'username', 'email', 'tipo', 'is_active', 'date_joined'
    ).order_by('-date_joined')
    
    return Response(usuarios)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suspender_usuario(request, pk):
    """Bloquear/Desbloquear acceso al sistema"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    try:
        usuario = Usuario.objects.get(pk=pk)
        
        # ESCUDO DE SEGURIDAD: Si intentan bloquear a un superusuario por URL, los rebotamos
        if usuario.is_superuser or usuario.tipo == 'validador':
            return Response({"error": "No puedes suspender a un administrador del sistema"}, status=403)

        # Invertimos su estado
        usuario.is_active = not usuario.is_active
        usuario.save()
        
        accion = "reactivado" if usuario.is_active else "bloqueado"
        return Response({"mensaje": f"Usuario {accion} correctamente", "is_active": usuario.is_active})
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historial_vacantes(request):
    """Verificación del estatus de cierre (Vacantes procesadas)"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    # Traemos todas las vacantes que YA NO están pendientes (aprobadas o rechazadas)
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
    """Punto 1.9: Mantenimiento del catálogo de tecnologías (Stack Oficial)"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)

    if request.method == 'GET':
        tecnologias = Tecnologia.objects.all().values('id', 'nombre').order_by('nombre')
        return Response(tecnologias)
    
    elif request.method == 'POST':
        nombre = request.data.get('nombre', '').strip()
        if not nombre:
            return Response({"error": "El nombre no puede estar vacío"}, status=400)
        
        # Guardamos la tecnología o avisamos si ya existe
        tech, created = Tecnologia.objects.get_or_create(nombre__iexact=nombre, defaults={'nombre': nombre})
        if not created:
            return Response({"error": "Esta tecnología ya existe en el catálogo"}, status=400)
        
        return Response({"id": tech.id, "nombre": tech.nombre}, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_tecnologia(request, pk):
    """Punto 1.9: Eliminar tecnología del catálogo"""
    if request.user.tipo != 'validador':
        return Response({"error": "No tienes permiso"}, status=403)
    try:
        tech = Tecnologia.objects.get(pk=pk)
        tech.delete()
        return Response({"mensaje": "Tecnología eliminada correctamente"})
    except Tecnologia.DoesNotExist:
        return Response({"error": "Tecnología no encontrada"}, status=404)