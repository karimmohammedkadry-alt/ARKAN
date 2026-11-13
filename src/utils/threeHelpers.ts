import * as THREE from 'three';

export function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function createMarbleTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle Carrara marble veining
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    let x = (i * 47) % 512;
    let y = 0;
    ctx.moveTo(x, y);
    for (let s = 0; s < 10; s++) {
      x += Math.sin(s * 0.9 + i) * 28 + 12;
      y += 56;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Tile grout lines
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.55)';
  ctx.lineWidth = 2;
  for (let p = 0; p <= 512; p += 128) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(512, p);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createOakParquetTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d6b48c';
  ctx.fillRect(0, 0, 512, 512);

  const plankW = 64;
  const plankH = 128;
  const shades = ['#d8b68e', '#cfa97e', '#dfc09a', '#c9a176'];

  for (let y = 0; y < 512; y += plankH) {
    for (let x = 0; x < 512; x += plankW) {
      const idx = ((x / plankW) + (y / plankH) * 3) % shades.length;
      ctx.fillStyle = shades[idx];
      const offsetY = (x / plankW) % 2 === 0 ? 0 : plankH / 2;
      ctx.fillRect(x, (y + offsetY) % 512, plankW - 2, plankH - 2);

      // Subtle wood grain lines
      ctx.strokeStyle = 'rgba(120, 82, 48, 0.14)';
      ctx.lineWidth = 1;
      for (let g = 8; g < plankW - 6; g += 9) {
        ctx.beginPath();
        ctx.moveTo(x + g, y);
        ctx.lineTo(x + g + 2, y + plankH);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createSlateTileTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, 512, 512);

  const shades = ['#475569', '#3f4d61', '#526075', '#3b4759'];
  for (let y = 0; y < 512; y += 128) {
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle = shades[((x + y) / 128) % shades.length];
      ctx.fillRect(x + 2, y + 2, 124, 124);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createWovenRugTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ede9e0';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(148, 138, 122, 0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 256; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }

  // Minimalist geometric border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 220, 220);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createPlazaGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.32)');
  grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.12)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
