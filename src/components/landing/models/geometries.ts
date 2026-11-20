import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Physical Double-Walled Transparent Plastic Iced Latte Cup (Octane / Cinema 4D style).
 * Has real wall thickness, thick bottom base, and double-rolled top rim for true refractive IOR.
 */
export function createThickClearCupGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.0, -0.87),
    new THREE.Vector2(0.39, -0.87),
    new THREE.Vector2(0.422, -0.84),
    new THREE.Vector2(0.585, 0.48),
    new THREE.Vector2(0.605, 0.54),
    new THREE.Vector2(0.602, 0.58),
    new THREE.Vector2(0.622, 0.63),
    new THREE.Vector2(0.658, 0.65),
    new THREE.Vector2(0.662, 0.678),
    new THREE.Vector2(0.635, 0.695),
    new THREE.Vector2(0.602, 0.675),
    new THREE.Vector2(0.585, 0.56),
    new THREE.Vector2(0.402, -0.78),
    new THREE.Vector2(0.36, -0.81),
    new THREE.Vector2(0.0, -0.81),
  ];
  const geo = new THREE.LatheGeometry(pts, 72);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Physical Double-Walled Transparent Dome Lid with Snap-Fit Collar & Straw Hole Rim.
 */
export function createThickDomeLidGeometry(): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.605, 0.02),
    new THREE.Vector2(0.655, 0.02),
    new THREE.Vector2(0.665, 0.055),
    new THREE.Vector2(0.63, 0.085),
    new THREE.Vector2(0.638, 0.125),
    new THREE.Vector2(0.612, 0.155),
  ];

  const arcSteps = 22;
  const rDome = 0.625;
  for (let i = 0; i <= arcSteps; i++) {
    const t = i / arcSteps;
    const phi = THREE.MathUtils.lerp(0.24, 1.32, t);
    const r = Math.cos(phi) * rDome;
    const y = Math.sin(phi) * rDome;
    pts.push(new THREE.Vector2(r, y));
  }

  pts.push(new THREE.Vector2(0.145, 0.618));
  pts.push(new THREE.Vector2(0.135, 0.595));

  const rInner = 0.606;
  for (let i = arcSteps; i >= 0; i--) {
    const t = i / arcSteps;
    const phi = THREE.MathUtils.lerp(0.24, 1.32, t);
    const r = Math.cos(phi) * rInner;
    const y = Math.sin(phi) * rInner;
    pts.push(new THREE.Vector2(r, y));
  }

  pts.push(new THREE.Vector2(0.605, 0.02));

  const geo = new THREE.LatheGeometry(pts, 72);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Sculpted Wet Refractive Ice Cube Geometry with slightly melted organic faces.
 */
export function createSculptedIceCubeGeometry(size = 0.275): THREE.BufferGeometry {
  const geo = new RoundedBoxGeometry(size, size * 0.95, size, 8, 0.058);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const wave =
      Math.sin(x * 16 + y * 12) * 0.006 +
      Math.cos(z * 15 - x * 11) * 0.006 +
      Math.sin(y * 18 + z * 14) * 0.005;

    pos.setXYZ(i, x + wave, y + wave * 0.8, z - wave);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Chunky, thick, closed 3D Dripping Pink Donut Icing Geometry with soft organic bumps
 * and bulbous surface-tension gravity drips.
 */
export function createDrippingIcingGeometry(
  majorR = 0.42,
  tubeR = 0.198
): THREE.BufferGeometry {
  const geo = new THREE.TorusGeometry(majorR, tubeR, 64, 144);
  geo.rotateX(Math.PI / 2);

  const pos = geo.attributes.position;

  const getSmoothDrip = (u: number) => {
    const d1 = Math.pow(Math.max(0, Math.sin(u * 3 + 0.5)), 2.2) * 0.125;
    const d2 = Math.pow(Math.max(0, Math.cos(u * 5 - 0.9)), 2.6) * 0.105;
    const d3 = Math.pow(Math.max(0, Math.sin(u * 4 + 2.4)), 2.4) * 0.085;
    const baseWave = (Math.sin(u * 6) * 0.5 + 0.5) * 0.026;
    return d1 + d2 + d3 + baseWave;
  };

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const u = Math.atan2(z, x);
    const rHoriz = Math.sqrt(x * x + z * z);
    const radialOffset = rHoriz - majorR;

    const softBump =
      Math.sin(u * 11 + radialOffset * 28) * 0.0035 +
      Math.cos(u * 17 - radialOffset * 22) * 0.0025;

    if (y >= -0.03) {
      const puff = 1.04;
      const newR = majorR + radialOffset * puff;
      x = Math.cos(u) * newR;
      z = Math.sin(u) * newR;
      y = y * 1.055 + 0.015 + softBump;

      const outerFactor = Math.max(0, radialOffset / tubeR);
      if (outerFactor > 0.42 && y < tubeR * 0.68) {
        const weight = Math.pow((outerFactor - 0.42) / 0.58, 1.35);
        const dripVal = getSmoothDrip(u);
        const dripDrop = dripVal * weight;
        y -= dripDrop;
        const tipBead = Math.pow(weight, 2.2) * (0.014 + dripVal * 0.08);
        const lipR = newR + tipBead;
        x = Math.cos(u) * lipR;
        z = Math.sin(u) * lipR;
      }
    } else {
      const outerFactor = Math.max(0, radialOffset / tubeR);
      const dripDrop = outerFactor > 0.42 ? getSmoothDrip(u) * 0.88 : 0;
      y = Math.max(-0.022 - dripDrop, y * 0.24);
      const shrinkR = majorR + radialOffset * 0.94;
      x = Math.cos(u) * shrinkR;
      z = Math.sin(u) * shrinkR;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Double-Walled Curved Red U-Scoop French Fry Paper Carton with UVs for Paper Fiber Texture.
 */
export function createScoopFryCartonGeometry(): THREE.BufferGeometry {
  const rSegs = 80;
  const hSegs = 28;
  const wallThickness = 0.035;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const getContour = (theta: number, scaleX: number, scaleZ: number) => {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const pow = 0.56;
    const rx = Math.sign(c) * Math.pow(Math.abs(c), pow) * scaleX;
    const rz = Math.sign(s) * Math.pow(Math.abs(s), pow) * scaleZ;
    return [rx, rz] as const;
  };

  for (let layer = 0; layer < 2; layer++) {
    const isInner = layer === 1;
    for (let ih = 0; ih <= hSegs; ih++) {
      const v = ih / hSegs;

      for (let ir = 0; ir <= rSegs; ir++) {
        const u = ir / rSegs;
        const theta = u * Math.PI * 2;
        const sinT = Math.sin(theta);

        const bottomArch = Math.pow(Math.abs(sinT), 1.6) * 0.07;
        const yBot = -0.48 + bottomArch;

        const frontScoop =
          sinT > 0 ? Math.pow(sinT, 1.55) * 0.24 : -Math.pow(-sinT, 1.4) * 0.05;
        const yTop = 0.42 - frontScoop;

        const y = THREE.MathUtils.lerp(yBot, yTop, v);

        const flare = Math.pow(v, 1.2);
        let widthX = THREE.MathUtils.lerp(0.36, 0.52, flare);
        let depthZ = THREE.MathUtils.lerp(0.21, 0.3, flare);

        if (isInner) {
          widthX -= wallThickness;
          depthZ -= wallThickness;
        }

        const [x, z] = getContour(theta, widthX, depthZ);
        positions.push(x, y, z);
        uvs.push(u * 2, v);
      }
    }
  }

  const ringStride = rSegs + 1;
  const layerStride = (hSegs + 1) * ringStride;

  for (let ih = 0; ih < hSegs; ih++) {
    for (let ir = 0; ir < rSegs; ir++) {
      const a = ih * ringStride + ir;
      const b = ih * ringStride + (ir + 1);
      const c = (ih + 1) * ringStride + (ir + 1);
      const d = (ih + 1) * ringStride + ir;
      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  for (let ih = 0; ih < hSegs; ih++) {
    for (let ir = 0; ir < rSegs; ir++) {
      const a = layerStride + ih * ringStride + ir;
      const b = layerStride + ih * ringStride + (ir + 1);
      const c = layerStride + (ih + 1) * ringStride + (ir + 1);
      const d = layerStride + (ih + 1) * ringStride + ir;
      indices.push(a, c, b);
      indices.push(a, d, c);
    }
  }

  const outerTopOffset = hSegs * ringStride;
  const innerTopOffset = layerStride + hSegs * ringStride;
  for (let ir = 0; ir < rSegs; ir++) {
    const a = outerTopOffset + ir;
    const b = outerTopOffset + ir + 1;
    const c = innerTopOffset + ir + 1;
    const d = innerTopOffset + ir;
    indices.push(a, b, c);
    indices.push(a, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * High-Detail Sculpted 3D Roasted Coffee Bean with organic S-curved center cleft crease.
 */
export function createCoffeeBeanGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.145, 48, 36);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    x *= 0.83;
    y *= 1.24;
    z *= 0.67;

    if (z < 0) {
      z *= 0.85;
    } else {
      const sCurve = Math.sin(y * 9.5) * 0.01;
      const distFromCrease = Math.abs(x - sCurve);
      const creaseDepth = Math.exp(-Math.pow(distFromCrease / 0.024, 2)) * 0.052;
      const lipRidge =
        Math.exp(-Math.pow((distFromCrease - 0.028) / 0.016, 2)) * 0.008;
      const endTaper = Math.max(0, 1 - Math.pow(y / 0.185, 2));
      z = z - creaseDepth * endTaper + lipRidge * endTaper;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * 360-Degree Sculpted 3D Liquid Crown Splash Geometry erupting from the Cup Rim.
 * Creates an organic double-walled fluid sheet flaring out of the cup opening with
 * 6 asymmetric wave peaks and a thick rolled surface-tension bead along the top crest.
 */
export function createLiquidCrownGeometry(): THREE.BufferGeometry {
  const rSegs = 128;
  const hSegs = 28;

  const positions: number[] = [];
  const indices: number[] = [];

  // Asymmetric crown wave height function around the 360° rim
  const getCrownCrest = (theta: number) => {
    const p1 = Math.pow(Math.max(0, Math.cos(theta - 0.25)), 2.2) * 0.38; // Right main crest
    const p2 = Math.pow(Math.max(0, Math.cos(theta - 1.45)), 2.6) * 0.24; // Front-left crest
    const p3 = Math.pow(Math.max(0, Math.cos(theta - 2.65)), 2.4) * 0.28; // Left crest
    const p4 = Math.pow(Math.max(0, Math.cos(theta + 2.15)), 2.8) * 0.22; // Back-left crest
    const p5 = Math.pow(Math.max(0, Math.cos(theta + 0.85)), 2.3) * 0.31; // Back-right crest
    const harmonic = (Math.sin(theta * 5 + 0.4) * 0.5 + 0.5) * 0.06;
    return 0.12 + p1 + p2 + p3 + p4 + p5 + harmonic;
  };

  // Build closed cross-section loop along v (0..1 is outer wall bottom->top, 1..2 is inner wall top->bottom)
  const totalVSegs = hSegs * 2;
  for (let iv = 0; iv <= totalVSegs; iv++) {
    const isInner = iv > hSegs;
    const v = isInner ? (totalVSegs - iv) / hSegs : iv / hSegs; // 0 at base inside cup, 1 at top crest

    for (let ir = 0; ir <= rSegs; ir++) {
      const theta = (ir / rSegs) * Math.PI * 2;
      const crestH = getCrownCrest(theta);

      // Smoothly flare outward as the liquid sheet rises above the cup rim
      const flareCurve = Math.pow(v, 1.35);
      const curlLip = Math.pow(v, 3.2) * (0.08 + crestH * 0.35);
      let r = 0.46 + flareCurve * (0.14 + crestH * 0.42) + curlLip;

      // Thick surface-tension rim swelling near the top edge (v near 0.92..1.0)
      const rimBulb = Math.sin(Math.pow(v, 2.4) * Math.PI) * 0.036;
      const baseThickness = THREE.MathUtils.lerp(0.042, 0.024, v) + rimBulb;

      if (isInner) {
        r -= baseThickness;
      }

      // Rounded top lip transition at iv === hSegs
      const topArch = Math.exp(-Math.pow((iv - hSegs) / 1.8, 2)) * 0.018;
      const y = -0.04 + v * crestH + topArch;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      positions.push(x, y, z);
    }
  }

  const ringStride = rSegs + 1;
  for (let iv = 0; iv < totalVSegs; iv++) {
    for (let ir = 0; ir < rSegs; ir++) {
      const a = iv * ringStride + ir;
      const b = iv * ringStride + (ir + 1);
      const c = (iv + 1) * ringStride + (ir + 1);
      const d = (iv + 1) * ringStride + ir;
      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Fluid Simulation Splash Sheet & Tendril Geometry with Realistic Surface Tension:
 * - Wide liquid ribbon sheet with thickened surface-tension outer borders near the base
 * - Smoothly necks down into a stretched fluid ligament
 * - Swells into a closed, plump, high-gloss spherical teardrop bulb at the tip
 */
export function createTaperedSplashGeometry(
  curvePoints: THREE.Vector3[],
  baseR = 0.16,
  tipR = 0.052,
  ribbonWidthFactor = 1.65
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal', 0.5);
  const tubularSegs = 80;
  const radialSegs = 32;
  const frames = curve.computeFrenetFrames(tubularSegs, false);

  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegs; i++) {
    const u = i / tubularSegs;
    const pt = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    // Smooth entry taper at u=0..0.06, fluid ligament pinch around u=0.74,
    // and plump spherical teardrop bulb from u=0.84..1.0
    const startCap = u < 0.05 ? Math.sin((u / 0.05) * (Math.PI / 2)) : 1;
    const neckPinch = Math.exp(-Math.pow((u - 0.74) / 0.11, 2)) * (baseR * 0.28);
    const tipBulb = Math.exp(-Math.pow((u - 0.89) / 0.075, 2)) * (tipR * 0.92);
    const endSphere =
      u > 0.93
        ? Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.93) / 0.07, 2)))
        : 1;

    const r =
      Math.max(
        0.001,
        THREE.MathUtils.lerp(baseR, tipR, Math.pow(u, 0.76)) - neckPinch + tipBulb
      ) *
      startCap *
      endSphere;

    // Sheet aspect ratio: wide liquid ribbon at base, transitioning to circular cross-section at tip
    const sheetBlend = Math.max(0, 1 - Math.pow(u, 1.15));
    const aspect = THREE.MathUtils.lerp(1.0, ribbonWidthFactor, sheetBlend);

    // Twist the fluid ribbon slightly along its trajectory for dynamic 3D motion
    const twistAngle = u * 0.85;
    const cosT = Math.cos(twistAngle);
    const sinT = Math.sin(twistAngle);

    for (let j = 0; j <= radialSegs; j++) {
      const v = (j / radialSegs) * Math.PI * 2;
      // Surface-tension rim thickening at the two edges of the ribbon (cos(v) = ±1)
      const edgeSwell = 1 + sheetBlend * 0.38 * Math.pow(Math.cos(v), 2);
      const localX = Math.cos(v) * aspect;
      const localY = (Math.sin(v) / Math.sqrt(aspect)) * edgeSwell;

      // Apply ribbon twist in the Frenet normal/binormal plane
      const rotX = localX * cosT - localY * sinT;
      const rotY = localX * sinT + localY * cosT;

      const x = pt.x + r * (rotX * N.x + rotY * B.x);
      const y = pt.y + r * (rotX * N.y + rotY * B.y);
      const z = pt.z + r * (rotX * N.z + rotY * B.z);
      positions.push(x, y, z);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < tubularSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 3D Teardrop Liquid Satellite Droplet Geometry.
 * Round bulbous leading head at +Y and a smooth surface-tension trailing tail at -Y.
 */
export function createTeardropDropletGeometry(): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 at trailing tail (-Y), 1 at leading head (+Y)
    const theta = t * Math.PI;
    // Asymmetric teardrop profile: pinched tail at t=0, plump round head near t=0.68
    const tailTaper = Math.pow(t, 0.55);
    const r = Math.sin(theta) * tailTaper * 0.95;
    const y = -Math.cos(theta) * (t < 0.5 ? 1.35 : 0.95);
    pts.push(new THREE.Vector2(Math.max(0, r), y));
  }
  const geo = new THREE.LatheGeometry(pts, 28);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Sculpted Crispy Golden Potato Fry with organic gentle bend and beveled edges.
 */
export function createCrispyFryGeometry(
  height = 0.92,
  bend = 0.025
): THREE.BufferGeometry {
  const geo = new RoundedBoxGeometry(0.132, height, 0.118, 6, 0.026);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const normY = y / (height * 0.5);
    const curveOffset = (normY * normY - 0.3) * bend;
    const microRipple = Math.sin(y * 18 + x * 14) * 0.003;

    pos.setXYZ(i, x + curveOffset + microRipple, y, z + curveOffset * 0.5);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Lathe-turned White Takeaway Paper Coffee Cup with rounded bottom step foot and rolled rim.
 */
export function createChunkyPaperCupGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.0, -0.62),
    new THREE.Vector2(0.35, -0.62),
    new THREE.Vector2(0.38, -0.6),
    new THREE.Vector2(0.39, -0.52),
    new THREE.Vector2(0.42, -0.5),
    new THREE.Vector2(0.43, -0.46),
    new THREE.Vector2(0.55, 0.52),
    new THREE.Vector2(0.51, 0.52),
  ];
  const geo = new THREE.LatheGeometry(pts, 64);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Lathe-turned Smooth Matte Black Takeaway Lid with double rounded thermoformed ribs.
 */
export function createChunkyBlackLidGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.54, 0.49),
    new THREE.Vector2(0.61, 0.51),
    new THREE.Vector2(0.62, 0.55),
    new THREE.Vector2(0.59, 0.58),
    new THREE.Vector2(0.58, 0.6),
    new THREE.Vector2(0.59, 0.63),
    new THREE.Vector2(0.56, 0.66),
    new THREE.Vector2(0.51, 0.68),
    new THREE.Vector2(0.49, 0.74),
    new THREE.Vector2(0.45, 0.76),
    new THREE.Vector2(0.38, 0.72),
    new THREE.Vector2(0.0, 0.71),
  ];
  const geo = new THREE.LatheGeometry(pts, 64);
  geo.computeVertexNormals();
  return geo;
}
