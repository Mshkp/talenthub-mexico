# Plan de rediseño — TalentHub México

> Sistema de diseño: [`DESIGN.md`](./DESIGN.md) · Referencias: [`design-refs/`](./design-refs/)

---

## Contexto

La interfaz actual es Tailwind por defecto: dos colores custom que son `blue-600` y `gray-700`, `index.css` vacío, `App.css` en 0 bytes, y el patrón `bg-white rounded-lg shadow-md` repetido **143 veces en 14 archivos**. El `Home` es el caso de libro de lo genérico — hero con `bg-gradient-to-r` y tres cards con emoji de ícono.

El objetivo no es "verse mejor" en abstracto: es que la página deje de parecer una plantilla. Eso exige un sistema con postura, no una mano de pintura.

**Estado de partida:** 13 páginas contra 2 componentes compartidos. ~110 KB de código de página sin capa de UI reutilizable, lo que hace que cualquier cambio visual haya que repetirlo 14 veces. El rediseño y la extracción de componentes se hacen juntos porque separarlos significaría tocar los mismos archivos dos veces.

---

## Alcance

**Dentro**
- Sistema de tokens en `tailwind.config.js` + carga de fuentes
- Capa de componentes UI reutilizables
- Rediseño de las 13 páginas al sistema oscuro
- Migración de notificaciones a `sileo` + `Dialog` propio
- Correcciones de accesibilidad detectadas en las specs

**Fuera** (no se toca en esta pasada)
- Migración CRA → Vite
- Backend Django (`config/`, `empleos/`)
- Lógica de negocio, endpoints, serializers
- Alineación de TypeScript 4.9 con los tipos de React 19

---

## Fase 0 — Fundamentos

Sin esto, todo lo demás se hace dos veces.

| Archivo | Cambio |
|---|---|
| `frontend/tailwind.config.js` | Tokens de `DESIGN.md` en `theme.extend`: colores, tipografía, radios, espaciado. **Sintaxis v3** — el bloque `@theme` de las specs es v4 y no compila. |
| `frontend/public/index.html` | `<link>` a Google Fonts: DM Sans + Geist con `preconnect`. |
| `frontend/src/index.css` | Capa base: `bg-canvas`, `text-text`, `font-feature-settings`, `color-scheme: dark`, import de `sileo/styles.css`. |

Reemplaza `talenthub-blue` / `talenthub-gray`. Ambos se conservan como alias temporales para que nada reviente durante la migración, y se borran al cerrar la Fase 5.

---

## Fase 1 — Capa de componentes

Nuevo directorio `frontend/src/components/ui/`. Cada componente sale de un patrón que hoy está duplicado en las páginas.

| Componente | Sustituye a | Visto en |
|---|---|---|
| `Button` (`primary` / `accent` / `ghost`) | 5 tratamientos distintos de botón | `Home`, `Vacantes`, `navbar`, `Checkout` |
| `Card` / `CardSolid` | `bg-white rounded-lg shadow-md p-6` | las 14 |
| `Input` / `Select` / `Field` | `border-2 border-gray-300 rounded-lg` | `Vacantes`, `Dashboard`, `Register` |
| `Badge` | `getModalidadColor()` con pasteles | `Vacantes`, y su gemelo en `MisAplicaciones` |
| `PageShell` | `min-h-screen bg-gray-50` + `max-w-7xl mx-auto px-4` | las 13 páginas |
| `EmptyState` | bloques centrados ad-hoc | `Vacantes`, `MisAplicaciones` |
| `Loading` | `<div>Cargando vacantes...</div>` | 6 páginas |
| `Dialog` | `showConfirm()` de SweetAlert | ver Fase 2 |
| `TableRow` | filas con borde y zebra | los 3 dashboards |

`getModalidadColor()` en [Vacantes.tsx:75](frontend/src/pages/Vacantes.tsx#L75) devuelve pasteles (`bg-green-100 text-green-800`) que rompen la monocromía. Se reemplaza por `Badge` con el patrón punto-de-6px definido en `DESIGN.md` §5.

**Íconos:** `lucide-react` ya está en uso en [navbar.tsx](frontend/src/components/navbar.tsx#L4) — se extiende al resto. Los emoji como íconos (`💼 💰 📊` en `Home`, `🔍` en `Vacantes`) se sustituyen por SVG de lucide.

---

## Fase 2 — Notificaciones

`sileo@0.1.5` ya instalado. Riesgo asumido: pre-1.0, la API puede romper. Contenido porque la superficie es mínima.

1. `<Toaster theme="dark" />` en `App.tsx`, alineado a los tokens vía `roundness` y `styles`.
2. Reescribir `frontend/src/utils/alerts.ts` conservando **la misma firma pública** — `showSuccess`, `showError`, `showConfirm` se siguen llamando igual desde las 14 páginas, así que no hay que tocar los call sites.
   - `showSuccess` / `showError` → `sileo.success` / `sileo.error`
   - `showConfirm` → `Dialog` propio, porque **sileo no tiene API de confirmación**: su `button` es fire-and-forget, no un diálogo bloqueante que devuelva `boolean`.
3. Aprovechar `sileo.promise()` en las llamadas de `Vacantes`, `Dashboard` y `Checkout`, que hoy no dan feedback de carga.
4. Desinstalar `sweetalert2` (~100 KB) al cerrar la fase.

> Esto resuelve de raíz uno de los problemas de integración detectados: el modal blanco de SweetAlert sobre canvas oscuro.

---

## Fase 3 — Marketing

Primera superficie visible. Se valida aquí antes de propagar.

| Archivo | Trabajo |
|---|---|
| `components/navbar.tsx` | Reescritura a **nav flotante**: `elevated` translúcido, `backdrop-blur`, radio 19px, flotando 16–24px del borde. Es el componente firma del sistema. Conservar la lógica de roles y el contador de notificaciones tal cual. |
| `pages/Home.tsx` | Hero con gradiente azul-dominante, display 72px DM Sans peso 500, features en fila numerada editorial (no tres cards), banda de cierre con `accent-wash`. |
| `pages/planes.tsx` | Tiers de precio; el destacado se invierte a superficie clara. |
| `pages/PoliticasPrivacidad.tsx` | Registro editorial, ancho de lectura acotado. |

---

## Fase 4 — App: flujo del aspirante

| Archivo | Nota |
|---|---|
| `pages/Vacantes.tsx` | Card de filtros → `Card` + `Field`. Lista de vacantes al registro denso. |
| `pages/VacanteDetalle.tsx` | — |
| `pages/MisAplicaciones.tsx` | `Badge` para los cuatro estados de postulación. |
| `pages/PerfilAspirante.tsx` | Subida de CV → `file-upload` de `DESIGN.md` §6. |

---

## Fase 5 — Dashboards

Los tres monolitos. Se dejan al final porque para entonces la capa de componentes ya está probada.

| Archivo | Tamaño | Nota |
|---|---|---|
| `pages/Dashboard.tsx` | 17.5 KB | Extraer el formulario de vacante a componente propio. |
| `pages/DashboardValidador.tsx` | 17.9 KB | — |
| `pages/AplicacionesEmpresa.tsx` | 12.5 KB | — |

**Regla de rendimiento:** `card-solid` por defecto, `frosted` solo en nav y modales. `backdrop-filter` repetido en filas de tabla hace jank en equipos modestos (`DESIGN.md` §7).

---

## Fase 6 — Auth y cierre

- `pages/Login.tsx`, `Register.tsx`, `auth/SolicitarRecuperacion.jsx`, `auth/RestablecerPassword.jsx`
- Eliminar `auth/AuthStyles.css` — su contenido pasa a tokens
- `Checkout.tsx`: PayPal a `color: "black"` + `shape: "pill"`. Los botones viven en un iframe y **no heredan el CSS**; en `"blue"` serían el elemento más ruidoso del sitio
- Borrar los alias `talenthub-blue` / `talenthub-gray`
- Desinstalar `sweetalert2` y `start@^5.1.0` (paquete sin relación con el proyecto)

---

## Correcciones incluidas

Detectadas al analizar las specs, van dentro del trabajo:

| # | Hallazgo | Corrección |
|---|---|---|
| 1 | `slate #686868` sobre `#0a0a0a` = **3.55:1**, reprueba AA (mín. 4.5:1) y la spec lo asigna a *links* | Elevado a `#8a8a8a` (5.4:1) |
| 2 | `#2563EB` como texto sobre oscuro = **3.83:1**, reprueba AA | Se parte: `#2563EB` para rellenos (blanco encima = 5.17:1 ✓), `#60A5FA` para texto (7.79:1 ✓) |
| 3 | `hairline #e5e5e5` sólido sobre negro = ~17:1, es un contorno brillante, no un hairline | `rgba(255,255,255,0.10)`, como Linear y Vercel |
| 4 | PayPal en `color: "blue"` dentro de iframe | `"black"` + `shape: "pill"` |
| 5 | SweetAlert con modal blanco y botones hardcodeados | Eliminado en Fase 2 |

---

## Verificación

Por fase, no al final:

1. `npm start` en `frontend/` y recorrer la superficie tocada
2. Los tres roles — aspirante, empresa, validador — porque el navbar y las rutas cambian según `user_tipo` en `localStorage`
3. Responsive en 375 / 768 / 1440; el navbar colapsa a hamburguesa bajo 768
4. Contraste con DevTools en texto secundario y links, que es donde estaban las fallas
5. `npm run build` antes de cerrar cada fase — el deploy es Vercel y CRA 5 sobre React 19 no es una combinación soportada oficialmente
6. Checkout con la cuenta sandbox de PayPal tras cambiar el color de los botones

**Los hooks de `impeccable` corren solos** en cada edición (`PostToolUse`) y al cerrar cada turno (`Stop`). Sus avisos son señal de diseño, no errores de build.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `sileo` pre-1.0 rompe API | Superficie mínima; migrar a `sonner` es buscar-y-reemplazar |
| CRA 5 + React 19 falla al buildear con cambios grandes | `npm run build` al cierre de cada fase, no al final |
| El sistema oscuro no encaja en superficies densas | Fases 4 y 5 al final, con la capa de componentes ya validada |
| Falta la spec de glassmorphism | `DESIGN.md` ya cubre paneles frosted; se integra cuando llegue |

---

## Pendiente del lado de Yeudiel

```bash
npx typeui.sh pull glassmorphism
```

Es interactiva y no corre en sesión sin stdin. Pasar el archivo resultante para integrarlo.
