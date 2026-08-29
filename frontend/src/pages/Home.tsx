import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ShieldCheck, TrendingUp, BarChart3, ArrowRight, Plus, ExternalLink } from "lucide-react";
import api from "../services/api";
import { Button, Card, CountUp, Tag } from "../components/ui";
import { EASE, rise, riseGlass, stagger, revealViewport } from "../lib/motion";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Ofertas verificadas",
    body: "Cada vacante pasa por revisión manual antes de publicarse. Sin ofertas fantasma ni reclutadores que desaparecen.",
  },
  {
    icon: TrendingUp,
    title: "Transparencia salarial",
    body: "El rango se muestra antes de que apliques. Sin sorpresas cuando ya invertiste cuatro entrevistas.",
  },
  {
    icon: BarChart3,
    title: "Datos del mercado",
    body: "Salarios promedio y tendencias reales del sector TI mexicano, no estimaciones de otro país.",
  },
];

interface Metricas {
  vacantes: number;
  nuevas: number;
  empresas: number;
  /** Miles de pesos: el hero muestra "$18k", no "$18,430". */
  salarioK: number;
}

/** Vacante tal como la sirve el endpoint público `/vacantes/`. */
interface VacantePublica {
  empresa_nombre: string;
  salario_min: string;
  salario_max: string;
  fecha_publicacion: string;
}

const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;

/**
 * Las cifras del hero salen del mismo endpoint público que alimenta el muro
 * de vacantes, así que no pueden contradecirlo. No hay endpoint de
 * estadísticas y no lo inventamos en el backend: se derivan aquí.
 */
function calcularMetricas(vacantes: VacantePublica[]): Metricas | null {
  if (vacantes.length === 0) return null;

  const ahora = Date.now();
  const nuevas = vacantes.filter((v) => {
    const t = new Date(v.fecha_publicacion).getTime();
    return Number.isFinite(t) && ahora - t <= SIETE_DIAS;
  }).length;

  const empresas = new Set(vacantes.map((v) => v.empresa_nombre).filter(Boolean)).size;

  // Promedio del punto medio de cada rango. Se descartan las que no traen
  // rango en vez de contarlas como cero, que hundiría el promedio.
  const medios = vacantes
    .map((v) => {
      const min = parseFloat(v.salario_min);
      const max = parseFloat(v.salario_max);
      if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
      return (min + max) / 2;
    })
    .filter((n): n is number => n !== null && n > 0);

  const salarioK = medios.length
    ? Math.round(medios.reduce((a, b) => a + b, 0) / medios.length / 1000)
    : 0;

  return { vacantes: vacantes.length, nuevas, empresas, salarioK };
}

const Home: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [metricas, setMetricas] = useState<Metricas | null>(null);

  useEffect(() => {
    let vivo = true;
    api
      .get('/vacantes/')
      .then(({ data }) => {
        if (vivo) setMetricas(calcularMetricas(data));
      })
      // Silencio a propósito: el hero se ve bien sin la fila de cifras, y un
      // toast de error en la portada por una métrica no vale la interrupción.
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  // Parallax del halo principal: se mueve a otra velocidad que el contenido.
  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 900], [0, 240]);

  // Halo secundario que persigue al cursor. useSpring da la inercia y el rAF.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const cursorX = useSpring(rawX, { stiffness: 90, damping: 22, mass: 1.1 });
  const cursorY = useSpring(rawY, { stiffness: 90, damping: 22, mass: 1.1 });
  const cursorOpacity = useMotionValue(0);

  const onHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - r.left - 260);
    rawY.set(e.clientY - r.top - 260);
    cursorOpacity.set(1);
  };

  return (
    <div className="bg-canvas">
      {/* ───────────── HERO · banda oscura ───────────── */}
      <header
        ref={heroRef}
        onMouseMove={onHeroMove}
        onMouseLeave={() => cursorOpacity.set(0)}
        className="relative isolate mt-[calc(var(--nav-flow)*-1)] overflow-hidden bg-night pb-[168px] pt-[150px] text-ink-d"
      >
        <motion.div
          aria-hidden="true"
          style={{ y: reduced ? 0 : glowY }}
          className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[760px] w-[1100px] -translate-x-[64%]"
        >
          <div className="h-full w-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.17),rgba(255,255,255,0.04)_55%,transparent_78%)] blur-[6px]" />
        </motion.div>

        {!reduced && (
          <motion.div
            aria-hidden="true"
            style={{ x: cursorX, y: cursorY, opacity: cursorOpacity }}
            className="pointer-events-none absolute left-0 top-0 -z-10 hidden h-[520px] w-[520px] bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent_72%)] transition-opacity duration-500 md:block"
          />
        )}

        <motion.div
          variants={stagger(0.11, 0.05)}
          initial="hidden"
          animate="show"
          className="relative mx-auto grid max-w-page grid-cols-1 gap-14 px-6 md:px-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
        >
          <div>
            {/*
              Aquí vivía un pill con puntito anunciando "17 vacantes nuevas".
              Fuera: ese badge sobre el titular es el elemento más reconocible
              de landing generada por IA — está en todas. El dato era bueno, la
              forma no; ahora es un delta en las métricas, que es donde un
              producto de datos real lo pondría.
            */}
            {/* Cejilla: el Home era la única página sin ella. No es el pill con
                puntito que quitamos — es el mismo rótulo en versalitas que
                encabeza vacantes, planes, privacidad y los tres paneles. */}
            <motion.p
              variants={rise}
              className="mb-5 text-caption uppercase tracking-[0.06em] text-muted-d"
            >
              Empleo tecnológico en México
            </motion.p>

            <motion.h1
              variants={rise}
              className="mb-6 max-w-[14ch] font-heading text-[clamp(2.25rem,5.6vw,3.875rem)] font-mid leading-none tracking-[-0.035em]"
            >
              Conectando el mejor talento tecnológico
            </motion.h1>

            <motion.p variants={rise} className="mb-9 max-w-[44ch] text-sub text-ink-2d">
              Oportunidades reales en las mejores empresas de TI en México, con el rango salarial a la
              vista desde el primer día.
            </motion.p>

            <motion.div variants={rise} className="flex flex-wrap gap-3">
              <Link to="/vacantes">
                <Button variant="primary" tone="dark">
                  <ArrowRight size={15} strokeWidth={1.8} />
                  Ver vacantes
                </Button>
              </Link>
              <Link to="/planes">
                <Button variant="ghost" tone="dark">
                  <Plus size={15} strokeWidth={1.8} />
                  Publicar vacante
                </Button>
              </Link>
            </motion.div>

            {/* Las dos preguntas que trae cualquiera que llega aquí: cuánto me
                cuesta, y por dónde empiezo. Ambas verificadas contra el código:
                el aspirante no tiene ninguna ruta de pago, y `planes.tsx` sirve
                un plan con precio 0. */}
            <motion.p variants={rise} className="mt-7 max-w-[46ch] text-[0.875rem] leading-relaxed text-muted-d">
              Gratis para quien busca empleo. Las empresas empiezan en el plan gratuito.
            </motion.p>
          </div>

          {/* Card glass: el hero oscuro con halo es donde el glass realmente luce.
              `riseGlass` y no `rise`: un fade sobre un panel con backdrop-filter
              lo deja plano hasta que la opacidad llega a 1. Ver lib/motion.ts. */}
          <motion.div variants={riseGlass}>
            <Card tone="dark" glass>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="mb-1 text-[1.1875rem] font-demi tracking-[-0.01em] text-ink-d">
                    Frontend Developer Senior
                  </h2>
                  <p className="text-[0.875rem] text-muted-d">Kavak</p>
                </div>
                <Tag tone="dark">Remoto</Tag>
              </div>
              <p className="tabular text-[1.0625rem] text-ink-d">$65,000 – $90,000 MXN</p>
              <p className="mb-5 mt-1 text-[0.8125rem] text-muted-d">
                Ciudad de México · híbrido opcional
              </p>
              <div className="flex gap-2.5 border-t border-hairline-d pt-[18px]">
                <Link to="/vacantes">
                  <Button variant="primary" tone="dark" size="sm">
                    <ExternalLink size={14} strokeWidth={1.8} />
                    Ver vacante
                  </Button>
                </Link>
                <Link to="/vacantes">
                  <Button variant="ghost" tone="dark" size="sm">
                    <ArrowRight size={14} strokeWidth={1.8} />
                    Todas
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/*
          Estas tres cifras estuvieron escritas a mano —1,240 vacantes, 380
          empresas, $72k— mientras el muro público mostraba seis. Un hero que
          se contradice con la página siguiente destruye justo lo que esta
          landing promete: que los números son reales.

          Si la petición falla o no hay vacantes, la fila NO se pinta. Es
          preferible un hero sin métricas a un hero con métricas inventadas.
        */}
        {metricas && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE }}
            className="relative mx-auto mt-16 flex max-w-page flex-wrap gap-x-14 gap-y-6 border-t border-hairline-d px-6 pt-8 md:px-7"
          >
            <div>
              <p className="flex items-baseline gap-2.5">
                <CountUp
                  to={metricas.vacantes}
                  className="tabular text-[2rem] font-mid leading-none tracking-[-0.03em]"
                />
                {metricas.nuevas > 0 && (
                  <span className="tabular text-[0.8125rem] text-ink-2d">
                    +{metricas.nuevas} esta semana
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-[0.8125rem] text-muted-d">
                {metricas.vacantes === 1 ? 'Vacante activa' : 'Vacantes activas'}
              </p>
            </div>
            <div>
              <CountUp
                to={metricas.empresas}
                className="tabular block text-[2rem] font-mid leading-none tracking-[-0.03em]"
              />
              {/* "con vacantes" y no "verificadas": es lo que de verdad se
                  cuenta — empresas con al menos una oferta publicada. */}
              <p className="mt-1.5 text-[0.8125rem] text-muted-d">
                {metricas.empresas === 1 ? 'Empresa publicando' : 'Empresas publicando'}
              </p>
            </div>
            {metricas.salarioK > 0 && (
              <div>
                <CountUp
                  to={metricas.salarioK}
                  prefix="$"
                  suffix="k"
                  className="tabular block text-[2rem] font-mid leading-none tracking-[-0.03em]"
                />
                <p className="mt-1.5 text-[0.8125rem] text-muted-d">Salario promedio MXN</p>
              </div>
            )}
          </motion.div>
        )}

        {/*
          El titular de la siguiente sección vive AQUÍ, al final de la banda
          oscura, para que las tres cards puedan montarse sobre el filo. No es
          un capricho de composición: el degradado de esas cards no está
          pintado, es el vidrio refractando negro en su mitad de arriba y
          página clara en la de abajo. Sin filo que atravesar, el glass no
          tiene nada que hacer y la card se ve igual que una opaca.
        */}
        <motion.div
          {...revealViewport}
          className="relative mx-auto mt-[72px] max-w-page px-6 md:px-7"
        >
          <p className="mb-3 text-caption uppercase tracking-[0.06em] text-muted-d">Por qué TalentHub</p>
          <h2 className="max-w-[20ch] font-heading text-[clamp(1.625rem,3.6vw,2.375rem)] font-demi leading-[1.12] tracking-[-0.018em] text-ink-d">
            Tres cosas que no encuentras en otros portales
          </h2>
        </motion.div>
      </header>

      {/* ───────────── FEATURES · banda clara con sustrato ───────────── */}
      <section className="mesh-light flow-root bg-surface pb-[120px] md:pb-[152px]">
        <div className="relative mx-auto max-w-page px-6 md:px-7">
          <motion.div
            variants={stagger(0.09)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="glass-panel-overlap grid grid-cols-1 gap-[18px] md:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <motion.div key={title} variants={riseGlass} className="h-full">
                {/* Panel al 68% y no card al 46%: el tercio de arriba queda
                    sobre negro, y ahí `ink` al 46% cae a 4.02:1 — reprueba AA.
                    Al 68% da 8.4:1. La transparencia tiene techo y lo pone el texto. */}
                <div className="glass-panel glass-panel-hot edge-l edge-l-hot h-full p-7 transition-[transform,background-color,border-color,box-shadow] duration-300 ease-base hover:-translate-y-1">
                  <Icon size={20} strokeWidth={1.6} className="mb-[18px] text-ink" />
                  <h3 className="mb-2.5 text-sub font-demi text-ink">{title}</h3>
                  <p className="text-[0.90625rem] leading-relaxed text-ink-2">{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── CIERRE · banda oscura ───────────── */}
      <section className="relative overflow-hidden bg-night py-[104px] text-ink-d">
        <div className="accent-wash absolute inset-x-0 top-0 h-px" aria-hidden="true" />
        <div className="mx-auto max-w-page px-6 md:px-7">
          <motion.h2
            {...revealViewport}
            className="mb-4 max-w-[18ch] font-heading text-[clamp(1.75rem,4.4vw,2.75rem)] font-demi leading-[1.1] tracking-[-0.025em]"
          >
            Publica tu primera vacante hoy
          </motion.h2>
          <motion.p {...revealViewport} className="mb-8 max-w-[52ch] text-[1.0625rem] text-ink-2d">
            Revisión en menos de 24 horas y alcance a más de mil perfiles de TI verificados.
          </motion.p>
          <motion.div {...revealViewport}>
            <Link to="/planes">
              <Button variant="primary" tone="dark">
                <ArrowRight size={15} strokeWidth={1.8} />
                Empezar ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
