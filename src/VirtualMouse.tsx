import { useEffect, useRef, useState } from 'react';

export function VirtualMouse() {
  const posRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
  });
  const [pos, setPos] = useState(posRef.current);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const step = 32;
    const edgeMargin = 80;

    const handleKeyDown = (e: KeyboardEvent) => {
      const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrows.includes(e.key)) {
        e.preventDefault();
        setVisible(true);

        const maxX = Math.max(24, window.innerWidth - 16);
        const maxY = Math.max(24, window.innerHeight - 16);

        let nx = posRef.current.x;
        let ny = posRef.current.y;

        if (e.key === 'ArrowUp') {
          ny = Math.max(16, ny - step);
          if (ny < edgeMargin) {
            window.scrollBy({ top: -step * 2, behavior: 'auto' });
          }
        } else if (e.key === 'ArrowDown') {
          ny = Math.min(maxY, ny + step);
          if (ny > window.innerHeight - edgeMargin) {
            window.scrollBy({ top: step * 2, behavior: 'auto' });
          }
        } else if (e.key === 'ArrowLeft') {
          nx = Math.max(16, nx - step);
        } else if (e.key === 'ArrowRight') {
          nx = Math.min(maxX, nx + step);
        }

        const next = { x: nx, y: ny };
        posRef.current = next;
        setPos(next);
        return;
      }

      if (e.key === 'Enter' || e.key === 'NumpadEnter' || e.keyCode === 23) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
          return;
        }
        e.preventDefault();
        const { x, y } = posRef.current;
        const el = document.elementFromPoint(x, y) as HTMLElement | null;
        if (el) {
          const clickable = el.closest(
            'button, a, input, select, textarea, label, [role="button"]'
          ) as HTMLElement | null;
          if (clickable) {
            clickable.focus();
            clickable.click();
          } else {
            el.click();
          }
        }
      }
    };

    const handlePointerOrMouse = () => {
      setVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handlePointerOrMouse);
    window.addEventListener('touchstart', handlePointerOrMouse, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handlePointerOrMouse);
      window.removeEventListener('touchstart', handlePointerOrMouse);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] transition-transform duration-75 ease-out"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-7 h-7 rounded-full bg-loki-green/95 border-2 border-white shadow-[0_0_16px_rgba(34,197,94,0.95)] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    </div>
  );
}