import * as THREE from 'three';

/**
 * Photorealistic Procedural Earth Texture Generator (Blue Marble HD)
 * Generates stunning equirectangular albedo, night lights, specular reflection,
 * and wispy cloud textures in HTML5 Canvas.
 */

export function createProceduralEarthTexture(): {
  dayTexture: THREE.CanvasTexture;
  nightTexture: THREE.CanvasTexture;
  cloudsTexture: THREE.CanvasTexture;
  specularTexture: THREE.CanvasTexture;
  bumpTexture: THREE.CanvasTexture;
} {
  const width = 2048;
  const height = 1024;

  // 1. DAY ALBEDO & TERRAIN MAP (Blue Marble Realistic)
  const dayCanvas = document.createElement('canvas');
  dayCanvas.width = width;
  dayCanvas.height = height;
  const ctx = dayCanvas.getContext('2d')!;

  // Deep Ocean Base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0b1d3a'); // Arctic deep
  oceanGrad.addColorStop(0.2, '#0f2b57');
  oceanGrad.addColorStop(0.5, '#123b75'); // Equatorial cobalt blue
  oceanGrad.addColorStop(0.8, '#0f2b57');
  oceanGrad.addColorStop(1, '#0b1d3a'); // Antarctic deep
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  const toXY = (lat: number, lng: number): [number, number] => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  const drawLandmass = (
    coords: [number, number][],
    fillColor: string,
    shelfColor: string = 'rgba(56, 189, 248, 0.25)',
    shelfWidth: number = 6
  ) => {
    if (coords.length < 3) return;

    ctx.save();
    ctx.strokeStyle = shelfColor;
    ctx.lineWidth = shelfWidth;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const [firstX, firstY] = toXY(coords[0][0], coords[0][1]);
    ctx.moveTo(firstX, firstY);
    for (let i = 1; i < coords.length; i++) {
      const [x, y] = toXY(coords[i][0], coords[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  };

  // Continents with rich green/earthy tones
  // 1. Europe & Balkans
  drawLandmass([
    [71, 28], [65, 12], [60, 5], [54, 8], [51, 2], [48, -4], [43, -9], [37, -9],
    [36, -5], [37, -2], [41, 0], [43, 3], [43, 7], [44, 9], [41, 14], [38, 15],
    [38, 16], [40, 18], [42, 19], [40, 20], [38, 24], [36, 23], [37, 27], [41, 29],
    [44, 29], [46, 31], [47, 39], [53, 35], [59, 30], [60, 25], [66, 24], [70, 28],
  ], '#355e3b', 'rgba(56, 189, 248, 0.35)', 8);

  // Albania highlight
  drawLandmass([
    [42.6, 19.3], [42.0, 19.5], [41.3, 19.4], [40.5, 19.3], [39.7, 20.0],
    [40.0, 20.8], [40.8, 21.0], [41.8, 20.6], [42.5, 20.1]
  ], '#468553', 'rgba(245, 158, 11, 0.8)', 10);

  // Africa
  drawLandmass([
    [36, -5], [37, 10], [32, 12], [32, 24], [31, 32], [22, 37], [12, 44], [11, 51],
    [2, 45], [-5, 40], [-15, 40], [-25, 33], [-34, 26], [-34, 18], [-26, 15],
    [-15, 12], [-5, 12], [4, 9], [5, 2], [5, -1], [4, -7], [9, -13], [15, -17],
    [21, -17], [28, -13], [35, -6]
  ], '#7c6a46', 'rgba(56, 189, 248, 0.3)', 8);

  // Sahara
  drawLandmass([
    [32, -8], [32, 30], [18, 35], [16, -15],
  ], '#a18654', 'transparent', 0);

  // North America
  drawLandmass([
    [71, -156], [70, -130], [60, -85], [55, -55], [45, -60], [30, -81], [25, -80],
    [29, -89], [26, -97], [20, -97], [16, -93], [14, -87], [8, -78], [10, -85],
    [16, -99], [22, -106], [32, -117], [38, -123], [48, -125], [58, -136], [60, -145],
    [65, -168], [71, -156]
  ], '#355e3b', 'rgba(56, 189, 248, 0.3)', 8);

  // South America
  drawLandmass([
    [12, -72], [10, -62], [6, -52], [-2, -44], [-8, -35], [-18, -39], [-23, -43],
    [-34, -53], [-42, -64], [-53, -68], [-55, -72], [-46, -75], [-35, -72], [-20, -70],
    [-5, -81], [4, -77], [8, -77]
  ], '#2a5c36', 'rgba(56, 189, 248, 0.3)', 8);

  // Asia
  drawLandmass([
    [75, 100], [72, 140], [65, 175], [60, 162], [53, 142], [42, 131], [37, 126],
    [31, 122], [22, 114], [21, 108], [10, 106], [1, 104], [10, 99], [22, 89],
    [16, 82], [8, 77], [22, 69], [25, 62], [26, 56], [15, 52], [12, 44], [28, 35],
    [36, 36], [41, 29], [46, 30], [53, 35], [58, 60], [67, 75], [74, 80]
  ], '#3a5f3d', 'rgba(56, 189, 248, 0.3)', 8);

  // Australia
  drawLandmass([
    [-12, 132], [-14, 142], [-24, 153], [-37, 150], [-38, 140], [-35, 118],
    [-22, 114], [-16, 123]
  ], '#8a6a43', 'rgba(56, 189, 248, 0.3)', 8);

  // Polar Ice
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height * 0.07);
  ctx.fillRect(0, height * 0.92, width, height * 0.08);

  // 2. NIGHT LIGHTS MAP
  const nightCanvas = document.createElement('canvas');
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nCtx = nightCanvas.getContext('2d')!;
  nCtx.fillStyle = '#000000';
  nCtx.fillRect(0, 0, width, height);

  const majorMetros: [number, number, number][] = [
    [41.32, 19.81, 14], // Tirana
    [51.5, -0.12, 18], // London
    [48.8, 2.35, 18], // Paris
    [40.7, -74.0, 20], // NY
    [35.6, 139.6, 20], // Tokyo
    [25.2, 55.2, 16], // Dubai
    [1.35, 103.8, 15], // Singapore
    [-33.8, 151.2, 15], // Sydney
  ];

  majorMetros.forEach(([lat, lng, rad]) => {
    const [x, y] = toXY(lat, lng);
    const grad = nCtx.createRadialGradient(x, y, 0, x, y, rad * 3);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#fef08a');
    grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.4)');
    grad.addColorStop(1, 'transparent');
    nCtx.fillStyle = grad;
    nCtx.beginPath();
    nCtx.arc(x, y, rad * 3, 0, Math.PI * 2);
    nCtx.fill();
  });

  // 3. SPECULAR MAP
  const specCanvas = document.createElement('canvas');
  specCanvas.width = width;
  specCanvas.height = height;
  const sCtx = specCanvas.getContext('2d')!;
  sCtx.fillStyle = '#ffffff'; // Oceans reflect
  sCtx.fillRect(0, 0, width, height);
  sCtx.globalCompositeOperation = 'difference';
  sCtx.fillStyle = '#b4b4b4';
  sCtx.drawImage(dayCanvas, 0, 0);

  // 4. BUMP MAP
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#000000';
  bCtx.fillRect(0, 0, width, height);
  bCtx.fillStyle = '#505050';
  bCtx.drawImage(dayCanvas, 0, 0);

  // 5. WISPY CLOUDS MAP (Delicate, fine textures)
  const cloudsCanvas = document.createElement('canvas');
  cloudsCanvas.width = width;
  cloudsCanvas.height = height;
  const cCtx = cloudsCanvas.getContext('2d')!;
  cCtx.clearRect(0, 0, width, height);

  cCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 1200; i++) {
    const lat = -60 + Math.random() * 120;
    const lng = -180 + Math.random() * 360;
    const [x, y] = toXY(lat, lng);

    const radiusX = 15 + Math.random() * 35;
    const radiusY = 5 + Math.random() * 12;

    const grad = cCtx.createRadialGradient(x, y, 0, x, y, radiusX);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'transparent');

    cCtx.fillStyle = grad;
    cCtx.beginPath();
    cCtx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    cCtx.fill();
  }

  const dayTexture = new THREE.CanvasTexture(dayCanvas);
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.wrapS = THREE.RepeatWrapping;

  const nightTexture = new THREE.CanvasTexture(nightCanvas);
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.wrapS = THREE.RepeatWrapping;

  const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
  cloudsTexture.colorSpace = THREE.SRGBColorSpace;
  cloudsTexture.wrapS = THREE.RepeatWrapping;

  const specularTexture = new THREE.CanvasTexture(specCanvas);
  specularTexture.wrapS = THREE.RepeatWrapping;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;

  return { dayTexture, nightTexture, cloudsTexture, specularTexture, bumpTexture };
}

export function createRealisticAirplane(): THREE.Group {
  const plane = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.09, 0.08, 1.2, 12);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
  const fuselage = new THREE.Mesh(bodyGeo, bodyMat);
  plane.add(fuselage);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.25);
  wingShape.lineTo(0.85, -0.1);
  wingShape.lineTo(0.7, -0.22);
  wingShape.lineTo(0, -0.12);
  wingShape.lineTo(-0.7, -0.22);
  wingShape.lineTo(-0.85, -0.1);
  wingShape.closePath();

  const wingGeo = new THREE.ShapeGeometry(wingShape);
  wingGeo.rotateX(-Math.PI / 2);
  const wings = new THREE.Mesh(wingGeo, bodyMat);
  wings.position.set(0, 0, 0.02);
  plane.add(wings);

  plane.scale.setScalar(0.65);
  return plane;
}

export function createMiniSatellite(): THREE.Group {
  const sat = new THREE.Group();
  const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0x0cbdfe, metalness: 0.9 }));
  sat.add(hub);
  sat.scale.setScalar(0.6);
  return sat;
}
