import { useCallback, useEffect, useRef } from 'react';

interface FocusableElement {
  el: HTMLElement;
  row: number;
  col: number;
}

/**
 * D-pad spatial navigation for TV remotes.
 *
 * Collects all elements with [data-focusable] attribute on key events,
 * sorts them by their screen position into rows/columns, and moves
 * focus in the direction of the arrow key. Falls back to DOM order
 * proximity when the grid layout is ambiguous.
 */
export function useDpadNav() {
  const lastDirection = useRef<string>('');

  const getFocusables = useCallback((): FocusableElement[] => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-focusable]:not([disabled])')
    );
    const visible = els.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    // Sort by vertical then horizontal position, then group into rows
    visible.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      if (Math.abs(ra.top - rb.top) > 30) return ra.top - rb.top;
      return ra.left - rb.left;
    });

    // Assign row/col based on vertical grouping
    const result: FocusableElement[] = [];
    let currentRow = -1;
    let lastTop = -Infinity;
    let colCount = 0;

    for (const el of visible) {
      const rect = el.getBoundingClientRect();
      if (Math.abs(rect.top - lastTop) > 30) {
        currentRow++;
        colCount = 0;
        lastTop = rect.top;
      }
      result.push({ el, row: currentRow, col: colCount });
      colCount++;
    }

    return result;
  }, []);

  const move = useCallback(
    (direction: string) => {
      const focusables = getFocusables();
      if (focusables.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const currentIndex = active
        ? focusables.findIndex((f) => f.el === active)
        : -1;

      if (currentIndex === -1) {
        focusables[0].el.focus();
        return;
      }

      const current = focusables[currentIndex];

      let candidates: FocusableElement[] = [];

      switch (direction) {
        case 'ArrowRight':
          candidates = focusables.filter(
            (f) => f.row === current.row && f.col > current.col
          );
          break;
        case 'ArrowLeft':
          candidates = focusables.filter(
            (f) => f.row === current.row && f.col < current.col
          );
          break;
        case 'ArrowDown':
          candidates = focusables.filter(
            (f) => f.row > current.row
          );
          break;
        case 'ArrowUp':
          candidates = focusables.filter(
            (f) => f.row < current.row
          );
          break;
      }

      if (candidates.length === 0) {
        // Wrap around for horizontal, skip for vertical at edges
        if (direction === 'ArrowRight') {
          const sameRowLeft = focusables.filter(
            (f) => f.row === current.row && f.col < current.col
          );
          if (sameRowLeft.length > 0) {
            // Check if there's a next row to go to instead
            const nextRow = focusables.filter((f) => f.row === current.row + 1);
            if (nextRow.length > 0) {
              nextRow[0].el.focus();
              return;
            }
            sameRowLeft[0].el.focus();
            return;
          }
        }
        if (direction === 'ArrowLeft') {
          const sameRowRight = focusables.filter(
            (f) => f.row === current.row && f.col > current.col
          );
          if (sameRowRight.length > 0) {
            const prevRow = focusables.filter((f) => f.row === current.row - 1);
            if (prevRow.length > 0) {
              prevRow[prevRow.length - 1].el.focus();
              return;
            }
            sameRowRight[sameRowRight.length - 1].el.focus();
            return;
          }
        }
        return;
      }

      // Find closest candidate
      let target: FocusableElement;

      if (direction === 'ArrowDown' || direction === 'ArrowUp') {
        // Find the candidate in the closest row with the nearest column
        const sortedByRowDiff = [...candidates].sort((a, b) => {
          const rowDiffA = Math.abs(a.row - current.row);
          const rowDiffB = Math.abs(b.row - current.row);
          if (rowDiffA !== rowDiffB) return rowDiffA - rowDiffB;
          return Math.abs(a.col - current.col) - Math.abs(b.col - current.col);
        });
        target = sortedByRowDiff[0];
      } else {
        // Horizontal: closest in same row
        const sorted = [...candidates].sort(
          (a, b) => Math.abs(a.col - current.col) - Math.abs(b.col - current.col)
        );
        target = sorted[0];
      }

      target.el.focus();
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
