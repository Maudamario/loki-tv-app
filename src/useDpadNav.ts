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

      const scoredCandidates: { f: FocusableElement; score: number }[] = [];

      for (let i = 0; i < focusables.length; i++) {
        if (i === currentIndex) continue;
        const f = focusables[i];
        const candCenter = {
          x: f.rect.left + f.rect.width / 2,
          y: f.rect.top + f.rect.height / 2,
        };

        const dx = candCenter.x - curCenter.x;
        const dy = candCenter.y - curCenter.y;

        let isValidDirection = false;
        let score = 0;

        if (direction === 'ArrowRight') {
          // Estrictamente a la derecha y dentro del margen de la misma fila (evita saltar al header)
          if (dx > 5 && Math.abs(dy) < 120) {
            isValidDirection = true;
            score = dx + Math.abs(dy) * 3;
          }
        } else if (direction === 'ArrowLeft') {
          // Estrictamente a la izquierda y dentro del margen de la misma fila
          if (dx < -5 && Math.abs(dy) < 120) {
            isValidDirection = true;
            score = -dx + Math.abs(dy) * 3;
          }
        } else if (direction === 'ArrowDown') {
          // Hacia abajo entre filas
          if (dy > 5) {
            isValidDirection = true;
            score = dy + Math.abs(dx) * 0.5;
          }
        } else if (direction === 'ArrowUp') {
          // Hacia arriba entre filas
          if (dy < -5) {
            isValidDirection = true;
            score = -dy + Math.abs(dx) * 0.5;
          }
        }

        if (isValidDirection) {
          scoredCandidates.push({ f, score });
        }
      }

      if (scoredCandidates.length === 0) {
        return;
      }

      // Ordenar por el menor costo (el elemento más cercano y mejor alineado en esa dirección)
      scoredCandidates.sort((a, b) => a.score - b.score);
      scoredCandidates[0].f.el.focus();
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