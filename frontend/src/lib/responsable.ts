/**
 * Datos del responsable del tratamiento de datos personales.
 *
 * Viven aquí y no dentro del aviso porque los usan dos lugares: el aviso de
 * privacidad los declara, y el footer publica el canal de contacto. Tenerlos
 * duplicados garantizaba que un día dijeran cosas distintas.
 *
 * No son adorno — la LFPDPPP (art. 16) exige que el aviso integral declare
 * identidad y DOMICILIO del responsable, y que designe un medio concreto para
 * ejercer los derechos ARCO. Si alguno se vacía, el aviso vuelve a decir
 * «[pendiente de designar]» y el enlace de contacto desaparece del footer, en
 * vez de publicar un dato falso o un mailto roto.
 */
export const RESPONSABLE = {
  nombre: 'TalentHub México',
  /** Domicilio fiscal o de contacto. Ej. el de la UTP. */
  domicilio: 'Antiguo Camino a La Resurrección 1002-A, Zona Industrial, 72300 Heroica Puebla de Zaragoza, Puebla',
  /** Buzón para solicitudes ARCO. */
  correo: 'support@talent-hub.me',
};

/** Texto que va en el aviso mientras el dato no exista. */
export const PENDIENTE = '[pendiente de designar]';

export const domicilioTexto = () => RESPONSABLE.domicilio || PENDIENTE;
export const correoTexto = () => RESPONSABLE.correo || PENDIENTE;

/** El footer solo publica el contacto si de verdad hay a dónde escribir. */
export const hayContacto = () => RESPONSABLE.correo.length > 0;
