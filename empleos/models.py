from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class Usuario(AbstractUser):
    TIPO_USUARIO = (
        ('aspirante', 'Aspirante'),
        ('empresa', 'Empresa'),
        ('validador', 'Validador'), # <--- ¡NUEVO ROL AGREGADO!
    )
    tipo = models.CharField(max_length=20, choices=TIPO_USUARIO)
    telefono = models.CharField(max_length=15, blank=True)
    
    class Meta:
        db_table = 'usuarios'

class Empresa(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='empresa')
    nombre_empresa = models.CharField(max_length=200)
    sector = models.CharField(max_length=100)
    descripcion = models.TextField()
    sitio_web = models.URLField(blank=True)
    ubicacion = models.CharField(max_length=200)
    logo = models.URLField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'empresas'
    
    def __str__(self):
        return self.nombre_empresa


class Aspirante(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_aspirante')
    profesion = models.CharField(max_length=150, blank=True, null=True, help_text="Ej. Desarrollador Frontend, Data Scientist")
    experiencia_resumen = models.TextField(blank=True, null=True)
    
    # Activos profesionales
    cv = models.FileField(upload_to='cvs/', blank=True, null=True)
    foto = models.FileField(upload_to='fotos/', blank=True, null=True)
    
    # Aquí cubrimos el punto 3.3 (Competencias y Stack)
    habilidades = models.JSONField(default=list, blank=True, help_text="Lista de tecnologías que domina")
    
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aspirantes'

    def __str__(self):
        return f"Perfil de {self.usuario.username}"



class Vacante(models.Model):
    MODALIDAD_CHOICES = (
        ('remoto', 'Remoto'),
        ('presencial', 'Presencial'),
        ('hibrido', 'Híbrido'),
    )
    
    # <--- NUEVOS ESTADOS DE VALIDACIÓN --->
    ESTADO_VALIDACION_CHOICES = (
        ('pendiente', 'Pendiente de Revisión'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    )
    
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='vacantes')
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    requisitos = models.JSONField()
    salario_min = models.DecimalField(max_digits=10, decimal_places=2)
    salario_max = models.DecimalField(max_digits=10, decimal_places=2)
    ubicacion = models.CharField(max_length=200)
    modalidad = models.CharField(max_length=20, choices=MODALIDAD_CHOICES)
    
    # La vacante nace apagada y en estado 'pendiente' por defecto
    activa = models.BooleanField(default=False) 
    estado_validacion = models.CharField(max_length=20, choices=ESTADO_VALIDACION_CHOICES, default='pendiente')
    
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vacantes'
        ordering = ['-fecha_publicacion']
    
    def __str__(self):
        return f"{self.titulo} - {self.empresa.nombre_empresa} ({self.estado_validacion})"
    

class Aplicacion(models.Model):
    ESTADO_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('revisado', 'Revisado'),
        ('rechazado', 'Rechazado'),
        ('aceptado', 'Aceptado'),
    )
    
    vacante = models.ForeignKey(Vacante, on_delete=models.CASCADE, related_name='aplicaciones')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='aplicaciones')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_aplicacion = models.DateTimeField(auto_now_add=True)
    cv_url = models.URLField(blank=True, null=True)
    carta_presentacion = models.TextField(blank=True)
    
    class Meta:
        db_table = 'aplicaciones'
        unique_together = ['vacante', 'usuario']
        ordering = ['-fecha_aplicacion']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.vacante.titulo}"


class Plan(models.Model):

    TIPO_USUARIO = (
        ('aspirante', 'Aspirante'),
        ('empresa', 'Empresa'),
    )

    nombre = models.CharField(max_length=50)
    tipo_usuario = models.CharField(max_length=20, choices=TIPO_USUARIO)

    precio = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    max_postulaciones_dia = models.IntegerField(null=True, blank=True)
    max_candidatos = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.tipo_usuario})"


class Suscripcion(models.Model):

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)

    fecha_inicio = models.DateTimeField(default=timezone.now)
    fecha_fin = models.DateTimeField(null=True, blank=True)

    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.plan.nombre}"


class Notificacion(models.Model):

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)

    mensaje = models.TextField()

    leido = models.BooleanField(default=False)

    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notificación para {self.usuario.username}"


class Tecnologia(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tecnologias'

    def __str__(self):
        return self.nombre