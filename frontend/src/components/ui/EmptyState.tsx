import React from 'react';
import { cx } from '../../lib/cx';

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: 'light' | 'dark';
}

/**
 * Sin ilustración a propósito: el sistema no usa illustration y meter una
 * lo delataría como plantilla.
 */
const EmptyState: React.FC<Props> = ({ title, description, action, tone = 'light' }) => (
  <div
    className={cx(
      'flex flex-col items-center rounded-card border border-dashed px-6 py-14 text-center',
      tone === 'dark' ? 'border-hairline-d' : 'border-hairline'
    )}
  >
    <h3 className={cx('text-h3 font-demi', tone === 'dark' ? 'text-ink-d' : 'text-ink')}>{title}</h3>
    {description && (
      <p className={cx('mt-2 max-w-[46ch] text-body', tone === 'dark' ? 'text-ink-2d' : 'text-ink-2')}>{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
