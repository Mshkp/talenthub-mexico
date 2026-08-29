# TalentHub México

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)

A job board for the Mexican IT sector. Companies post openings, applicants
apply with a managed CV, and every posting is reviewed by a human before it
goes public.

Applicant contact details stay hidden until a company advances the candidate,
so a posting cannot be used to harvest phone numbers and emails.

[Leer en español](README.md)

## Three roles, three dashboards

| Role | What they can do |
| --- | --- |
| **Applicant** | Build a profile, upload a CV, apply, and track each application through Pending → In review → Accepted / Rejected |
| **Company** | Post, edit, pause and reopen openings; review applications, download CVs, and buy a plan that widens a posting's reach |
| **Validator** | Approve or reject every posting before publication, suspend abusive accounts, and maintain the catalog of technologies the platform accepts |

## Stack

**Frontend** — React 18, TypeScript, react-router-dom, Tailwind CSS
**Backend** — Django, Django REST Framework, token authentication, PayPal SDK
**Data** — PostgreSQL
**Infrastructure** — Azure for documentation and resources; production deploys on Vercel and Render

## Security

Three measures worth naming, because they shaped the data model rather than
being added on top:

**Contact details are masked by default.** DRF serializers return an
applicant's phone and email only once the company has advanced that
application. The field is absent from the payload, not blanked in the client.

**Uploads are validated server-side.** 5 MB cap, `.pdf` only for CVs and
`.jpg` / `.png` only for photos. The check runs in the backend, so it holds
even when the request does not come from the web app.

**Permissions are checked per view**, including the role, so a valid token for
one role cannot reach another role's endpoints.

## Running it locally

```bash
git clone https://github.com/yeu-dev/talenthub-mexico.git
cd talenthub-mexico
```

### Backend

Create a `.env` at the repository root. Production credentials are not in the
repo — ask the maintainer if you need them.

```env
DB_NAME=database_name
DB_USER=database_user
DB_PASSWORD=database_password
DB_HOST=database_host.supabase.com
DB_PORT=6543

EMAIL_HOST_USER=smtp_user
EMAIL_HOST_PASSWORD=smtp_password

SECRET_KEY=django_secret_key
DJANGO_DEBUG=True
USE_SQLITE=True
```

`USE_SQLITE=True` skips PostgreSQL and runs against a local file, so the first
four variables are only needed when you want to point at the real database.

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

## Team

**Yeudiel González** — Lead Fullstack Developer & Software Architect
Software architecture, Django backend, payment integration, and the
React/TypeScript interface.

**Luis Díaz** — Cloud Infrastructure & Technical Documentation
Project wiki, deployments, and Azure resource management.

**Jaziel Arana** — Product Manager & QA Analyst
User flow, component testing, and validation of the system's business rules.

---

Built in Puebla, México.
````
