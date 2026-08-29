import React from 'react';
import { Link } from 'react-router-dom';

const PoliticasPrivacidad: React.FC = () => {
  const secciones = [
    {
      titulo: '1. Responsable del tratamiento de datos',
      contenido: [
        'TalentHub México es responsable del tratamiento de los datos personales que se recaban a través de esta plataforma digital. Este aviso aplica a aspirantes, empresas, validadores y cualquier persona que utilice nuestros servicios web.',
        'La plataforma tiene como finalidad conectar talento tecnológico con empresas que publican oportunidades laborales verificadas en México.'
      ]
    },
    {
      titulo: '2. Datos personales que recopilamos',
      contenido: [
        'Podemos recopilar datos de identificación y contacto como nombre de usuario, correo electrónico, teléfono, contraseña cifrada y tipo de cuenta.',
        'En el caso de aspirantes, podemos tratar información profesional como currículum vitae, fotografía de perfil, experiencia laboral, tecnologías, postulaciones realizadas y estado de sus procesos.',
        'En el caso de empresas, podemos tratar datos relacionados con el nombre de la empresa, vacantes publicadas, descripciones de puestos, rangos salariales, planes contratados e historial de postulaciones recibidas.'
      ]
    },
    {
      titulo: '3. Finalidades principales',
      contenido: [
        'Usamos la información para crear y administrar cuentas, permitir el inicio de sesión, publicar y consultar vacantes, gestionar postulaciones, validar ofertas laborales, mostrar perfiles profesionales y facilitar la comunicación entre aspirantes y empresas cuando el flujo de la plataforma lo permita.',
        'También utilizamos los datos para operar funciones de seguridad, recuperación de contraseña, notificaciones, validación de vacantes, control de acceso por tipo de usuario y prevención de uso indebido de la plataforma.'
      ]
    },
    {
      titulo: '4. Protección de información personal y visibilidad de datos',
      contenido: [
        'TalentHub México procura limitar la exposición de datos personales de contacto durante las etapas iniciales de evaluación. La información visible para empresas y aspirantes depende del tipo de cuenta, permisos internos y estado del proceso dentro de la plataforma.',
        'Las empresas pueden consultar información profesional necesaria para evaluar candidaturas, pero la plataforma evita publicar datos sensibles que no sean necesarios para el funcionamiento del servicio.'
      ]
    },
    {
      titulo: '5. Pagos, planes y proveedores externos',
      contenido: [
        'Cuando una empresa contrata planes o servicios de publicación, el procesamiento de pagos puede realizarse mediante proveedores externos como PayPal. TalentHub México no almacena datos completos de tarjetas bancarias dentro de la aplicación.',
        'La plataforma puede operar sobre infraestructura tecnológica de terceros, incluyendo servicios de alojamiento, despliegue, almacenamiento y monitoreo como Render y Vercel. Estos proveedores pueden procesar información técnica necesaria para mantener el servicio disponible y seguro.'
      ]
    },
    {
      titulo: '6. Transferencias y acceso por terceros',
      contenido: [
        'No vendemos datos personales. Podemos compartir información únicamente cuando sea necesario para prestar el servicio, cumplir obligaciones legales, atender solicitudes de autoridad competente, procesar pagos, alojar la plataforma o proteger la seguridad de usuarios y sistemas.',
        'Los proveedores tecnológicos y de pago actúan bajo sus propios términos y políticas, por lo que recomendamos revisar sus avisos de privacidad cuando se interactúe directamente con sus servicios.'
      ]
    },
    {
      titulo: '7. Cookies, almacenamiento local y datos técnicos',
      contenido: [
        'La aplicación puede utilizar almacenamiento local del navegador para conservar información de sesión, tipo de usuario y datos necesarios para mantener la experiencia de navegación. También pueden registrarse datos técnicos como dirección IP, navegador, dispositivo, fecha de acceso y eventos de seguridad.',
        'Estos datos ayudan a mantener la sesión activa, proteger cuentas, diagnosticar fallos, mejorar el rendimiento y prevenir accesos no autorizados.'
      ]
    },
    {
      titulo: '8. Seguridad y conservación de la información',
      contenido: [
        'Aplicamos medidas razonables de seguridad administrativa, técnica y operativa para proteger la información contra pérdida, uso indebido, acceso no autorizado, alteración o divulgación indebida.',
        'Conservamos los datos durante el tiempo necesario para cumplir las finalidades descritas en este aviso, mantener registros operativos, atender responsabilidades legales y resolver incidencias relacionadas con la plataforma.'
      ]
    },
    {
      titulo: '9. Derechos ARCO y revocación del consentimiento',
      contenido: [
        'Como titular de datos personales, usted puede solicitar el acceso, rectificación, cancelación u oposición al tratamiento de sus datos personales, así como revocar su consentimiento cuando legalmente proceda.',
        'Para ejercer estos derechos, puede comunicarse con el equipo de TalentHub México a través de los canales oficiales publicados en la plataforma. La solicitud deberá incluir información suficiente para acreditar la titularidad de la cuenta y describir claramente el derecho que desea ejercer.'
      ]
    },
    {
      titulo: '10. Cambios al aviso de privacidad',
      contenido: [
        'TalentHub México puede actualizar este aviso para reflejar cambios legales, técnicos, operativos o de negocio. Las modificaciones estarán disponibles en esta misma página y se indicará la fecha de última actualización.',
        'El uso continuo de la plataforma después de publicada una actualización implica el conocimiento de la versión vigente del aviso.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-talenthub-blue to-blue-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-blue-100 hover:text-white font-medium transition mb-8">
            ← Volver al inicio
          </Link>
          <p className="text-blue-100 font-semibold mb-3">Aviso de privacidad</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Políticas de Privacidad
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl">
            Información clara sobre cómo TalentHub México recopila, utiliza y protege los datos personales dentro de su plataforma de empleo tecnológico.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Última actualización</p>
                <p className="text-talenthub-gray font-bold mt-1">6 de julio de 2026</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Servicio</p>
                <p className="text-talenthub-gray font-bold mt-1">TalentHub México</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Aplicación</p>
                <p className="text-talenthub-gray font-bold mt-1">Plataforma web de empleo</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-10">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <p className="text-gray-700 leading-relaxed">
                Este documento es un aviso informativo para usuarios de TalentHub México. Si una operación específica requiere consentimiento adicional o términos particulares, se mostrará dentro del flujo correspondiente de la plataforma.
              </p>
            </div>

            {secciones.map((seccion) => (
              <section key={seccion.titulo} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                <h2 className="text-2xl font-bold text-talenthub-gray mb-4">
                  {seccion.titulo}
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  {seccion.contenido.map((parrafo) => (
                    <p key={parrafo}>{parrafo}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="bg-gray-100 px-6 sm:px-10 py-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed">
              Al utilizar TalentHub México, usted reconoce haber leído este aviso de privacidad y acepta el tratamiento de sus datos personales conforme a las finalidades descritas.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoliticasPrivacidad;
