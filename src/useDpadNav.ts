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

      const candidates: { f: FocusableElement; dist: number; dx: number; dy: number }[] = [];

      for (let i = 0; i < focusables.length; i++) {
        if (i === currentIndex) continue;
        const f = focusables[i];
        const candCenter = {
          x: f.rect.left + f.rect.width / 2,
          y: f.rect.top + f.rect.height / 2,
        };

        const dx = candCenter.x - curCenter.x;
        const dy = candCenter.y - curCenter.y;

        let isValid = false;

        if (direction === 'ArrowRight') {
          // Estrictamente a la derecha y dentro de la misma línea horizontal
          isValid = dx > 5 && Math.abs(dy) < 80;
        } else if (direction === 'ArrowLeft') {
          // Estrictamente a la izquierda y dentro de la misma línea horizontal
          isValid = dx < -5 && Math.abs(dy) < 80;
        } else if (direction === 'ArrowDown') {
          // Hacia abajo: debe estar en una fila inferior (dy > 20) y no tan desplazado horizontalmente
          isValid = dy > 20 && dy < 350 && Math.abs(dx) < 300;
        } else if (direction === 'ArrowUp') {
          // Hacia arriba: debe estar en una fila superior (dy < -20)
          isValid = dy < -20 && dy > -350 && Math.abs(dx) < 300;
        }

        if (isValid) {
          const dist = Math.hypot(dx, dy);
          candidates.push({ f, dist, dx, dy });
        }
      }

      if (candidates.length === 0) {
        return;
      }

      if (direction === 'ArrowDown' || direction === 'ArrowUp') {
        // En movimiento vertical, filtramos prioritariamente las tarjetas de la *siguiente* fila inmediata
        const minDy = direction === 'ArrowDown'
          ? Math.min(...candidates.map((c) => c.dy))
          : Math.max(...candidates.map((c) => c.dy));

        // Tolerancia de 50px para capturar todas las columnas de esa misma fila exacta y descartar las de abajo
        const rowCandidates = candidates.filter((c) => Math.abs(c.dy - minDy) < 60);

        // De esa fila inmediata, elegimos la que esté más alineada horizontalmente con el elemento actual
        rowCandidates.sort((a, b) => Math.abs(a.dx) - Math.abs(b.dx));
        rowCandidates[0].f.el.focus();
      } else {
        // En movimiento horizontal, elegimos la tarjeta más cercana en la misma fila
        candidates.sort((a, b) => a.dist - b.dist);
        candidates[0].f.el.focus();
      }
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