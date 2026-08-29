import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, MapPin, ExternalLink, X, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { Button, Card, EmptyState, Field, Input, Select, SkeletonList, Tag, TONO_MODALIDAD } from '../components/ui';
import { rise, stagger } from '../lib/motion';

interface Vacante {
  id: number;
  titulo: string;
  empresa_nombre: string;
  descripcion: string;
  salario_min: string;
  salario_max: string;
  modalidad: string;
  ubicacion: string;
  fecha_publicacion: string;
}

const MXN = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });

const Vacantes: React.FC = () => {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');

  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadFiltro, setModalidadFiltro] = useState('');
  const [salarioMin, setSalarioMin] = useState('');

  const fetchVacantes = useCallback(async () => {
    setEstado('cargando');
    try {
      const response = await api.get('/vacantes/');
      setVacantes(response.data);
      setEstado('listo');
    } catch (error) {
      // El error se cuenta en la propia página, no en un toast que desaparece:
      // aquí el usuario necesita una salida (reintentar), no solo un aviso.
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    fetchVacantes();
  }, [fetchVacantes]);

  const vacantesFiltradas = useMemo(() => {
    let resultado = vacantes;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (v) => v.titulo.toLowerCase().includes(q) || v.empresa_nombre.toLowerCase().includes(q)
      );
    }
    if (modalidadFiltro) {
      resultado = resultado.filter((v) => v.modalidad === modalidadFiltro);
    }
    if (salarioMin) {
      resultado = resultado.filter((v) => parseFloat(v.salario_max) >= parseFloat(salarioMin));
    }
    return resultado;
  }, [vacantes, searchTerm, modalidadFiltro, salarioMin]);

  const hayFiltros = Boolean(searchTerm || modalidadFiltro || salarioMin);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setModalidadFiltro('');
    setSalarioMin('');
  };

  return (
    <div className="min-h-screen mesh-page">
      {/* ── Banda oscura: el ancla que le faltaba a la página, y el sustrato del glass ── */}
      <header className="relative isolate mt-[calc(var(--nav-flow)*-1)] overflow-hidden bg-night pb-32 pt-[140px] text-ink-d">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-52 left-1/2 -z-10 h-[560px] w-[1000px] -translate-x-[58%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.15),transparent_74%)] blur-[6px]"
        />
        <div className="relative mx-auto max-w-page px-6 md:px-7">
          <h1 className="font-heading text-[clamp(2rem,4.4vw,3rem)] font-mid leading-none tracking-[-0.035em]">
            Vacantes
          </h1>
          <p className="tabular mt-3 text-sub text-ink-2d">
            {estado === 'listo'
              ? hayFiltros
                ? `${vacantesFiltradas.length} de ${vacantes.length} oportunidades`
                : `${vacantes.length} oportunidades abiertas`
              : 'Buscando oportunidades…'}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-6 pb-20 md:px-7">
        {/* ── Filtros en glass, a caballo entre la banda oscura y el cuerpo claro.
             El fondo cambia a través del panel: ahí es donde el glass se ve. ── */}
        <div className="glass-panel glass-panel-overlap edge-l mb-8 p-7">
          <div className="mb-5 flex items-center gap-2.5">
            <SlidersHorizontal size={16} strokeWidth={1.7} className="text-muted" />
            <h2 className="text-[0.9375rem] font-mid text-ink">Filtrar resultados</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field label="Buscar" htmlFor="f-buscar">
              <Input
                id="f-buscar"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Título o empresa…"
              />
            </Field>

            <Field label="Modalidad" htmlFor="f-modalidad">
              <Select
                id="f-modalidad"
                value={modalidadFiltro}
                onChange={(e) => setModalidadFiltro(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </Select>
            </Field>

            <Field label="Salario mínimo" htmlFor="f-salario" hint="En pesos mexicanos">
              <Input
                id="f-salario"
                type="number"
                value={salarioMin}
                onChange={(e) => setSalarioMin(e.target.value)}
                placeholder="30000"
              />
            </Field>

            <div className="flex items-start md:pt-[26px]">
              <Button variant="ghost" className="w-full" onClick={limpiarFiltros} disabled={!hayFiltros}>
                <X size={14} strokeWidth={1.8} />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>

        {/* ── Resultados ── */}
        {estado === 'cargando' && <SkeletonList count={4} />}

        {estado === 'error' && (
          <EmptyState
            title="No pudimos cargar las vacantes"
            description="El servidor no respondió. Puede ser una caída momentánea o tu conexión."
            action={
              <Button variant="ghost" onClick={fetchVacantes}>
                <RotateCcw size={14} strokeWidth={1.8} />
                Reintentar
              </Button>
            }
          />
        )}

        {estado === 'listo' && vacantesFiltradas.length === 0 && (
          <EmptyState
            title={hayFiltros ? 'Ninguna vacante coincide' : 'Todavía no hay vacantes publicadas'}
            description={
              hayFiltros
                ? 'Prueba con otros términos o amplía el rango salarial.'
                : 'En cuanto las empresas publiquen, aparecerán aquí.'
            }
            action={
              hayFiltros ? (
                <Button variant="ghost" onClick={limpiarFiltros}>
                  <X size={14} strokeWidth={1.8} />
                  Limpiar filtros
                </Button>
              ) : undefined
            }
          />
        )}

        {estado === 'listo' && vacantesFiltradas.length > 0 && (
          <motion.ul
            variants={stagger(0.06)}
            initial="hidden"
            animate="show"
            className="flex list-none flex-col gap-3.5 p-0"
          >
            {vacantesFiltradas.map((vacante) => (
              <motion.li key={vacante.id} variants={rise}>
                <Card as="article" glass interactive>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[1.3125rem] font-demi tracking-[-0.012em] text-ink">
                        {vacante.titulo}
                      </h3>
                      <p className="mt-1 text-[0.875rem] text-muted">{vacante.empresa_nombre}</p>
                    </div>
                    <Tag tono={TONO_MODALIDAD[vacante.modalidad] ?? 'neutro'}>
                      {vacante.modalidad.charAt(0).toUpperCase() + vacante.modalidad.slice(1)}
                    </Tag>
                  </div>

                  <p className="mb-[18px] mt-3.5 max-w-[66ch] text-[0.90625rem] leading-relaxed text-ink-2">
                    {vacante.descripcion.length > 180
                      ? `${vacante.descripcion.slice(0, 180).trimEnd()}…`
                      : vacante.descripcion}
                  </p>

                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="tabular text-[1.03125rem] text-ink">
                        ${MXN.format(parseFloat(vacante.salario_min))} – $
                        {MXN.format(parseFloat(vacante.salario_max))} MXN
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-muted">
                        <MapPin size={13} strokeWidth={1.7} />
                        {vacante.ubicacion}
                      </p>
                    </div>
                    <Link to={`/vacantes/${vacante.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink size={14} strokeWidth={1.8} />
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
};

export default Vacantes;
