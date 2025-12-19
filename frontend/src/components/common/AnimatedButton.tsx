import { useRef } from 'react';
import { gsap } from 'gsap';
import clsx from 'clsx';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
  type = 'button',
}: AnimatedButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (disabled || !btnRef.current) return;
    gsap.to(btnRef.current, {
      scale: 1.03,
      duration: 0.15,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (disabled || !btnRef.current) return;
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.15,
      ease: 'power2.out',
    });
  };

  const handleMouseDown = () => {
    if (disabled || !btnRef.current) return;
    gsap.to(btnRef.current, {
      scale: 0.97,
      duration: 0.1,
    });
  };

  const handleMouseUp = () => {
    if (disabled || !btnRef.current) return;
    gsap.to(btnRef.current, {
      scale: 1.03,
      duration: 0.1,
    });
  };

  const baseStyles =
    'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-hover disabled:bg-border-light dark:disabled:bg-border-dark',
    secondary:
      'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-bg-light dark:hover:bg-bg-dark',
    danger:
      'bg-danger text-white hover:bg-red-700 disabled:bg-red-300',
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={clsx(
        baseStyles,
        variants[variant],
        disabled && 'cursor-not-allowed opacity-70',
        className,
      )}
    >
      {children}
    </button>
  );
}
