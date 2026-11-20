import * as THREE from 'three';

/**
 * 1024x1024 High-Contrast Volumetric Marbled Espresso & Milk Swirl Texture.
 * Deep roasted espresso blacks/browns swirling into translucent amber caramel and rich creamy milk.
 */
export function createMarbledCoffeeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Vertical base gradient: deep espresso at top -> warm caramel mid -> creamy milk at bottom
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  baseGrad.addColorStop(0.0, '#160702');
  baseGrad.addColorStop(0.22, '#341305');
  baseGrad.addColorStop(0.46, '#783B15');
  baseGrad.addColorStop(0.7, '#D4AC7D');
  baseGrad.addColorStop(0.88, '#F2E4D1');
  baseGrad.addColorStop(1.0, '#FBF6EE');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Fluid simulation marble ribbons (milk rising into espresso, espresso sinking into milk)
  const ribbons = [
    { color: 'rgba(253, 247, 239, 0.94)', yBase: 760, amp1: 210, amp2: 95, width: 150, freq: 2 },
    { color: 'rgba(22, 8, 2, 0.94)', yBase: 270, amp1: 215, amp2: 110, width: 145, freq: 2 },
    { color: 'rgba(246, 233, 215, 0.88)', yBase: 600, amp1: 230, amp2: 105, width: 115, freq: 3 },
    { color: 'rgba(118, 54, 18, 0.85)', yBase: 445, amp1: 190, amp2: 115, width: 112, freq: 3 },
    { color: 'rgba(252, 244, 233, 0.8)', yBase: 485, amp1: 245, amp2: 90, width: 80, freq: 4 },
    { color: 'rgba(30, 11, 3, 0.88)', yBase: 380, amp1: 180, amp2: 112, width: 90, freq: 3 },
    { color: 'rgba(182, 108, 48, 0.78)', yBase: 550, amp1: 160, amp2: 95, width: 70, freq: 5 },
  ];

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ribbons.forEach((r, idx) => {
    ctx.save();
    ctx.strokeStyle = r.color;
    ctx.lineWidth = r.width;
    ctx.filter = 'blur(15px)';
    ctx.beginPath();
    for (let x = -40; x <= 1064; x += 12) {
      const u = (x / 1024) * Math.PI * 2;
      const y =
        r.yBase +
        Math.sin(u * r.freq + idx * 1.3) * r.amp1 +
        Math.cos(u * (r.freq + 1) - idx * 0.9) * r.amp2 +
        Math.sin(u * 6 + idx) * 38;
      if (x === -40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  });

  // Fine high-contrast turbulent crema & milk vortices
  for (let i = 0; i < 36; i++) {
    ctx.save();
    const isLight = i % 2 === 0;
    ctx.strokeStyle = isLight
      ? 'rgba(254, 249, 242, 0.72)'
      : 'rgba(24, 9, 3, 0.78)';
    ctx.lineWidth = 10 + (i % 4) * 8;
    ctx.filter = 'blur(5px)';
    ctx.beginPath();
    let cx = (i * 137) % 1024;
    let cy = 150 + ((i * 193) % 720);
    ctx.moveTo(cx, cy);
    for (let step = 0; step < 32; step++) {
      const angle =
        Math.sin(cx * 0.0085 + i) * 2.4 +
        Math.cos(cy * 0.0085 - i * 0.5) * 2.4 +
        step * 0.19;
      cx += Math.cos(angle) * 24;
      cy += Math.sin(angle) * 22;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 512x512 Subtle Condensation & Micro Water-Bead Normal/Bump Map for the clear plastic cup.
 */
export function createCondensationBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Fine condensation mist micro-droplets
  for (let i = 0; i < 2400; i++) {
    const x = (i * 79 + 13) % 512;
    const y = (i * 131 + 29) % 512;
    const r = 0.7 + (i % 3) * 0.65;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(215,215,215,0.45)' : 'rgba(105,105,105,0.35)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Larger beaded water droplets with bright specular height centers
  for (let i = 0; i < 160; i++) {
    const x = (i * 197 + 41) % 500 + 6;
    const y = (i * 263 + 53) % 500 + 6;
    const r = 2.2 + (i % 5) * 1.1;
    const grad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0.2, x, y, r);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.7, '#B8B8B8');
    grad.addColorStop(1, '#808080');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 512x512 Fried Donut Dough Texture with natural fried pores & pale equator fry-line.
 */
export function createDonutDoughTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#F6DA9E');
  grad.addColorStop(0.08, '#DA984A');
  grad.addColorStop(0.25, '#AC5B1D');
  grad.addColorStop(0.43, '#DC9A4C');
  grad.addColorStop(0.5, '#F5D494');
  grad.addColorStop(0.57, '#D89446');
  grad.addColorStop(0.75, '#A25317');
  grad.addColorStop(0.92, '#DA984A');
  grad.addColorStop(1.0, '#F6DA9E');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Natural fried bakery crumb pores & micro blisters
  for (let i = 0; i < 1800; i++) {
    const x = (i * 73) % 512;
    const y = (i * 139) % 512;
    const r = 0.8 + (i % 3) * 0.85;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(92, 40, 7, 0.16)' : 'rgba(255, 238, 200, 0.16)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 512x512 Matte Crispy Golden Potato Fry Texture with toasted edges, blister pores & salt crystals.
 */
export function createGoldenFryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0.0, '#FAD05A');
  grad.addColorStop(0.35, '#F4BE3B');
  grad.addColorStop(0.72, '#E59F22');
  grad.addColorStop(1.0, '#C87A12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Matte crispy potato starch micro-blisters & golden toasted spots
  for (let i = 0; i < 950; i++) {
    const x = (i * 67) % 512;
    const y = (i * 113) % 512;
    const r = 1.5 + (i % 5) * 1.1;
    ctx.fillStyle =
      i % 3 === 0
        ? 'rgba(150, 76, 10, 0.16)' // golden-brown toasted pore
        : 'rgba(255, 238, 175, 0.24)'; // crispy starch blister
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine sparkling salt crystals
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < 220; i++) {
    const x = (i * 97 + 19) % 500;
    const y = (i * 151 + 31) % 500;
    const s = 1.8 + (i % 2.5);
    ctx.fillRect(x, y, s, s);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 512x512 Tactile Paper Fiber Bump & Albedo Texture for Paper Carton & Takeaway Cup.
 */
export function createPaperFiberBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Cross-linked paper pulp fibers
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 2600; i++) {
    const x = (i * 83) % 512;
    const y = (i * 149) % 512;
    const len = 5 + (i % 9);
    const angle = ((i * 37) % 360) * (Math.PI / 180);
    const v = i % 2 === 0 ? 158 : 102;
    ctx.strokeStyle = `rgba(${v},${v},${v},0.38)`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Fine cardstock grain
  for (let i = 0; i < 3200; i++) {
    const x = (i * 59) % 512;
    const y = (i * 107) % 512;
    const v = i % 2 === 0 ? 170 : 92;
    ctx.fillStyle = `rgba(${v},${v},${v},0.28)`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

/**
 * 256x256 Universal Organic Micro-Bump Map for natural material surface detail
 * (soft bumps on donut icing, crispy fry roughness, roasted coffee bean pores, and sugar crystals).
 */
export function createOrganicBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 2000; i++) {
    const x = (i * 47) % 256;
    const y = (i * 83) % 256;
    const r = 1 + (i % 4);
    const v = i % 2 === 0 ? 185 : 75;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 512x512 Diagonal Caramel & Cream Spiral-Striped Straw Texture.
 */
export function createStripedStrawTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F7EFE4';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#A66A38';
  const stripeW = 64;
  for (let i = -512; i < 1024; i += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeW, 0);
    ctx.lineTo(i + stripeW + 512, 512);
    ctx.lineTo(i + 512, 512);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
