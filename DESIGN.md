# TalentHub México — Sistema de Diseño

> Claro por defecto, oscuro de acento. Un solo color de interacción: azul ultramar.

**Densidad:** cómoda en marketing, compacta en app

---

## 0. De dónde sale este sistema

Fusión de tres referencias, resuelta **por capas, no por promedio**. Promediarlas habría dado el gris de siempre; apilarlas deja que cada una mande donde es más fuerte.

| Capa | Fuente | Qué aporta |
|---|---|---|
| **Columna vertebral** | `design-refs/dimension.md` | Silueta pill, hairlines, prohibición de sombras, disciplina de un solo acento, display en peso 500 |
| **Composición y tipo** | `design-refs/apple.md` | "El chrome se retira para que el contenido hable", canvas claro, tracking negativo en display |
| **Arquitectura de página** | `design-refs/superhuman.md` | Estructura en actos (hero → cuerpo → banda de cierre), un CTA por sección, pesos sub-default |
| **Material de superficies** | glassmorphism | Vocabulario de paneles traslúcidos para nav, modales y overlays |

### Decisiones firmes (no negociables por componente)

| Conflicto | Resolución |
|---|---|
| Canvas oscuro vs. claro | **Claro por defecto.** El oscuro queda para hero, banda de cierre, nav, footer, auth y checkout — interrupciones deliberadas, siempre a filo. |
| Acento: violeta vs. azul de Tailwind vs. teal | **Azul ultramar `#3355ff`.** Ni el `#2563EB` genérico ni el violeta que lo sustituyó un tiempo. Ver §1. |
| Pill 9999px vs. rect 8px | **Pill.** Es la silueta que define el sistema. |
| Sombras: prohibidas vs. dos niveles | **Prohibidas.** Profundidad = translucidez + hairline + contraste de superficie. |
| Peso display: 500 vs. 540 vs. 600 | **500–540.** Dimension ("nunca más de 500") y Superhuman ("sub-default 460/540") son el mismo instinto. |
| Cuánta animación | **Toda la que aguante**, pero orquestada desde `lib/motion.ts`. Doce efectos sueltos leen como plantilla; una secuencia coherente lee como producto. |

### La consecuencia de ser claro, dicha sin adornos

Al invertir el registro, **la paleta deja de cargar la distinción**. Un portal de empleos claro y minimalista es el territorio más transitado que existe. Lo que sostiene el carácter es la disciplina, y si alguna de estas se relaja el resultado vuelve a ser un SaaS más:

- La **silueta pill** en todo control
- La **prohibición de sombras** de elevación
- El **peso 500 en display** con tracking −0.035em, cuando todo mundo usa 700
- Las **bandas oscuras** como interrupciones a filo, nunca degradadas
- El **nav flotante oscuro sobre contenido claro**
- La **capa de animación**

### Descartado explícitamente

- Retratos "half-bleed photographed at twilight" de Superhuman — no existe ese banco de fotos y fabricarlo se nota.
- Emoji como íconos (`💼 💰 📊`). Todo ícono sale de `lucide-react`.
- **El pill de anuncio sobre el titular** ("17 vacantes nuevas ●"). Es el elemento más reconocible de landing generada por IA. El dato era bueno; la forma, no. Vive ahora como delta en las métricas del hero.
- **El badge de punto + texto** para estados. Sustituido por `ProcessTrack` (§5).
- **Ámbar como color de estado.** Ver §1.

---

## 1. Color

### Superficies

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#ffffff` | Fondo de contenido. Plano base del registro claro. |
| `surface` | `#f5f6f8` | Off-white: bandas alternas, filas en hover, controles segmentados. |
| `night` | `#0a0a0a` | Bandas oscuras: hero, cierre, auth, checkout. |
| `elevated` | `#161616` | Nav flotante y cards opacas sobre oscuro. |

**El sustrato no es decoración.** `mesh-page` (en `index.css`) pinta cuatro halos en saturación mínima detrás de la página. Sin él el glass no refracta nada: una card translúcida sobre blanco plano se ve idéntica a una opaca. Los halos dan variación de **tono**, no solo de luz — que es la diferencia entre vidrio y plástico esmerilado. Va con `background-attachment: fixed`: el halo se queda quieto mientras el contenido corre, sin coste de repintado por scroll.

### Texto

| Token | Valor | Contraste | Uso |
|---|---|---|---|
| `ink` | `#161616` | 18.1:1 sobre `canvas` · AAA | Cuerpo principal en claro |
| `ink-2` | `#3f4045` | AAA | Texto de apoyo |
| `muted` | `#6b6b6b` | 5.33:1 · AA | Metadata, ayudas, timestamps |
| `ink-d` | `#ededed` | 16.9:1 sobre `night` · AAA | Cuerpo sobre oscuro. **Nunca blanco puro** — reduce el glare. |
| `ink-2d` | `#c2c2c2` | AAA | Apoyo sobre oscuro |
| `muted-d` | `#8a8a8a` | 5.4:1 · AA | Metadata sobre oscuro |

> **Corrección aplicada:** la spec original asignaba `#686868` a texto y *links* sobre oscuro. Da **3.55:1**, reprueba AA. Elevado a `#8a8a8a`.

### Acento — azul ultramar

**Un solo color marca "esto se puede tocar":** botones, links, foco. Nada más. Los colores de estado nunca visten un control clicable, así el usuario nunca tiene que preguntarse qué color significa presionable.

| Token | Valor | Contraste | Uso |
|---|---|---|---|
| `accent` | `#3355ff` | 5.41:1 con blanco encima · AA | Rellenos, links sobre claro, foco |
| `accent-hover` | `#2544e6` | 6.89:1 · AA | Hover de relleno |
| `accent-on-dark` | `#9db0ff` | 9.51:1 sobre `night` · AAA | Links y acento sobre bandas oscuras |
| `accent-wash` | `#4a66ff` | — | Solo halos y gradientes. **Nunca texto.** |

**Por qué no es `#2563EB`.** El azul de Tailwind está en 221° con 83% de saturación: es el azul por defecto de medio internet, y es exactamente el que se quitó al empezar el rediseño. Este está en **230° al 100%** — ultramar, no hipervínculo. Lee como pigmento.

Se eligió además con la **misma luminancia relativa** que el violeta al que sustituyó (0.1442 vs. 0.1438), así que todos los pares de contraste del sistema siguen valiendo sin volver a medirlos uno por uno.

> El acento necesita dos resoluciones. `#3355ff` como texto sobre `night` da 3.4:1 y reprueba; `#9db0ff` sobre `canvas` da 2.0:1 y reprueba. Un token semántico, dos valores, y nunca el del otro registro.

### Bordes

| Token | Valor | Uso |
|---|---|---|
| `hairline` | `rgba(0,0,0,0.10)` | Borde 1px sobre claro |
| `hairline-strong` | `rgba(0,0,0,0.20)` | Hover, separadores enfatizados |
| `hairline-d` | `rgba(255,255,255,0.10)` | Borde 1px sobre oscuro |
| `hairline-d-strong` | `rgba(255,255,255,0.18)` | Hover sobre oscuro |

> **Corrección aplicada:** la spec pedía `#e5e5e5` sólido como hairline. Sobre `#0a0a0a` eso es ~17:1 — un contorno brillante, no una línea sutil.

**El vidrio no lleva `border`.** Ni en claro ni en oscuro: usa `edge-d` / `edge-l` (§5). Un borde parejo traza el rectángulo entero y el ojo lo lee antes que al contenido.

### Estados semánticos

**El color marca resolución, no actividad.** Solo hay dos:

| Estado | Claro | Oscuro | Significa |
|---|---|---|---|
| `ok` | `#0f766e` | `ok-d` `#5eead4` | Resuelto a favor: aceptada, publicada, remoto, cuenta activa |
| `danger` | `#dc2626` | `danger-d` `#f87171` | Resuelto en contra: rechazada, error, destructivo |

Lo que está **en curso no lleva color**: lleva tinta plena (`ink`) y borde reforzado. Lo inactivo va en gris.

`warn` (`#a16207`) existe pero está **reservado a avisos de formulario**; nunca viste un estado.

> **Por qué se fue el ámbar.** Estaba asignado a "en revisión" y el rojo a "rechazada" — significados opuestos. Simulando deuteranopia, la distancia entre ambos es de **15 sobre 441**: indistinguibles. Teal contra rojo da **171**, porque difieren en matiz *y* en luminancia a la vez. Confundir "sigue vivo" con "te rechazaron" es inaceptable, así que el avance lo comunica la **posición en el track**, no el tono.

---

## 2. Tipografía

**DM Sans** para display y UI · **Bricolage Grotesque** para headings de sección. Ambas variables, cargadas en `public/index.html` con `preconnect`.

> **Por qué no Geist.** Estuvo aquí desde la Fase 1 y funcionaba, pero es una de las caras a las que converge cada oleada de interfaces generadas con IA — junto con Inter, Roboto y Space Grotesk. En un sistema cuya premisa es *"que no se vea genérica"*, la tipografía de titulares no puede ser la de todos.
>
> Bricolage Grotesque lleva anchos irregulares a propósito y un eje óptico (`opsz` 12–96): el titular de 72px y el h3 de 24px no son la misma letra escalada, sino dos dibujos distintos de la misma familia. Eso es exactamente lo que Geist no hacía.

### Escala

| Token | Tamaño | Line-height | Tracking |
|---|---|---|---|
| `display` | 72px | 1.0 | −0.035em |
| `h1` | 48px | 1.0 | −0.02em |
| `h2` | 36px | 1.11 | −0.015em |
| `h3` | 24px | 1.33 | −0.01em |
| `sub` | 18px | 1.5 | — |
| `body` | 16px | 1.5 | — |
| `caption` | 13px | 1.5 | +0.025em |

Pesos: `book` 460 · `mid` 500 · `demi` 540.

### Reglas

- **Nunca display por encima de 540.** La contención es la firma. Cero `font-bold` en headlines.
- 460 y 540 son intencionales — es la síntesis Dimension/Superhuman. No redondear a 400/500/600.
- Tracking negativo solo en display y headings. En 13–16px, tracking **positivo**.
- Las cifras van con `.tabular` (`font-variant-numeric: tabular-nums`) para que no bailen al actualizarse.

---

## 3. Forma y espacio

### Radios

| Elemento | Token | Valor |
|---|---|---|
| Botones, pills, tags | `pill` | `9999px` |
| Inputs, controles UI | `ui` | `10px` |
| Cards | `card` | `24px` |
| Cards grandes | `cardlg` | `40px` |
| Paneles | `panel` | `42px` |
| Nav flotante | `nav` | `19px` |

### Espaciado

Base 4px. Escala: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80`.

> La escala de 16 valores del doc original no era una escala — era cada valor que apareció en la página escaneada. Reducida a una progresión real.

- **Gap entre secciones:** 64–80px (marketing) · 32–40px (app)
- **Padding de card:** 28px (marketing) · 16–20px (app)
- **Ancho máximo:** 1200px (`max-w-page`). El nav flotante va a 940px: a 1200 dejaba márgenes de 33px en un viewport de 1280 y se leía como barra, no como pill.

### Elevación

**No hay `box-shadow` de elevación.** La profundidad se construye con:

1. Contraste de superficie (`canvas` → `surface`, `night` → `elevated`)
2. Filo de 1px (`hairline`, o `edge-d` / `edge-l` en vidrio)
3. Translucidez + `backdrop-blur`
4. Solape: los paneles de resumen montan ~96px sobre la banda oscura

Las dos únicas sombras del sistema son los halos de foco (`focus-accent`, `focus-accent-d`), y son señal de estado, no de elevación.

### Movimiento

Una sola curva en CSS: `ease-base` = `cubic-bezier(0.22,0.61,0.36,1)`.

> Hubo un `spring: cubic-bezier(0.34,1.56,0.64,1)` y se fue. Un rebote en CSS se aplica a la lista entera de propiedades en transición, así que sobrepasaba también los colores: en cada hover el relleno iba más allá del color destino y regresaba. El resorte de verdad —con masa y amortiguación— vive en `lib/motion.ts` (`SPRING`), donde framer-motion lo aplica solo a lo que tiene física.

El foco visible usa `outline: 2px solid currentColor`, no un color fijo: un anillo negro desaparecería sobre las bandas oscuras y uno blanco sobre las claras.

Todo lo animado respeta `prefers-reduced-motion`. No es opcional: sin eso el sitio es hostil para quien tiene sensibilidad vestibular.

---

## 4. Dos registros

El sitio tiene dos naturalezas. **Mismos tokens, distinto ritmo.**

| | **Marketing** | **App** |
|---|---|---|
| Páginas | `Home`, `planes`, `PoliticasPrivacidad` | los tres dashboards, `Vacantes`, `VacanteDetalle`, `MisAplicaciones`, `PerfilAspirante` |
| Ritmo | Editorial, generoso | Denso, funcional |
| Gap de sección | 64–80px | 32–40px |
| Display | Hasta 72px | Máx 36px |
| Estructura | Actos: hero → cuerpo → cierre | Banda oscura + panel de resumen solapado + contenido |
| Glass | Generoso | Solo en el chrome *(ver §7)* |

**Dónde va el oscuro:** hero de `Home`, banda de cierre, nav flotante, hero de `planes`, las cuatro pantallas de auth y el checkout. Todo lo demás vive en claro.

Las páginas de app comparten una sola composición: banda oscura con halo → panel de resumen en vidrio montado ~96px encima → cuerpo sobre `mesh-page`. Repetirla no es pereza: es lo que hace que el panel de empresa y el de validador se sientan el mismo producto.

---

## 5. Componentes — base

### `button-primary` — pill que invierte la superficie
**Siempre invierte el registro de su banda:** tinta sólida sobre claro (`bg-ink text-white`), blanco sólido sobre oscuro (`bg-white text-ink`). Radio `9999px`, padding `11px 22px`, peso 500. **Uno por sección.**

### `button-accent` — pill azul
Fondo `accent`, texto `#ffffff`, misma geometría. Para acciones de marca (Publicar Vacante, Postularme). Nunca junto a `button-primary` en la misma jerarquía.

### `button-ghost` — pill fantasma
Fondo transparente, borde 1px `hairline` (o `hairline-d`), radio `9999px`. Acciones secundarias. Es el único botón que admite color en el texto —`!text-ok`, `!text-danger`— porque el color ahí informa del efecto, no de que sea clicable: la silueta ya lo dice.

### Íconos en botones — regla del sistema

**Todo botón que ejecuta o navega lleva ícono. Los que cancelan, no.**

La identidad de una acción viene de su forma, no de su color: un ícono se
reconoce aunque no distingas colores, y no consume el presupuesto cromático
del sistema. Cinco acciones con cinco colores serían ruido; cinco acciones con
cinco glifos son un vocabulario.

| Ícono | Significa | Ejemplos |
|---|---|---|
| `ArrowRight` | Avanzar a un listado o al siguiente paso | Ver vacantes, Explorar, Contratar, Empezar |
| `ExternalLink` | Abrir un registro concreto | Ver detalles, Ver vacante |
| `Plus` | Crear algo nuevo | Nueva vacante, Publicar vacante |
| `Pencil` | Editar lo existente | Editar |
| `Check` | Confirmar o guardar | Crear vacante, Actualizar contraseña, Plan activo |
| `Save` | Persistir cambios de un formulario largo | Guardar cambios |
| `Send` | Enviar algo a otra persona | Postularme, Enviar enlace |
| `RotateCcw` | Repetir o revertir | Reintentar, Reabrir |
| `EyeOff` | Ocultar del público | Cerrar vacante |
| `Trash2` | Destruir | Eliminar |
| `X` | Descartar o limpiar | Limpiar filtros, Cancelar suscripción |
| `LogIn` / `LogOut` / `UserPlus` | Sesión | Iniciar sesión, Cerrar sesión, Crear cuenta |

**Sin ícono a propósito:** los botones "Cancelar" de formularios y diálogos, y
el CTA del nav. El cancelar debe ser la salida silenciosa — darle un glifo lo
pone al mismo peso visual que la acción que está evitando. El nav ya es denso.

**Tamaño:** 14px en botones `sm`, 15px en `md`. `strokeWidth` 1.8, salvo
`Check`, que va en 2 para que la marca se lea a ese tamaño.

### `nav-floating` — nav flotante
`elevated` con translucidez, radio `19px`, `backdrop-blur: 8px`, borde 1px `hairline`, padding `6px 14px` interno. **Flota 16–24px del borde del viewport** — nunca pegado. Contiene logo + links + un `button-primary`.

### `card` — card estándar
Radio `24px`, padding `28px`, sin sombra. Con `glass`, translúcida + `backdrop-blur` + `backdrop-saturate` y filo `edge-l`/`edge-d`. **`backdrop-saturate` no es opcional:** es lo que separa el vidrio del plástico esmerilado, porque satura el tono que atraviesa el panel en vez de solo difuminarlo.

### `card-solid` — card opaca
`canvas` o `elevated`, radio `24px`, borde 1px `hairline`. Para superficies densas donde el blur costaría rendimiento — tablas, sobre todo.

### `input` — campo de formulario
Borde 1px `hairline` (**no 2px**), radio `10px`, padding `10px 14px`. Focus: borde `accent` + `focus-accent`. Acepta `tone="dark"` para las pantallas de auth, que cambia superficie, texto y halo de foco al registro oscuro.
**Placeholder en `muted`, nunca en `ink-2`** — hay que distinguirlo de un valor real.
En oscuro es obligatorio el parche de autofill (`.input-dark` en `index.css`): Chrome ignora `background-color` en un campo autocompletado y el único override que respeta es un `box-shadow` interior.

### `ProcessTrack` — estado de postulación
**Sustituye al badge de punto + texto**, descartado por genérico: ese patrón está en toda landing de SaaS con IA.

Los cuatro estados (`pendiente` → `revisado` → `aceptado`/`rechazado`, verificados contra `empleos/models.py`) no son categorías sueltas sino una **secuencia**. El componente muestra tres segmentos con la posición real alcanzada, y **solo el último segmento lleva color**. Encoda la estructura en vez de decorarla — y por eso funciona aunque no distingas colores: la posición ya dice el avance.

### `glass-panel` — el panel que atraviesa el filo

**Es la composición que define la app.** Banda oscura arriba, panel de vidrio montado sobre su borde inferior, cuerpo claro debajo.

El degradado que se ve en estos paneles **no está pintado**. Es el mismo vidrio refractando dos fondos distintos: su mitad de arriba está sobre `night`, la de abajo sobre `mesh-page`. Sin filo que atravesar, el glass no tiene nada que hacer y el panel se ve idéntico a una card opaca — por eso el solape no es un detalle de posición, es la razón de ser del componente.

**Tres reglas que salieron de medirlo, no de mirarlo:**

1. **Densidad 0.68, no 0.46.** El glass de card va al 46%, pero un panel que atraviesa el filo tiene su tercio superior sobre negro, y ahí `ink` al 46% da **4.02:1** — reprueba AA. Al 68% da 8.4:1. La transparencia tiene techo y lo pone el texto.

2. **El solape es proporcional, no absoluto.** Lo que importa es que el filo cruce por la mitad superior. A 96px fijos, un panel de 110px queda al **87% sobre el negro**: deja de estar a caballo y pasa a flotar sobre la banda. Por eso hay dos medidas — `glass-panel-overlap` (96px, paneles de 160px o más) y `glass-panel-overlap-sm` (52px, filas de métricas y tríos de datos). Ambas aterrizan cerca del 48%.

3. **`muted` no entra en la zona oscura.** `#6b6b6b` sobre el gris que produce el panel sobre negro da **2.47:1**. Lo secundario que caiga en el tercio superior usa `ink-2` (4.80:1); `muted` solo por debajo del filo. No hay densidad que arregle esto: incluso al 90% de blanco, `muted` se queda en 4.19:1.

**Si la banda clara pinta fondo propio, necesita `flow-root`.** El margen negativo del panel se COLAPSA hacia arriba a través de cualquier ancestro sin padding ni borde superior, y arrastra con él el borde superior de la sección — o sea, su `background`. El panel se queda en su sitio, pero la banda clara sube 96px y se pinta justo detrás de él: el filo desaparece y el vidrio vuelve a tener blanco plano atrás. Se ve idéntico a que el efecto no estuviera aplicado. `display: flow-root` establece un contexto de formato y corta el colapso; la sección se queda donde debe y el panel la desborda hacia arriba, que es lo que se busca.

**Ningún ancestro del panel puede llevar `overflow: hidden`.** El panel vive DENTRO de la sección clara y sube 96px por encima de su caja; cualquier recorte en el camino se come justo esa parte — la que está sobre el negro, con el título adentro. `mesh-light` cargaba `overflow: hidden` para contener sus halos, y por eso los pinta ahora como capas de `background-image`: un fondo se recorta solo al border-box y no le impone nada a los hijos.

Lo llevan las diez páginas con banda oscura, incluidas las tres cards del Home — que por eso dejaron de ser `Card glass` y pasaron a ser paneles, con el titular de su sección mudado al final de la banda para que haya filo que cruzar.

### `edge-d` / `edge-l` — filo de vidrio

**El vidrio no lleva un `border` parejo y brillante.** Uno así traza el rectángulo entero y el ojo lo lee antes que al contenido: blanco al 16% sobre `#0a0a0a`, o blanco al 80% sobre una banda gris, son de los contrastes más altos de la pantalla. Un filo real no es uniforme — la luz pega arriba y el resto del canto solo define el borde.

Son dos capas: un hairline muy tenue por los cuatro lados y una línea de luz `inset` únicamente en el borde superior. `edge-d-hot` / `edge-l-hot` tiñen el filo de acento en hover.

> **No usar `mask-composite` para esto.** Hubo una versión que recortaba un degradado al contorno con `mask` + `mask-composite: exclude`. Se veía mejor y estaba rota en Firefox: ahí `-webkit-mask` entra como alias del shorthand estándar y, por ser shorthand, reinicia `mask-composite` a `add`; después `-webkit-mask-composite: xor` no existe en Firefox y no lo vuelve a poner. El pseudo-elemento acababa pintando el rectángulo **completo** encima de la card y todo el contenido se veía lavado. El `@supports` no protegía: Firefox sí soporta `mask-composite`, la que fallaba era la línea siguiente. Ningún filo bonito vale ese riesgo.

### `choice-cards` — elección entre dos o tres opciones

**Con pocas opciones excluyentes no va un `<select>`.** Dos razones, y la segunda pesa más:

1. El desplegable nativo lo dibuja el sistema operativo. Ninguna cantidad de CSS le da el registro oscuro en todos los navegadores — `[color-scheme:dark]` ayuda en algunos y en otros no.
2. Con dos opciones, el `select` esconde la mitad de la decisión detrás de un clic. Y cuando esa decisión **ramifica el formulario** — en el registro define si aparece el campo de empresa — merece verse completa.

Sigue siendo un `radiogroup` real con `input[type=radio]` en `sr-only`: las flechas del teclado navegan solas y el formulario serializa como siempre. El foco se pinta en la caja vía `peer-focus-visible`, porque el radio de verdad es invisible.

**El marco de selección VIAJA** (`layoutId` de framer-motion). No son dos bordes prendiéndose y apagándose: es el mismo objeto cambiando de sitio, y eso es lo que hace legible que las opciones son excluyentes.

### `auth-shell` — las cuatro pantallas de sesión

**Auth vive en registro oscuro completo**, no en tarjeta clara sobre fondo oscuro.

La primera versión ponía una placa `bg-white/[0.72]` con `border-white/60` encima del canvas negro. Ese anillo no se leía como filo de vidrio sino como recorte: blanco al 60% contra `#0a0a0a` es prácticamente el contraste máximo de la pantalla, y el ojo lo lee antes que al título. **Un borde solo desaparece cuando nace de la misma luz que lo rodea.**

- **Filo degradado, no `border`.** Un `p-px` con `bg-gradient-to-b from-white/[0.14] via-white/[0.05] to-white/[0.015]`: brilla arriba, donde el aurora pegaría, y se disuelve hacia abajo. Un `border` uniforme dibuja el rectángulo; esto solo insinúa que hay canto.
- **Aurora detrás.** Tres manchas en deriva lenta (blanco, `accent-wash` violeta, teal) bajo `useReducedMotion`. Sin ellas el `backdrop-filter` no tiene qué refractar y el glass se ve idéntico a una superficie opaca.
- **Controles en `tone="dark"`.** `Input`/`Select`/`Textarea`/`Field`/`PasswordValidator` aceptan el registro; el foco usa `focus-accent-d`, no el violeta oscuro, que sobre negro desaparece.
- **`[color-scheme:dark]` en los `select`.** El desplegable nativo lo pinta el sistema operativo: sin eso la lista sale blanca sobre la tarjeta.
- **Parche de autofill obligatorio** (`.input-dark` en `index.css`). Chrome ignora `background-color` en un campo autocompletado; el único override que respeta es `-webkit-box-shadow` interior. Sin él la banda oscura se rompe justo donde el navegador ayuda.
- **Panel lateral opcional** (`aside`), solo desde `lg`. Cuando existe, el wordmark se muda ahí: repetirlo arriba de la tarjeta sería eco.

---

## 6. Componentes — app (extrapolados)

Dimension es un sistema de landing page: no define inputs, tablas, paginación ni empty states. TalentHub es ~80% superficie de app. Estos componentes extienden el sistema manteniendo su lógica.

### `table-row`
Sin bordes verticales. Separador horizontal `hairline` de 1px. Altura mínima 52px, padding `12px 16px`.
Hover: fondo `rgba(255,255,255,0.03)`. **Sin zebra striping** — rompe la calma del sistema.

### `empty-state`
Centrado, `heading-sm` en `text` + `body` en `text-secondary` + un `button-ghost`. Sin ilustración: el sistema no usa illustration y meter una lo delataría como plantilla.

### `file-upload` — subida de CV
Zona con borde 1px **dashed** `hairline`, radio `10px`, padding 32px. Estado drag-over: borde `accent`, fondo `rgba(37,99,235,0.06)`.
Archivo cargado: colapsa a una fila con nombre en `body`, peso en `caption`/`text-muted`, y un `button-ghost` para quitar.

### `pagination`
Pills de 32×32px, radio `9999px`. Página activa: fondo `elevated` + borde `hairline-strong`. Inactivas: solo texto en `text-muted`.

### `hero-gradient` — hero de marketing
Gradiente cálido→frío en azul-dominante. Reemplaza el amber→cobalt original:
`linear-gradient(105deg, #1e1b4b 0%, #1e3a8a 45%, #2563EB 100%)`
**Solo en hero o spotlight.** Nunca en cards, botones ni controles.

### `closing-band` — banda de cierre
Traducción de la banda teal de Superhuman. Franja full-bleed con `accent-wash` horizontal, un `heading` centrado y **un solo** CTA. Cierra las páginas de marketing.

---

## 7. Rendimiento del glass

`backdrop-filter` es caro en GPU. Regla operativa:

- **Sí:** nav flotante, modales, overlays, máximo 3–4 cards por viewport.
- **No:** filas de tabla, listas largas, cualquier cosa que se repita más de ~6 veces.
- En los dashboards usar `card-solid` por defecto y reservar `frosted` para el chrome.

---

## 8. Integraciones que hay que adaptar

### PayPal — `frontend/src/pages/Checkout.tsx`
Los botones renderizan en un iframe propio: **no heredan el CSS**. Hoy están en `color: "blue"`, que sobre canvas oscuro sería el elemento más ruidoso del sitio.
→ Cambiar a `color: "black"` o `"white"`, y `shape: "pill"` para alinear con la silueta.

### SweetAlert2 — `frontend/src/utils/alerts.ts`
El modal es blanco por defecto y los botones hardcodean `bg-blue-600` / `bg-gray-500` / `bg-red-500`.
→ Pasar `background: '#161616'`, `color: '#ededed'`, y sustituir las clases de botón por las del sistema. Los tres helpers (`showSuccess`, `showError`, `showConfirm`) comparten el `mixin`, así que se arregla en un solo punto.

---

## 9. Reglas

### Hacer
- Pill `9999px` en todos los botones, pills de nav y tags — es la silueta que define el sistema.
- Display en DM Sans 500 con tracking negativo. La contención es la firma.
- `#ededed` para cuerpo sobre oscuro, `#161616` sobre blanco. Nunca blanco puro en párrafos.
- Hairlines de 1px en blanco al 10% de alpha. Definición sin peso.
- Un solo CTA primario por sección.
- Gaps de 64–80px entre bloques de marketing, 32–40px en app.
- El azul solo como acento: rellenos de acción, focus, gradientes de hero. Nunca como color de fondo de sección.

### No hacer
- Box-shadow para elevación. La profundidad es translucidez + hairline + contraste.
- Colores de marca adicionales. El azul es el único acento; los semánticos son puntos de 6px, no rellenos.
- Display en peso 600 o superior.
- **Bricolage Grotesque fuera del nivel display.** Vive en los `h1` y `h2` de página y de sección, y en nada más. Sus anchos irregulares son la gracia en un titular y ruido en el encabezado de una tabla: a 18–24px dejan de leerse como intención y empiezan a leerse como desalineación. De `h3` hacia abajo, DM Sans, sin excepciones.
  > La regla es de **rol**, no de píxeles: esos titulares usan `clamp()`, así que en móvil bajan a 26–30px sin dejar de ser el nivel display de su pantalla. Medir solo el `font-size` da falsos positivos.
- **Bricolage tampoco entra en cifras.** El rango salarial de `VacanteDetalle` llega a 32px —tamaño de display— y aun así va en DM Sans: lleva `tabular-nums`, que existe precisamente para que los dígitos ocupen todos lo mismo. Una tipografía de anchos irregulares deshace eso. Es dato, no titular.
- El nav pegado al borde del viewport — siempre flota.
- Gradientes en cards, botones o texto. Solo hero y franjas de acento.
- Zebra striping ni bordes verticales en tablas.
- Ilustraciones decorativas o íconos emoji. Los íconos son SVG monocromos de `lucide-react` a 16–20px, stroke ~1.5px.

---

## 10. Notas de implementación

- **Tailwind 3.4.1**, no v4. Los tokens van en `theme.extend` de `frontend/tailwind.config.js`. El bloque `@theme` de las specs originales es sintaxis v4 y no compila aquí.
- `lucide-react` y `framer-motion` ya están instalados y sin usar. Los íconos salen de lucide; la motion de framer, con curvas tipo resorte según la capa de Apple.
- Los emoji actuales como íconos (`💼`, `💰`, `📊` en `Home.tsx`) se reemplazan por SVG de lucide.
