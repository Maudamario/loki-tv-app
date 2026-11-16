import { useEffect, useState } from 'react';

export function VirtualMouse() {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [visible, setVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const first = document.querySelector<HTMLElement>('button, a, input, [data-focusable]');
      if (first) {
        const rect = first.getBoundingClientRect();
        setPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setInitialized(true);
      }
    }
  }, [initialized]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrows.includes(e.key)) {
        e.preventDefault();
        setVisible(true);

        const elements = Array.from(
          document.querySelectorAll<HTMLElement>('button, a, input, [data-focusable]')
        ).filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        if (elements.length === 0) return;

        let currentIndex = 0;
        let minDistance = Infinity;

        elements.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(cx - pos.x, cy - pos.y);
          if (dist < minDistance) {
            minDistance = dist;
            currentIndex = idx;
          }
        });

        const currentEl = elements[currentIndex];
        const curRect = currentEl.getBoundingClientRect();
        const curCenter = {
          x: curRect.left + curRect.width / 2,
          y: curRect.top + curRect.height / 2,
        };

        // Tipado fuerte y explícito como HTMLElement o null
        let bestTarget: HTMLElement | null = null;
        let bestScore = Infinity;

        elements.forEach((el, idx) => {
          if (idx === currentIndex) return;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;

          const dx = cx - curCenter.x;
          const dy = cy - curCenter.y;

          let isValid = false;
          let score = Infinity;

          if (e.key === 'ArrowRight') {
            if (dx > 5 && Math.abs(dy) < Math.max(curRect.height * 1.5, 120)) {
              isValid = true;
              score = dx + Math.abs(dy) * 2;
            }
          } else if (e.key === 'ArrowLeft') {
            if (dx < -5 && Math.abs(dy) < Math.max(curRect.height * 1.5, 120)) {
              isValid = true;
              score = -dx + Math.abs(dy) * 2;
            }
          } else if (e.key === 'ArrowDown') {
            if (dy > 10 && Math.abs(dx) < Math.max(curRect.width * 2, 350)) {
              isValid = true;
              score = dy + Math.abs(dx) * 0.4;
            }
          } else if (e.key === 'ArrowUp') {
            if (dy < -10 && Math.abs(dx) < Math.max(curRect.width * 2, 350)) {
              isValid = true;
              score = -dy + Math.abs(dx) * 0.4;
            }
          }

          if (isValid && score < bestScore) {
            bestScore = score;
            bestTarget = el;
          }
        });

        if (bestTarget) {
          // Aserción explícita de tipo para garantizar compatibilidad total con TS
          const target = bestTarget as HTMLElement;
          const targetRect = target.getBoundingClientRect();
          const newX = targetRect.left + targetRect.width / 2;
          const newY = targetRect.top + targetRect.height / 2;
          setPos({ x: newX, y: newY });
          target.focus();
        }
      }

      if (e.key === 'Enter' || e.key === 'NumpadEnter' || e.keyCode === 23) {
        e.preventDefault();
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
      className="fixed pointer-events-none z-[99999] transition-all duration-200 ease-out"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-8 h-8 rounded-full bg-loki-green/90 border-2 border-white shadow-[0_0_20px_rgba(34,197,94,0.9)] flex items-center justify-center animate-pulse">
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
}