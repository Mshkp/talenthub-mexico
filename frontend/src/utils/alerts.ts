import { sileo } from 'sileo';
import { requestConfirm } from '../lib/confirm';

/**
 * Notificaciones del sistema.
 *
 * La firma pública es la misma de siempre a propósito: `showSuccess`,
 * `showError` y `showConfirm` se llaman desde 14 páginas y ninguna se toca.
 * Lo que cambió es el motor — de SweetAlert (modal blanco que interrumpe todo)
 * a sileo (toast que no bloquea) más un Dialog propio para la confirmación.
 */

/**
 * Sin overrides de color a propósito.
 *
 * La burbuja de sileo es oscura (su `theme="light"` significa texto claro, no
 * superficie clara), así que pasarle `text-ink` mandaría negro sobre negro.
 * Además sus selectores `[data-sileo-*]` tienen más especificidad que una clase
 * de Tailwind y ganan igual: un override de color aquí sería letra muerta que
 * un día se vuelve bug. Sus defaults ya son legibles y coherentes con el nav.
 */
const STYLES = undefined;

export const showSuccess = (texto: string, titulo = 'Listo'): void => {
  sileo.success({ title: titulo, description: texto, duration: 4200, styles: STYLES });
};

export const showError = (texto: string, titulo = 'Algo salió mal'): void => {
  // Los errores duran más: hay que leerlos y decidir qué hacer.
  sileo.error({ title: titulo, description: texto, duration: 6500, styles: STYLES });
};

export const showInfo = (texto: string, titulo = 'Aviso'): void => {
  sileo.info({ title: titulo, description: texto, duration: 4200, styles: STYLES });
};

/**
 * Confirmación bloqueante que devuelve booleano.
 *
 * sileo NO cubre esto: su `button` es fire-and-forget y no resuelve nada.
 * Va por `<ConfirmHost />`, montado una vez en App.tsx.
 */
export const showConfirm = async (
  texto: string,
  titulo = '¿Estás seguro?',
  opciones?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }
): Promise<boolean> =>
  requestConfirm({
    title: titulo,
    description: texto,
    confirmLabel: opciones?.confirmLabel ?? 'Sí, continuar',
    cancelLabel: opciones?.cancelLabel ?? 'Cancelar',
    destructive: opciones?.destructive ?? true,
  });

/**
 * Envuelve una promesa y narra su estado. Cubre el hueco de las llamadas
 * que hoy no dan ningún feedback de carga.
 */
export const withFeedback = <T,>(
  promesa: Promise<T>,
  mensajes: { loading: string; success: string; error: string }
): Promise<T> =>
  sileo.promise(promesa, {
    loading: { title: mensajes.loading, styles: STYLES },
    success: { title: mensajes.success, styles: STYLES },
    error: { title: mensajes.error, styles: STYLES },
  });
