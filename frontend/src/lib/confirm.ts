/**
 * Puente imperativo para el diálogo de confirmación.
 *
 * `sileo` no tiene API de confirmación: su `button` es fire-and-forget y no
 * devuelve nada. Como `showConfirm()` sí devuelve un booleano y lo usan los
 * dashboards para borrar, la confirmación va por un Dialog propio en vez de
 * arrastrar SweetAlert entero (≈100 KB) por una sola función.
 *
 * `ConfirmHost` se monta una vez en App.tsx y resuelve la promesa.
 */

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Marca la acción como destructiva (borrar, suspender). */
  destructive?: boolean;
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

type Listener = (req: ConfirmRequest) => void;

let listener: Listener | null = null;

export function subscribeConfirm(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function requestConfirm(options: ConfirmOptions): Promise<boolean> {
  // Sin host montado no hay forma de preguntar. Devolver `false` es lo seguro:
  // ninguna acción destructiva ocurre por accidente.
  if (!listener) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[confirm] No hay <ConfirmHost /> montado; se cancela la acción.');
    }
    return Promise.resolve(false);
  }
  return new Promise<boolean>((resolve) => {
    listener!({ ...options, resolve });
  });
}
