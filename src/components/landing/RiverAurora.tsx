import React, { useEffect, useRef } from 'react';

interface RiverAuroraProps {
  darkMode: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface CubicSegment {
  p0: Point;
  cp1: Point;
  cp2: Point;
  p3: Point;
}

interface RibbonSpec {
  dx: number;
  dy: number;
  spread: number;
  /** [tailHex, midHex, headHex, coreHex] — Pure Pastel Blue palette */
  colors: [string, string, string, string];
  coreWidth: number;
  haloWidth: number;
  scrollRange: [number, number];
  parallaxY: number;
  swaySpeed: number;
  swayAmp: number;
  swayPhase: number;
  curtainIndices: number[];
}

/**
 * Evaluates a cubic Bezier segment at t in [0, 1].
 */
function evalCubic(seg: CubicSegment, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      mt3 * seg.p0.x +
      3 * mt2 * t * seg.cp1.x +
      3 * mt * t2 * seg.cp2.x +
      t3 * seg.p3.x,
    y:
      mt3 * seg.p0.y +
      3 * mt2 * t * seg.cp1.y +
      3 * mt * t2 * seg.cp2.y +
      t3 * seg.p3.y,
  };
}

/**
 * Samples the C1-continuous river trajectory in normalized [0..1440] x [0..1000] space:
 * Top-Left Corner -> Right/Left -> Middle -> Far-Right Edge -> Left/Right -> Bottom-Left Corner
 */
function sampleRiverPoints(
  dx: number,
  dy: number,
  spread: number,
  stepsPerSeg = 22
): Point[] {
  const pt = (x: number, y: number): Point => ({ x: x + dx, y: y + dy });

  const xRight1 = 620 + spread * 0.7;
  const xLeft1 = 210 - spread * 0.6;
  const xCenter = 720 + spread * 0.5;
  const xFarRight = Math.min(1425, 1380 + spread * 0.45);
  const xLeft2 = 430 - spread * 0.65;
  const xRight2 = 1030 + spread * 0.7;

  const segments: CubicSegment[] = [
    // 1. Top-Left Corner -> Right
    { p0: pt(-25, -18), cp1: pt(220, 18), cp2: pt(xRight1, 90), p3: pt(xRight1, 175) },
    // 2. Right -> Left
    { p0: pt(xRight1, 175), cp1: pt(xRight1, 260), cp2: pt(xLeft1, 240), p3: pt(xLeft1, 320) },
    // 3. Left -> Middle
    { p0: pt(xLeft1, 320), cp1: pt(xLeft1, 400), cp2: pt(xCenter - 200, 430), p3: pt(xCenter, 460) },
    // 4. Middle -> Far-Right Corner
    { p0: pt(xCenter, 460), cp1: pt(xCenter + 200, 490), cp2: pt(xFarRight, 495), p3: pt(xFarRight, 580) },
    // 5. Far-Right -> Left again
    { p0: pt(xFarRight, 580), cp1: pt(xFarRight, 665), cp2: pt(xLeft2, 640), p3: pt(xLeft2, 720) },
    // 6. Left -> Right again
    { p0: pt(xLeft2, 720), cp1: pt(xLeft2, 800), cp2: pt(xRight2, 775), p3: pt(xRight2, 855) },
    // 7. Right -> Bottom-Left Corner
    { p0: pt(xRight2, 855), cp1: pt(xRight2, 935), cp2: pt(310, 975), p3: pt(-25, 1012) },
  ];

  const points: Point[] = [];
  for (let s = 0; s < segments.length; s++) {
    const startStep = s === 0 ? 0 : 1;
    for (let i = startStep; i <= stepsPerSeg; i++) {
      points.push(evalCubic(segments[s], i / stepsPerSeg));
    }
  }
  return points;
}

const RIBBON_SPECS: RibbonSpec[] = [
  // 1. Primary Caramel -> Toffee -> Creamy Foam Lead Filament
  {
    dx: 0,
    dy: 0,
    spread: 0,
    colors: ['#A8703F', '#C68B59', '#E6C29F', '#FFFDF9'],
    coreWidth: 3.4,
    haloWidth: 42,
    scrollRange: [0.0, 0.94],
    parallaxY: 26,
    swaySpeed: 0.72,
    swayAmp: 14,
    swayPhase: 0.0,
    curtainIndices: [10, 24, 42, 66, 88, 110, 132, 146],
  },
  // 2. Warm Coral Kentang -> Caramel Braided Outer Current
  {
    dx: 26,
    dy: -16,
    spread: 42,
    colors: ['#C68B59', '#EF7A5A', '#F5B09C', '#FFFDF9'],
    coreWidth: 2.8,
    haloWidth: 48,
    scrollRange: [0.02, 0.96],
    parallaxY: 16,
    swaySpeed: 0.62,
    swayAmp: 15,
    swayPhase: 1.4,
    curtainIndices: [16, 36, 58, 82, 104, 126],
  },
  // 3. Atmospheric Cappuccino -> Caramel Halo Background Stream
  {
    dx: -30,
    dy: 20,
    spread: -46,
    colors: ['#A8703F', '#C68B59', '#EFE3D3', '#FAF6F0'],
    coreWidth: 2.2,
    haloWidth: 56,
    scrollRange: [0.0, 0.98],
    parallaxY: 10,
    swaySpeed: 0.52,
    swayAmp: 12,
    swayPhase: 2.6,
    curtainIndices: [20, 48, 76, 100, 122],
  },
  // 4. Sweet Pink Donat -> Coral Kentang Counter-Wave
  {
    dx: -15,
    dy: 11,
    spread: 26,
    colors: ['#EF7A5A', '#F4B9C8', '#FAD8E0', '#FFFDF9'],
    coreWidth: 3.0,
    haloWidth: 44,
    scrollRange: [0.05, 0.98],
    parallaxY: 20,
    swaySpeed: 0.68,
    swayAmp: 13,
    swayPhase: 3.9,
    curtainIndices: [14, 38, 62, 92, 118, 140],
  },
  // 5. Crisp Caramel-Latte Accent Filament
  {
    dx: 10,
    dy: -8,
    spread: -18,
    colors: ['#C68B59', '#F4B9C8', '#EFE3D3', '#FFFDF9'],
    coreWidth: 2.6,
    haloWidth: 32,
    scrollRange: [0.03, 0.95],
    parallaxY: 32,
    swaySpeed: 0.78,
    swayAmp: 15,
    swayPhase: 5.1,
    curtainIndices: [28, 54, 84, 112, 136],
  },
];

/**
 * Hardware-accelerated Canvas 2D Pastel-Blue Aurora River Current.
 * Replaces heavy SVG feGaussianBlur DOM filters with multi-pass GPU-composited
 * canvas strokes (~1ms/frame) so page scrolling stays buttery smooth at 60–120fps.
 */
export const RiverAurora: React.FC<RiverAuroraProps> = ({ darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkModeRef = useRef(darkMode);
  darkModeRef.current = darkMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Pre-sample all 5 braided pastel-blue river curves once
    const sampledRibbons = RIBBON_SPECS.map((spec) => ({
      spec,
      pts: sampleRiverPoints(spec.dx, spec.dy, spec.spread, 22),
    }));

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let smoothProgress = 0;
    let targetProgress = 0;

    const updateScrollTarget = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      targetProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    updateScrollTarget();
    smoothProgress = targetProgress;
    window.addEventListener('scroll', updateScrollTarget, { passive: true });

    const drawFrame = (timeSec: number) => {
      const isDark = darkModeRef.current;
      ctx.clearRect(0, 0, width, height);

      // Additive lighter glow in Dark Mode; clean luminous pastel layering in Light Mode
      ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const sx = width / 1440;
      const sy = height / 1000;
      const scaleAvg = (sx + sy) * 0.5;

      for (let r = 0; r < sampledRibbons.length; r++) {
        const { spec, pts } = sampledRibbons[r];
        const [startP, endP] = spec.scrollRange;
        const span = Math.max(0.01, endP - startP);
        const localP = prefersReducedMotion
          ? 1
          : Math.min(Math.max((smoothProgress - startP) / span, 0), 1);

        // Start with a 10% top-left corner glimpse at scroll 0, flowing to 100% (bottom-left)
        const drawFraction = prefersReducedMotion ? 1 : 0.1 + localP * 0.9;
        const maxIdx = Math.max(2, Math.floor(drawFraction * (pts.length - 1)));

        const swayX = prefersReducedMotion
          ? 0
          : Math.sin(timeSec * spec.swaySpeed + spec.swayPhase) * spec.swayAmp;
        const breathe = prefersReducedMotion
          ? 0.9
          : 0.78 + 0.22 * (0.5 + 0.5 * Math.sin(timeSec * spec.swaySpeed * 0.8 + spec.swayPhase));
        const parallaxOffsetY = (0.5 - smoothProgress) * spec.parallaxY * sy;

        // Build ribbon gradient from tail (top) to bright leading head
        const headPt = pts[maxIdx];
        const headY = headPt.y * sy + parallaxOffsetY;
        const tailY = Math.max(0, headY - height * 0.72);
        const grad = ctx.createLinearGradient(0, tailY, 0, Math.max(tailY + 24, headY));
        grad.addColorStop(0, `${spec.colors[0]}08`);
        grad.addColorStop(0.38, spec.colors[0]);
        grad.addColorStop(0.75, spec.colors[1]);
        grad.addColorStop(0.94, spec.colors[2]);
        grad.addColorStop(1, spec.colors[3]);

        // 1. Faint Vertical Aurora Curtain Rays along visible bends
        const curtainAlpha = (isDark ? 0.18 : 0.22) * breathe * (0.2 + localP * 0.8);
        if (curtainAlpha > 0.01) {
          for (let c = 0; c < spec.curtainIndices.length; c++) {
            const ptIdx = spec.curtainIndices[c];
            if (ptIdx > maxIdx) break;
            const p = pts[ptIdx];
            const cx = p.x * sx + swayX;
            const cy = p.y * sy + parallaxOffsetY;
            const rayH = 115 * sy;

            const rayGrad = ctx.createLinearGradient(cx, cy - rayH * 0.72, cx, cy + rayH * 0.28);
            rayGrad.addColorStop(0, 'rgba(198, 139, 89, 0)');
            rayGrad.addColorStop(0.5, `rgba(198, 139, 89, ${curtainAlpha.toFixed(3)})`);
            rayGrad.addColorStop(1, 'rgba(244, 185, 200, 0)');

            ctx.strokeStyle = rayGrad;
            ctx.lineWidth = Math.max(4, 9 * scaleAvg);
            ctx.beginPath();
            ctx.moveTo(cx, cy - rayH * 0.72);
            ctx.lineTo(cx, cy + rayH * 0.28);
            ctx.stroke();
          }
        }

        // Build polyline path once for all 4 concentric glow passes
        ctx.beginPath();
        const first = pts[0];
        ctx.moveTo(first.x * sx + swayX, first.y * sy + parallaxOffsetY);
        for (let i = 1; i <= maxIdx; i++) {
          const p = pts[i];
          ctx.lineTo(p.x * sx + swayX, p.y * sy + parallaxOffsetY);
        }

        ctx.strokeStyle = grad;

        // Pass 1: Wide soft outer atmospheric halo (replaces heavy SVG feGaussianBlur)
        ctx.globalAlpha = (isDark ? 0.09 : 0.13) * breathe;
        ctx.lineWidth = spec.haloWidth * 1.45 * scaleAvg;
        ctx.stroke();

        // Pass 2: Medium soft halo
        ctx.globalAlpha = (isDark ? 0.16 : 0.22) * breathe;
        ctx.lineWidth = spec.haloWidth * 0.78 * scaleAvg;
        ctx.stroke();

        // Pass 3: Inner luminous chroma ribbon
        ctx.globalAlpha = (isDark ? 0.3 : 0.38) * breathe;
        ctx.lineWidth = spec.haloWidth * 0.34 * scaleAvg;
        ctx.stroke();

        // Pass 4: Thin sharp bright pastel core filament
        ctx.globalAlpha = (isDark ? 0.88 : 0.85) * breathe;
        ctx.lineWidth = Math.max(2, spec.coreWidth * scaleAvg);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    let rafId = 0;
    const startMs = performance.now();

    const loop = (now: number) => {
      const t = (now - startMs) * 0.001;
      // Smooth lerp toward target scroll progress (feels like GSAP scrub: 1)
      smoothProgress += (targetProgress - smoothProgress) * 0.1;
      drawFrame(t);
      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(loop);
      }
    };

    if (prefersReducedMotion) {
      drawFrame(0);
    } else {
      rafId = window.requestAnimationFrame(loop);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScrollTarget);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
