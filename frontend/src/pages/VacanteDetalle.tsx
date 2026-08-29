import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, CalendarDays, ArrowRight, Send, LogIn } from 'lucide-react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/alerts';
import { Button, Card, EmptyState, SkeletonCard, Tag, TONO_MODALIDAD } from '../components/ui';
import { rise, stagger } from '../lib/motion';

interface Vacante {
  id: number;
  titulo: string;
  empresa_nombre: string;
  descripcion: string;
  requisitos: any;
  salario_min: string;
  salario_max: string;
  modalidad: string;
  ubicacion: string;
  fecha_publicacion: string;
  activa: boolean;
}

const MXN = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });

/** La ruta de regreso depende del rol: cada uno llegó aquí desde otro lado. */
const REGRESO: Record<string, { ruta: string; texto: string }> = {
  empresa: { ruta: '/dashboard', texto: 'Volver al dashboard' },
  validador: { ruta: '/validador', texto: 'Volver al centro de validación' },
};

const VacanteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacante, setVacante] = useState<Vacante | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [enviando, setEnviando] = useState(false);

  const userTipo = localStorage.getItem('user_tipo') ?? '';
  const { ruta: rutaRegreso, texto: textoRegreso } =
    REGRESO[userTipo] ?? { ruta: '/vacantes', texto: 'Volver a vacantes' };

  const fetchVacante = useCallback(async () => {
    setEstado('cargando');
    try {
      const response = await api.get(`/vacantes/${id}/`);
      setVacante(response.data);
      setEstado('listo');
    } catch (error) {
      console.error('Error:', error);
      setEstado('error');
    }
  }, [id]);

  useEffect(() => {
    fetchVacante();
  }, [fetchVacante]);

  const handleAplicar = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      showError('Inicia sesión para postularte a esta vacante.', 'Falta un paso');
      navigate('/login');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/aplicaciones/', { vacante: id, usuario: userId, estado: 'pendiente' });
      showSuccess('Tu CV guardado se adjuntó automáticamente.', 'Postulación enviada');
      navigate('/mis-aplicaciones');
    } catch (error: any) {
      const errorData = error.response?.data;

      if (errorData?.error === 'CV_MISSING') {
        showError('Sube tu CV en Mi perfil antes de postularte.', 'No tienes un CV guardado');
        navigate('/mi-perfil');
      } else if (error.response?.status === 400) {
        showError(errorData?.detail || 'Ya te postulaste a esta vacante o faltan datos.');
      } else {
        showError('No se pudo enviar tu postulación. Inténtalo de nuevo.');
      }
      setEnviando(false);
    }
  };

  if (estado === 'cargando') {
    return (
      <div className="min-h-screen mesh-page">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-10 md:px-7 md:pt-12">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (estado === 'error' || !vacante) {
    return (
      <div className="min-h-screen mesh-page">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-10 md:px-7 md:pt-12">
          <EmptyState
            title="No encontramos esta vacante"
            description="Puede que se haya despublicado o que el enlace esté mal."
            action={
              <Link to="/vacantes">
                <Button variant="ghost">
                  <ArrowRight size={15} strokeWidth={1.8} />
                  Ver todas las vacantes
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const requisitos = vacante.requisitos;
  const esObjeto = requisitos && typeof requisitos === 'object';

  return (
    <div className="min-h-screen mesh-page">
      {/* ── Banda oscura: identidad de la vacante ── */}
      <header className="relative isolate mt-[calc(var(--nav-flow)*-1)] overflow-hidden bg-night pb-32 pt-[130px] text-ink-d">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-52 left-1/2 -z-10 h-[560px] w-[1000px] -translate-x-[58%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.15),transparent_74%)] blur-[6px]"
        />
        <div className="relative mx-auto max-w-4xl px-6 md:px-7">
          <Link
            to={rutaRegreso}
            className="mb-7 inline-flex items-center gap-2 text-[0.875rem] text-muted-d transition-colors hover:text-ink-d"
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            {textoRegreso}
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-mid leading-tight tracking-[-0.03em]">
                {vacante.titulo}
              </h1>
              <p className="mt-2.5 text-sub text-ink-2d">{vacante.empresa_nombre}</p>
            </div>
            <Tag tone="dark" tono={TONO_MODALIDAD[vacante.modalidad] ?? 'neutro'}>
              {vacante.modalidad.charAt(0).toUpperCase() + vacante.modalidad.slice(1)}
            </Tag>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-[0.875rem] text-muted-d">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.7} />
              {vacante.ubicacion}
            </span>
            <span className="tabular inline-flex items-center gap-1.5">
              <CalendarDays size={14} strokeWidth={1.7} />
              {new Date(vacante.fecha_publicacion).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </header>

      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl px-6 pb-20 md:px-7"
      >
        {/* ── La hoja en glass, montada sobre la banda: el documento ── */}
        <div className="glass-panel glass-panel-overlap edge-l mb-5 p-7 md:p-9">
        {/* ── Salario: sin caja de color, el peso lo da la tipografía ── */}
        <motion.section variants={rise} className="border-b border-hairline pb-8">
          <p className="text-[0.8125rem] uppercase tracking-[0.06em] text-ink-2">Rango salarial</p>
          <p className="tabular mt-2.5 text-[clamp(1.5rem,3.4vw,2rem)] font-mid leading-none tracking-[-0.025em] text-ink">
            ${MXN.format(parseFloat(vacante.salario_min))} – ${MXN.format(parseFloat(vacante.salario_max))}{' '}
            <span className="ml-1 text-[0.9375rem] font-normal text-muted">MXN mensuales</span>
          </p>
        </motion.section>

        {/* ── Descripción ── */}
        <motion.section variants={rise} className="border-b border-hairline py-8">
          <h2 className="mb-4 text-h3 font-demi text-ink">Descripción del puesto</h2>
          <p className="max-w-[68ch] whitespace-pre-line text-[1.0625rem] leading-relaxed text-ink-2">
            {vacante.descripcion}
          </p>
        </motion.section>

        {/* ── Requisitos ── */}
        <motion.section variants={rise} className="pt-8">
          <h2 className="mb-5 text-h3 font-demi text-ink">Requisitos</h2>

          {esObjeto ? (
            <div className="flex flex-col gap-7">
              {requisitos?.lenguajes?.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[0.8125rem] uppercase tracking-[0.06em] text-muted">
                    Tecnologías
                  </h3>
                  <ul className="flex list-none flex-wrap gap-2 p-0">
                    {requisitos.lenguajes.map((tech: string) => (
                      <li key={tech}>
                        <Tag>{tech}</Tag>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {requisitos?.experiencia && (
                <div>
                  <h3 className="mb-2 text-[0.8125rem] uppercase tracking-[0.06em] text-muted">
                    Experiencia
                  </h3>
                  <p className="max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-2">
                    {requisitos.experiencia}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="max-w-[68ch] text-[1.0625rem] leading-relaxed text-ink-2">{requisitos}</p>
          )}
        </motion.section>

        </div>

        {/* ── Acción según rol: fuera de la hoja, es la decisión no el documento ── */}
        <motion.section variants={rise}>
          {userTipo === 'aspirante' ? (
            <div>
              <Button variant="accent" className="w-full" onClick={handleAplicar} disabled={enviando}>
                <Send size={15} strokeWidth={1.8} />
                {enviando ? 'Enviando…' : 'Postularme a esta vacante'}
              </Button>
              <p className="mt-4 text-center text-[0.875rem] text-muted">
                Tu perfil y tu CV se envían directamente a {vacante.empresa_nombre}.
              </p>
            </div>
          ) : userTipo === 'empresa' ? (
            <Card>
              <p className="text-body text-ink">Esta es una vacante publicada en la plataforma.</p>
              <p className="mt-2 text-[0.9375rem] text-ink-2">
                Puedes gestionar las tuyas desde el{' '}
                <Link to="/dashboard" className="text-accent hover:underline">
                  dashboard
                </Link>
                .
              </p>
            </Card>
          ) : userTipo === 'validador' ? (
            <Card>
              <p className="text-[0.8125rem] uppercase tracking-[0.06em] text-muted">Vista de auditoría</p>
              <p className="mt-2 text-body text-ink">
                Estás viendo esta vacante como parte de tu revisión de calidad.
              </p>
            </Card>
          ) : (
            <Card className="text-center">
              <p className="text-body text-ink-2">Inicia sesión para postularte a esta vacante.</p>
              <div className="mt-5">
                <Link to="/login">
                  <Button variant="accent">
                    <LogIn size={15} strokeWidth={1.8} />
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
};

export default VacanteDetalle;
