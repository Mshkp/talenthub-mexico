
# TalentHub México

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)

Bolsa de trabajo para el sector de TI en México. Las empresas publican
vacantes, los aspirantes se postulan con un CV gestionado por la plataforma, y
cada vacante pasa por revisión humana antes de hacerse pública.

Los datos de contacto del aspirante permanecen ocultos hasta que la empresa
avanza su proceso, de modo que una vacante no sirve para cosechar teléfonos y
correos.

[Read in English](README.en.md)

## Tres roles, tres tableros

| Rol | Qué puede hacer |
| --- | --- |
| **Aspirante** | Armar su perfil, subir CV, postularse y seguir cada postulación por Pendiente → En revisión → Aceptado / Rechazado |
| **Empresa** | Publicar, editar, pausar y reabrir vacantes; revisar postulaciones, descargar CVs y contratar un plan que amplía el alcance de una vacante |
| **Validador** | Aprobar o rechazar cada vacante antes de publicarse, suspender cuentas abusivas y mantener el catálogo de tecnologías que acepta la plataforma |

## Stack

**Frontend** — React 18, TypeScript, react-router-dom, Tailwind CSS
**Backend** — Django, Django REST Framework, autenticación por token, SDK de PayPal
**Datos** — PostgreSQL
**Infraestructura** — Azure para documentación y recursos; producción en Vercel y Render

## Seguridad

Tres medidas que vale la pena nombrar, porque moldearon el modelo de datos en
vez de agregarse encima:

**El contacto va enmascarado por defecto.** Los serializadores de DRF
devuelven el teléfono y el correo de un aspirante solo cuando la empresa ya
avanzó esa postulación. El campo no viene en la respuesta; no es que el
cliente lo tape.

**Los archivos se validan en el servidor.** Tope de 5 MB, solo `.pdf` para CVs
y solo `.jpg` / `.png` para fotos. La revisión corre en el backend, así que se
sostiene aunque la petición no venga de la aplicación web.

**Los permisos se verifican por vista**, incluido el rol, de manera que un
token válido de un rol no alcanza los endpoints de otro.

## Correrlo en local

```bash
git clone https://github.com/yeu-dev/talenthub-mexico.git
cd talenthub-mexico
```

### Backend

Crea un `.env` en la raíz del repositorio. Las credenciales de producción no
están en el repo — pídeselas a quien lo mantiene si las necesitas.

```env
DB_NAME=nombre_de_la_bd
DB_USER=usuario_de_la_bd
DB_PASSWORD=contrasena_de_la_bd
DB_HOST=host_de_la_bd.supabase.com
DB_PORT=6543

EMAIL_HOST_USER=usuario_smtp
EMAIL_HOST_PASSWORD=contrasena_smtp

SECRET_KEY=clave_secreta_de_django
DJANGO_DEBUG=True
USE_SQLITE=True
```

`USE_SQLITE=True` se salta PostgreSQL y corre contra un archivo local, así que
las primeras cuatro variables solo hacen falta cuando quieres apuntar a la
base real.

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Equipo

**Yeudiel González** — Lead Fullstack Developer & Software Architect
Arquitectura de software, backend en Django, integración de pagos e interfaz
en React/TypeScript.

**Luis Díaz** — Cloud Infrastructure & Technical Documentation
Wiki del proyecto, despliegues y gestión de recursos en Azure.

**Jaziel Arana** — Product Manager & QA Analyst
Flujo de usuario, testing de componentes y validación de las reglas de negocio
del sistema.

---

Hecho en Puebla, México.
````
