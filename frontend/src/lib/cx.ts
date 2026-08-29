/** Une clases condicionales. Evita una dependencia por 8 líneas. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
