import { useEffect, useState } from 'react';

export function VirtualMouse() {
  const [pos, setPos] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const step = 45; // Velocidad de desplazamiento del cursor por cada pulsación de flecha

    const handleKeyDown = (e: KeyboardEvent) => {
      const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrows.includes(e.key)) {
        e.preventDefault();
        setVisible(true); // Muestra el cursor en cuanto se usa el control remoto

        setPos((prev) => {
          let nx = prev.x;
          let ny = prev.y;

          if (e.key === 'ArrowUp') ny = Math.max(20, ny - step);
          if (e.key === 'ArrowDown') ny = Math.min(window.innerHeight - 20, ny + step);
          if (e.key === 'ArrowLeft') nx = Math.max(20, nx - step);
          if (e.key === 'ArrowRight') nx = Math.min(window.innerWidth - 20, nx + step);

          return { x: nx, y: ny };
        });
      }

      // Al presionar OK / Enter del control remoto o teclado
      if (e.key === 'Enter' || e.key === 'NumpadEnter' || e.keyCode === 23) {
        e.preventDefault();
        // Detecta qué elemento está exactamente debajo del cursor virtual en ese instante
        const el = document.elementFromPoint(pos.x, pos.y) as HTMLElement | null;
        if (el) {
          const clickable = el.closest('button, a, input, select, [role="button"]') as HTMLElement | null;
          if (clickable) {
            clickable.click();
          } else {
            el.click();
          }
        }
      }
    };

    // Si el usuario usa un mouse real o toca la pantalla, ocultamos el cursor virtual
    const handleMouseMove = () => setVisible(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pos]);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] transition-all duration-75 ease-out"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Círculo estilo puntero de TV Box con los colores de LOKI */}
      <div className="w-8 h-8 rounded-full bg-loki-green/90 border-2 border-white shadow-[0_0_20px_rgba(34,197,94,0.9)] flex items-center justify-center animate-pulse">
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
}