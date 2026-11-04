'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function OrderSuccessConfetti() {
  useEffect(() => {
    const end = Date.now() + 2 * 1000;
    const colors = ['#D4AF37', '#F5E6C8', '#10B981', '#E6CA65', '#9A7B1C'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return null;
}
