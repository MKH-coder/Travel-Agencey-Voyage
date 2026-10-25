import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext.tsx';
import { Sparkles, Eye, EyeOff, RotateCw, Compass } from 'lucide-react';

interface CityHub {
  name: string;
  lat: number;
  lng: number;
  highlight?: boolean;
}

// Major global hubs + signature Voyage destinations (including Tirana/Albania)
const GLOBAL_HUBS: CityHub[] = [
  { name: 'Tirana (Albania)', lat: 41.3275, lng: 19.8187, highlight: true },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Reykjavik', lat: 64.1466, lng: -21.9426 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
];

// Flight route connections between hubs
const FLIGHT_ROUTES: [number, number][] = [
  [0, 1], // Tirana -> London
  [0, 2], // Tirana -> Paris
  [0, 5], // Tirana -> Dubai
  [0, 8], // Tirana -> Rome
  [1, 3], // London -> New York
  [2, 3], // Paris -> New York
  [3, 10], // New York -> Rio
  [1, 5], // London -> Dubai
  [5, 4], // Dubai -> Tokyo
  [5, 6], // Dubai -> Singapore
  [6, 7], // Singapore -> Sydney
  [4, 7], // Tokyo -> Sydney
  [5, 9], // Dubai -> Cairo
  [9, 12], // Cairo -> Cape Town
  [1, 11], // London -> Reykjavik
];

// Approximate landmass point generator for realistic continent silhouettes on a sphere
function generateContinentPoints(radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  
  // Landmass bounding boxes (minLat, maxLat, minLng, maxLng, densityMultiplier)
  const landmasses = [
    // Europe & Balkans (high density for Voyage focus)
    { minLat: 35, maxLat: 60, minLng: -10, maxLng: 35, count: 480 },
    // Albania & Mediterranean cluster
    { minLat: 39, maxLat: 43, minLng: 18, maxLng: 22, count: 180 },
    // North America
    { minLat: 25, maxLat: 65, minLng: -125, maxLng: -65, count: 520 },
    // South America
    { minLat: -50, maxLat: 12, minLng: -80, maxLng: -35, count: 360 },
    // Africa
    { minLat: -35, maxLat: 37, minLng: -18, maxLng: 52, count: 500 },
    // Asia
    { minLat: 10, maxLat: 70, minLng: 40, maxLng: 140, count: 850 },
    // Southeast Asia & Japan
    { minLat: -10, maxLat: 45, minLng: 95, maxLng: 145, count: 350 },
    // Australia & Oceania
    { minLat: -44, maxLat: -10, minLng: 110, maxLng: 155, count: 260 },
  ];

  landmasses.forEach(({ minLat, maxLat, minLng, maxLng, count }) => {
    for (let i = 0; i < count; i++) {
      const lat = minLat + Math.random() * (maxLat - minLat);
      const lng = minLng + Math.random() * (maxLng - minLng);
      points.push(latLngToVector3(lat, lng, radius));
    }
  });

  return points;
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// 3D Quadratic Bezier Arc for flight trajectories
function createFlightCurve(p1: THREE.Vector3, p2: THREE.Vector3, altitudeFactor = 1.35): THREE.QuadraticBezierCurve3 {
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const distance = p1.distanceTo(p2);
  const arcHeight = distance * 0.28 + altitudeFactor;
  mid.normalize().multiplyScalar(arcHeight);
  return new THREE.QuadraticBezierCurve3(p1, mid, p2);
}

export const TravelBackground3D: React.FC = () => {
  const { theme } = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);

  // Settings & user mode toggles
  const [visualMode, setVisualMode] = useState<'dynamic' | 'ambient' | 'off'>(() => {
    try {
      return (localStorage.getItem('voyage_3d_mode') as any) || 'dynamic';
    } catch {
      return 'dynamic';
    }
  });
  const [showControls, setShowControls] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  // Theme-aware color configuration
  const themeColors = useMemo(() => {
    switch (theme) {
      case 'royal-gold':
        return {
          primary: 0xf59e0b, // Amber Gold
          secondary: 0xfbbf24,
          glow: 0xd97706,
          atmosphere: 0x78350f,
          stars: 0xfef3c7,
          flightPulse: 0xffedd5,
          opacity: 0.85,
        };
      case 'crimson-black':
        return {
          primary: 0xf43f5e, // Crimson Rose
          secondary: 0xfb7185,
          glow: 0xe11d48,
          atmosphere: 0x881337,
          stars: 0xffe4e6,
          flightPulse: 0xfff1f2,
          opacity: 0.85,
        };
      case 'emerald-warm':
      case 'emerald-black':
        return {
          primary: 0x10b981, // Emerald
          secondary: 0x34d399,
          glow: 0x059669,
          atmosphere: 0x064e3b,
          stars: 0xd1fae5,
          flightPulse: 0xecfdf5,
          opacity: 0.85,
        };
      case 'violet-glass':
        return {
          primary: 0xa855f7, // Violet / Purple
          secondary: 0xc084fc,
          glow: 0x9333ea,
          atmosphere: 0x581c87,
          stars: 0xf3e8ff,
          flightPulse: 0xfae8ff,
          opacity: 0.85,
        };
      case 'rose-gold':
        return {
          primary: 0xf472b6, // Rose
          secondary: 0xfb7185,
          glow: 0xdb2777,
          atmosphere: 0x831843,
          stars: 0xfce7f3,
          flightPulse: 0xfff1f2,
          opacity: 0.85,
        };
      case 'nordic-frost':
        return {
          primary: 0x38bdf8, // Ice Cyan
          secondary: 0x7dd3fc,
          glow: 0x0284c7,
          atmosphere: 0x0c4a6e,
          stars: 0xe0f2fe,
          flightPulse: 0xf0f9ff,
          opacity: 0.85,
        };
      case 'cyan-light':
        return {
          primary: 0x0284c7, // Deep Sky
          secondary: 0x0ea5e9,
          glow: 0x0369a1,
          atmosphere: 0x075985,
          stars: 0x0369a1,
          flightPulse: 0x0284c7,
          opacity: 0.65,
        };
      case 'dark-slate':
      default:
        return {
          primary: 0x0ea5e9, // Electric Cyan / Azure
          secondary: 0x38bdf8,
          glow: 0x0284c7,
          atmosphere: 0x0369a1,
          stars: 0xe0f2fe,
          flightPulse: 0xffffff,
          opacity: 0.85,
        };
    }
  }, [theme]);

  // Persist mode choice
  const handleSetVisualMode = useCallback((mode: 'dynamic' | 'ambient' | 'off') => {
    setVisualMode(mode);
    try {
      localStorage.setItem('voyage_3d_mode', mode);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (visualMode === 'off' || !mountRef.current) return;

    const container = mountRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Probe for software WebGL to adapt performance gracefully
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 38);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(themeColors.primary, 1.5);
    dirLight1.position.set(20, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(themeColors.secondary, 1.0);
    dirLight2.position.set(-20, -15, -20);
    scene.add(dirLight2);

    // 3. Globe Root Group (Holds all globe parts)
    const globeGroup = new THREE.Group();
    globeGroup.position.set(10, -2, 0); // Positioned slightly to right flank for majestic background presence
    scene.add(globeGroup);

    const GLOBE_RADIUS = 12.5;

    // --- A. Translucent Core Sphere ---
    const coreGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 0.98, 48, 48);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x030712,
      emissive: themeColors.atmosphere,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: theme === 'cyan-light' ? 0.35 : 0.8,
      shininess: 35,
    });
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    globeGroup.add(coreSphere);

    // --- B. Latitude / Longitude Wireframe Grid ---
    const gridGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 24, 18);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: themeColors.primary,
      wireframe: true,
      transparent: true,
      opacity: theme === 'cyan-light' ? 0.08 : 0.14,
    });
    const gridSphere = new THREE.Mesh(gridGeometry, gridMaterial);
    globeGroup.add(gridSphere);

    // --- C. Procedural Continents (Point Cloud) ---
    const continentPoints = generateContinentPoints(GLOBE_RADIUS * 1.005);
    const continentGeo = new THREE.BufferGeometry().setFromPoints(continentPoints);
    const continentMat = new THREE.PointsMaterial({
      color: themeColors.primary,
      size: 0.28,
      transparent: true,
      opacity: theme === 'cyan-light' ? 0.5 : 0.75,
      blending: THREE.AdditiveBlending,
    });
    const continentPointCloud = new THREE.Points(continentGeo, continentMat);
    globeGroup.add(continentPointCloud);

    // --- D. City Hub Landmark Pins ---
    const hubMarkersGroup = new THREE.Group();
    const hubPositions: THREE.Vector3[] = GLOBAL_HUBS.map(hub =>
      latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS * 1.01)
    );

    const pinGeometry = new THREE.SphereGeometry(0.24, 12, 12);
    const albaniaPinGeo = new THREE.SphereGeometry(0.38, 16, 16);

    GLOBAL_HUBS.forEach((hub, idx) => {
      const pos = hubPositions[idx];
      const isSignature = hub.highlight;

      const pinMat = new THREE.MeshBasicMaterial({
        color: isSignature ? 0xffffff : themeColors.secondary,
      });
      const pinMesh = new THREE.Mesh(isSignature ? albaniaPinGeo : pinGeometry, pinMat);
      pinMesh.position.copy(pos);
      hubMarkersGroup.add(pinMesh);

      // Add a radiant ripple ring around signature hubs
      if (isSignature) {
        const ringGeo = new THREE.RingGeometry(0.35, 0.65, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: themeColors.primary,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
        ringMesh.lookAt(pos.clone().multiplyScalar(2));
        hubMarkersGroup.add(ringMesh);
      }
    });
    globeGroup.add(hubMarkersGroup);

    // --- E. 3D Flight Route Arcs & Animated Pulses ---
    const routesGroup = new THREE.Group();
    const flightCurves: THREE.QuadraticBezierCurve3[] = [];
    const flightPulses: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number; speed: number }[] = [];

    const pulseGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: themeColors.flightPulse,
    });

    FLIGHT_ROUTES.forEach(([fromIdx, toIdx], routeIndex) => {
      const p1 = hubPositions[fromIdx];
      const p2 = hubPositions[toIdx];
      if (!p1 || !p2) return;

      const curve = createFlightCurve(p1, p2, 0.4);
      flightCurves.push(curve);

      // Render the curve path as a smooth tube/line
      const pathPoints = curve.getPoints(36);
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
      const curveMaterial = new THREE.LineBasicMaterial({
        color: themeColors.secondary,
        transparent: true,
        opacity: theme === 'cyan-light' ? 0.25 : 0.45,
      });
      const curveLine = new THREE.Line(curveGeometry, curveMaterial);
      routesGroup.add(curveLine);

      // Add 1-2 glowing photon aircraft pulses per flight corridor
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      routesGroup.add(pulseMesh);
      flightPulses.push({
        mesh: pulseMesh,
        curve,
        progress: (routeIndex * 0.17) % 1.0,
        speed: 0.0018 + Math.random() * 0.0012,
      });
    });
    globeGroup.add(routesGroup);

    // --- F. Orbital Latitude Rings / Celestial Rings ---
    const orbitalRingGeo1 = new THREE.RingGeometry(GLOBE_RADIUS * 1.25, GLOBE_RADIUS * 1.27, 64);
    const orbitalRingMat1 = new THREE.MeshBasicMaterial({
      color: themeColors.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: theme === 'cyan-light' ? 0.08 : 0.16,
    });
    const orbitalRing1 = new THREE.Mesh(orbitalRingGeo1, orbitalRingMat1);
    orbitalRing1.rotation.x = Math.PI * 0.42;
    orbitalRing1.rotation.y = Math.PI * 0.15;
    globeGroup.add(orbitalRing1);

    const orbitalRingGeo2 = new THREE.RingGeometry(GLOBE_RADIUS * 1.45, GLOBE_RADIUS * 1.465, 64);
    const orbitalRingMat2 = new THREE.MeshBasicMaterial({
      color: themeColors.secondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: theme === 'cyan-light' ? 0.05 : 0.1,
    });
    const orbitalRing2 = new THREE.Mesh(orbitalRingGeo2, orbitalRingMat2);
    orbitalRing2.rotation.x = -Math.PI * 0.35;
    orbitalRing2.rotation.y = -Math.PI * 0.22;
    globeGroup.add(orbitalRing2);

    // --- G. Deep Space Celestial Starfield ---
    const starsCount = isSoftwareGl ? 350 : 900;
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);
    const c1 = new THREE.Color(themeColors.stars);
    const c2 = new THREE.Color(themeColors.secondary);

    for (let i = 0; i < starsCount; i++) {
      const idx = i * 3;
      const radius = 60 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      const mixed = c1.clone().lerp(c2, Math.random() * 0.6);
      starColors[idx] = mixed.r;
      starColors[idx + 1] = mixed.g;
      starColors[idx + 2] = mixed.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: theme === 'cyan-light' ? 0.3 : 0.65,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --- Interactive Mouse Parallax & Scroll Reactivity ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.15;
    let targetRotationY = 0.35;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX * 0.35;
      mouseY = normY * 0.25;
    };

    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY || 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || window.innerWidth;
      height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Adjust globe position based on screen width: Center on mobile, right-offset on desktop
      if (width < 768) {
        globeGroup.position.set(0, -4, 0);
        camera.position.z = 42;
      } else if (width < 1280) {
        globeGroup.position.set(6, -2, 0);
        camera.position.z = 38;
      } else {
        globeGroup.position.set(10, -2, 0);
        camera.position.z = 36;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // --- Render Loop with Exponential Damping & Pacing ---
    let frameId = 0;
    let isDisposed = false;
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);

      // 1. Natural rotational drift + mouse parallax
      const activeSpeed = visualMode === 'ambient' ? 0.35 : speedMultiplier;
      targetRotationY += 0.0018 * activeSpeed;

      globeGroup.rotation.y = THREE.MathUtils.damp(
        globeGroup.rotation.y,
        targetRotationY + mouseX,
        4,
        delta
      );
      globeGroup.rotation.x = THREE.MathUtils.damp(
        globeGroup.rotation.x,
        targetRotationX + mouseY + (scrollY * 0.0003),
        4,
        delta
      );

      // Slow orbital ring counter-rotation
      orbitalRing1.rotation.z += 0.0008 * activeSpeed;
      orbitalRing2.rotation.z -= 0.0005 * activeSpeed;

      // Subtle celestial star drift
      starField.rotation.y += 0.0002 * activeSpeed;

      // 2. Animate Flight Corridor Pulses
      flightPulses.forEach(pulse => {
        pulse.progress += pulse.speed * activeSpeed;
        if (pulse.progress >= 1.0) pulse.progress = 0;
        const currentPos = pulse.curve.getPoint(pulse.progress);
        pulse.mesh.position.copy(currentPos);
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Cleanup when component unmounts or mode toggles
    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      // Resource disposal
      coreGeometry.dispose();
      coreMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      continentGeo.dispose();
      continentMat.dispose();
      pinGeometry.dispose();
      albaniaPinGeo.dispose();
      orbitalRingGeo1.dispose();
      orbitalRingMat1.dispose();
      orbitalRingGeo2.dispose();
      orbitalRingMat2.dispose();
      starGeo.dispose();
      starMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [visualMode, themeColors, theme, speedMultiplier]);

  if (visualMode === 'off') {
    return (
      <div className="fixed bottom-4 left-4 z-30">
        <button
          type="button"
          onClick={() => handleSetVisualMode('dynamic')}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-sky-400 text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-all"
          title="Turn on 3D Cosmos Background"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline font-semibold">Enable 3D Cosmos</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 3D WebGL Canvas Layer (Fixed, behind UI, zero blocking) */}
      <div
        id="voyage-3d-background-canvas"
        ref={mountRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-700"
        style={{
          opacity: themeColors.opacity,
          // Subtle radial vignette so center content stays perfectly readable
          maskImage: 'radial-gradient(circle at 60% 50%, black 65%, rgba(0,0,0,0.4) 95%)',
          WebkitMaskImage: 'radial-gradient(circle at 60% 50%, black 65%, rgba(0,0,0,0.4) 95%)',
        }}
      />

      {/* Discrete, non-intrusive 3D HUD Dock (Bottom-Left) */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-auto">
        {!showControls ? (
          <button
            type="button"
            id="toggle-3d-hud-btn"
            onClick={() => setShowControls(true)}
            className="px-3 py-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900/95 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-2 shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            title="3D Background Settings & Cosmos Mode"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '14s' }} />
            <span className="font-semibold">3D Cosmos</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-200 shadow-2xl backdrop-blur-lg space-y-2.5 animate-in slide-in-from-bottom-2 duration-150 w-64 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>3D Cosmos Controller</span>
              </div>
              <button
                type="button"
                onClick={() => setShowControls(false)}
                className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
              >
                Done
              </button>
            </div>

            {/* Mode Selector */}
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Motion Style</div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleSetVisualMode('dynamic')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                    visualMode === 'dynamic' ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleSetVisualMode('ambient')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                    visualMode === 'ambient' ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Calm
                </button>
                <button
                  type="button"
                  onClick={() => handleSetVisualMode('off')}
                  className="py-1 rounded-lg text-[10px] font-bold transition-all bg-slate-900 text-slate-400 hover:text-rose-400"
                >
                  Hide
                </button>
              </div>
            </div>

            {/* Orbit Speed Multiplier */}
            {visualMode === 'dynamic' && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="uppercase tracking-wider font-semibold">Rotation Pace</span>
                  <span className="font-mono text-sky-400 font-bold">{speedMultiplier}x</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        speedMultiplier === spd ? 'bg-slate-800 text-sky-400 border border-sky-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
