import { useCallback, useEffect, useRef } from 'react';

interface FocusableElement {
  el: HTMLElement;
  rect: DOMRect;
}

export function useDpadNav() {
  const lastDirection = useRef<string>('');

  const getFocusables = useCallback((): FocusableElement[] => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-focusable]:not([disabled]):not([hidden])')
    );
    return els
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0);
  }, []);

  const move = useCallback(
    (direction: string) => {
      const focusables = getFocusables();
      if (focusables.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      let currentIndex = focusables.findIndex((f) => f.el === active);

      if (currentIndex === -1) {
        focusables[0].el.focus();
        return;
      }

      const current = focusables[currentIndex];
      const curCenter = {
        x: current.rect.left + current.rect.width / 2,
        y: current.rect.top + current.rect.height / 2,
      };

      const candidates = focusables.filter((f, idx) => {
        if (idx === currentIndex) return false;
        const candCenter = {
          x: f.rect.left + f.rect.width / 2,
          y: f.rect.top + f.rect.height / 2,
        };

        const dx = candCenter.x - curCenter.x;
        const dy = candCenter.y - curCenter.y;

        switch (direction) {
          // Se tolera un pequeño margen de desviación diagonal para que la navegación sea natural
          case 'ArrowRight':
            return dx > 5 && Math.abs(dy) < Math.max(current.rect.height * 1.5, 80);
          case 'ArrowLeft':
            return dx < -5 && Math.abs(dy) < Math.max(current.rect.height * 1.5, 80);
          case 'ArrowDown':
            return dy > 5 && Math.abs(dx) < Math.max(current.rect.width * 2, 250);
          case 'ArrowUp':
            return dy < -5 && Math.abs(dx) < Math.max(current.rect.width * 2, 250);
          default:
            return false;
        }
      });

      if (candidates.length === 0) {
        // Búsqueda de respaldo global en la misma dirección si no hay candidatos estrictos
        const fallback = focusables.filter((f, idx) => {
          if (idx === currentIndex) return false;
          const candCenter = {
            x: f.rect.left + f.rect.width / 2,
            y: f.rect.top + f.rect.height / 2,
          };
          const dx = candCenter.x - curCenter.x;
          const dy = candCenter.y - curCenter.y;
          if (direction === 'ArrowRight') return dx > 0;
          if (direction === 'ArrowLeft') return dx < 0;
          if (direction === 'ArrowDown') return dy > 0;
          if (direction === 'ArrowUp') return dy < 0;
          return false;
        });

        if (fallback.length > 0) {
          fallback.sort((a, b) => {
            const distA = Math.hypot(
              a.rect.left + a.rect.width / 2 - curCenter.x,
              a.rect.top + a.rect.height / 2 - curCenter.y
            );
            const distB = Math.hypot(
              b.rect.left + b.rect.width / 2 - curCenter.x,
              b.rect.top + b.rect.height / 2 - curCenter.y
            );
            return distA - distB;
          });
          fallback[0].el.focus();
        }
        return;
      }

      // Ordenar candidatos por distancia euclidiana y alineación preferida
      candidates.sort((a, b) => {
        const centerA = { x: a.rect.left + a.rect.width / 2, y: a.rect.top + a.rect.height / 2 };
        const centerB = { x: b.rect.left + b.rect.width / 2, y: b.rect.top + b.rect.height / 2 };
        
        const distA = Math.hypot(centerA.x - curCenter.x, centerA.y - curCenter.y);
        const distB = Math.hypot(centerB.x - curCenter.x, centerB.y - curCenter.y);

        return distA - distB;
      });

      candidates[0].el.focus();
    },
    [getFocusables]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrows.includes(e.key)) {
        e.preventDefault();
        lastDirection.current = e.key;
        move(e.key);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  return { move };
}