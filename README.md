
# 🚀 TalentHub México

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)

**TalentHub México** es un observatorio y portal de empleos especializado en el sector de Tecnologías de la Información (TI). Conecta a empresas con los mejores talentos del país mediante una plataforma segura, intuitiva y basada en roles.

---

## ✨ Características Principales

El sistema está diseñado con una arquitectura de **3 Roles Principales**, cada uno con su propio dashboard y permisos específicos:

### 👨‍💻 Aspirantes
* **Creación de Perfil Profesional:** Gestión de CVs (con validación estricta de PDFs) y catálogo de habilidades.
* **Postulaciones Seguras:** Data Masking implementado. Los datos de contacto (teléfono/email) permanecen ocultos hasta que la empresa avanza el proceso del candidato.
* **Seguimiento de Estado:** Monitoreo en tiempo real de las aplicaciones (Pendiente, En Revisión, Aceptado, Rechazado).

### 🏢 Empresas
* **Gestión de Vacantes:** Creación, edición, pausa y reapertura de ofertas laborales.
* **Dashboard de Reclutamiento:** Panel responsivo para revisar postulaciones, descargar CVs y contactar talento.
* **Planes y Suscripciones:** Integración con **PayPal Checkout** para adquirir planes premium que mejoran el alcance de las vacantes.

### 🛡️ Validadores (Admin)
* **Auditoría de Calidad:** Revisión y aprobación manual de cada vacante antes de ser pública.
* **Mando de Seguridad:** Capacidad para suspender o reactivar usuarios maliciosos.
* **Mantenimiento del Sistema:** Gestión del catálogo oficial de tecnologías (Stack) permitido en la plataforma.

---

## 🛠️ Stack Tecnológico

**Frontend:**
* [React 18](https://reactjs.org/) con [TypeScript](https://www.typescriptlang.org/)
* Enrutamiento con `react-router-dom`
* Estilos rápidos y responsivos con [Tailwind CSS](https://tailwindcss.com/)

**Backend:**
* [Django](https://www.djangoproject.com/) y [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
* Autenticación basada en Tokens (`authtoken`)
* Integración con SDK de PayPal para pagos.
* Recuperación de contraseñas mediante tokens seguros por email.

**Base de Datos y Cloud:**
* Base de Datos Relacional (PostgreSQL)
* Infraestructura y documentación gestionada en **Microsoft Azure**
* Despliegue en producción automatizado (Vercel / Render)

---

## 🔒 Seguridad (S-SDLC Implementado)

Este proyecto toma en serio la seguridad de la información:
* **Prevención de Fuga de Datos (DLP):** Serializadores condicionales en DRF que ocultan PII (Información Personal Identificable) de los aspirantes hasta que haya un interés mutuo.
* **Validación de Archivos:** Filtros estrictos en backend para peso (Max 5MB) y extensión (solo `.pdf` para CVs y `.jpg/.png` para fotos) previniendo subidas maliciosas.
* **Control de Acceso:** Permisos estrictos por Vistas (`IsAuthenticated`, verificación de roles) para evitar escalamiento de privilegios.

---

## 💻 Instalación en Local

Si deseas correr este proyecto en tu entorno de desarrollo, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/talenthub-mexico.git](https://github.com/tu-usuario/talenthub-mexico.git)
cd talenthub-mexico
```

### 2. Configurar el Backend (Django)
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Configurar el Frontend (React)
```bash
cd frontend
npm install
npm start
```

---

## 👥 Equipo de Desarrollo

Este proyecto fue planeado, diseñado y desarrollado colaborativamente por:

* **Yeudiel González** - *Lead Fullstack Developer & Software Architect*
  > Lideró la arquitectura de software, el desarrollo del backend en Django, la integración de pagos, y la construcción de la interfaz en React/TypeScript.
* **Luis Diaz** - *Cloud Infrastructure & Technical Documentation*
  > Encargado de la estructura de la Wiki del proyecto, despliegues y gestión de recursos en entornos de nube (Azure).
* **Jaziel Arana** - *Product Manager & QA Analyst*
  > Responsable del flujo de usuario, control de calidad (testing de componentes) y validación de las reglas de negocio del sistema.

---

*Desarrollado con ☕ y código en Puebla, México.*
