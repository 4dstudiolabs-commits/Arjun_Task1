import { useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { gsap } from 'gsap';
import { useTheme } from '../../theme/ThemeProvider';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({
  title = 'Dashboard',
  subtitle = 'Operational overview',
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!toggleRef.current) return;

    gsap.fromTo(
      toggleRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' },
    );
  }, []);

  const handleToggle = () => {
    if (!toggleRef.current) return;

    gsap.to(toggleRef.current, {
      rotate: 180,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        toggleTheme();
        gsap.set(toggleRef.current, { rotate: 0 });
      },
    });
  };

  return (
    <header className="flex items-center justify-between mb-6">
      {/* Page Context */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          ref={toggleRef}
          onClick={handleToggle}
          className="inline-flex items-center justify-center w-10 h-10 rounded-md
          border border-border-light dark:border-border-dark
          bg-surface-light dark:bg-surface-dark
          hover:bg-bg-light dark:hover:bg-bg-dark
          transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-text-muted" />
          )}
        </button>
      </div>
    </header>
  );
}
