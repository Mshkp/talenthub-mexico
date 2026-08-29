import React, { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface Props {
  to: number;
  prefix?: string;
  suffix?: string;
  /** Milisegundos. */
  duration?: number;
  className?: string;
}

/**
 * Cuenta al entrar en pantalla, una sola vez.
 *
 * Con `prefers-reduced-motion` pinta el valor final de inmediato: la cifra
 * es información, no adorno, así que nunca se oculta.
 */
const CountUp: React.FC<Props> = ({ to, prefix = '', suffix = '', duration = 1500, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // easeOutCubic: arranca rápido y asienta, como un contador mecánico
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('es-MX')}
      {suffix}
    </span>
  );
};

export default CountUp;
