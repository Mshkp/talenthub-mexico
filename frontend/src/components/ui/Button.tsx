import React from 'react';
import { cx } from '../../lib/cx';

type Variant = 'primary' | 'accent' | 'ghost';
type Tone = 'light' | 'dark';
type Size = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Registro de la superficie donde vive el botón, no del botón. */
  tone?: Tone;
  size?: Size;
}

/**
 * Pill de 9999px en todas sus formas — es la silueta que define el sistema.
 * `primary` siempre invierte la superficie: sólido oscuro sobre claro,
 * sólido blanco sobre oscuro. Uno por sección.
 */
const VARIANTS: Record<Tone, Record<Variant, string>> = {
  light: {
    primary: 'bg-ink text-white hover:bg-[#2b2b2b]',
    accent: 'bg-accent text-white hover:bg-accent-hover',
    ghost: 'bg-transparent text-ink border border-hairline hover:border-hairline-strong hover:bg-black/[0.02]',
  },
  dark: {
    primary: 'bg-white text-ink hover:bg-[#e9e9ea]',
    accent: 'bg-accent text-white hover:bg-accent-hover',
    ghost: 'bg-transparent text-white/90 border border-hairline-d hover:border-hairline-d-strong hover:bg-white/[0.05]',
  },
};

const SIZES: Record<Size, string> = {
  sm: 'text-[0.875rem] px-[18px] py-2',
  md: 'text-[0.9375rem] px-[22px] py-[11px]',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', tone = 'light', size = 'md', className, type = 'button', children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-pill font-mid',
        // Curva base, no de rebote: un sobrepaso sobre `background-color` empuja
        // la interpolación MÁS ALLÁ del color destino y la regresa — un parpadeo
        // en cada hover. El overshoot solo tiene sentido físico en `transform`,
        // y ahí el press ya lo da `active:scale`.
        'transition-[transform,background-color,border-color,color] duration-150 ease-base',
        'active:scale-[0.96] disabled:opacity-45 disabled:pointer-events-none',
        SIZES[size],
        VARIANTS[tone][variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export default Button;
