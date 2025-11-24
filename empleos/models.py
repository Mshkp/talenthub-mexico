from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    TIPO_USUARIO = (
        ('aspirante', 'Aspirante'),
        ('empresa', 'Empresa'),
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

class Vacante(models.Model):
    MODALIDAD_CHOICES = (
        ('remoto', 'Remoto'),
        ('presencial', 'Presencial'),
        ('hibrido', 'Híbrido'),
    )
    
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='vacantes')
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    requisitos = models.JSONField()
    salario_min = models.DecimalField(max_digits=10, decimal_places=2)
    salario_max = models.DecimalField(max_digits=10, decimal_places=2)
    ubicacion = models.CharField(max_length=200)
    modalidad = models.CharField(max_length=20, choices=MODALIDAD_CHOICES)
    activa = models.BooleanField(default=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vacantes'
        ordering = ['-fecha_publicacion']
    
    def __str__(self):
        return f"{self.titulo} - {self.empresa.nombre_empresa}"

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
    fecha_aplicacion = models.DateTimeField(auto_now_add=True)
    cv_url = models.URLField(blank=True, null=True)
    carta_presentacion = models.TextField(blank=True)
    
    class Meta:
        db_table = 'aplicaciones'
        unique_together = ['vacante', 'usuario']
        ordering = ['-fecha_aplicacion']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.vacante.titulo}"