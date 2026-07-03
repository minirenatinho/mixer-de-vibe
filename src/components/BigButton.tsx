import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'success' | 'warn' | 'danger' | 'ghost';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function BigButton({ variant = 'primary', className = '', ...rest }: BigButtonProps) {
  return <button className={`big-btn big-btn--${variant} ${className}`.trim()} {...rest} />;
}
