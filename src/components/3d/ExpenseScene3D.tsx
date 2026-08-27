import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Transaction, Currency, Visual3DMode, CategoryKey } from '../../types';
import { CATEGORIES } from '../../data/initialData';
import { formatCurrency, getCategoryBreakdown } from '../../utils/formatters';
import { 
  Rotate3d, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  Camera, 
  Sparkles, 
  Eye, 
  Maximize2,
  ZoomIn,
  RefreshCw
} from 'lucide-react';

interface ExpenseScene3DProps {
  transactions: Transaction[];
  currency: Currency;
  onSelectCategory?: (category: CategoryKey | null) => void;
  selectedCategory?: CategoryKey | null;
  onCaptureSnapshot?: () => void;
}

export const ExpenseScene3D: React.FC<ExpenseScene3DProps> = ({
  transactions,
  currency,
  onSelectCategory,
  selectedCategory,
  onCaptureSnapshot
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Scene Controls State
  const [visualMode, setVisualMode] = useState<Visual3DMode>('rings');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [hoveredData, setHoveredData] = useState<{
    category: CategoryKey;
    name: string;
    amount: number;
    percentage: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  // Internal Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const interactiveObjectsRef = useRef<THREE.Mesh[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 6, radius: 24 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  const categoryBreakdown = getCategoryBreakdown(transactions, 'expense');
  const totalExpense = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);

  // Reset Camera View to Presets
  const setCameraPreset = (preset: 'iso' | 'top' | 'front') => {
    if (preset === 'iso') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 6, radius: 24 };
    } else if (preset === 'top') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.1, radius: 26 };
    } else if (preset === 'front') {
      cameraAngleRef.current = { theta: 0, phi: 0.1, radius: 24 };
    }
  };

  // Re-build 3D objects when data or visualMode changes
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 420;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // Transparent background for sleek glass integration

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true, // Crucial for image export
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x14b8a6, 2.0); // Teal Accent Light
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 1.8); // Indigo Accent Light
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    const centerPointLight = new THREE.PointLight(0xffffff, 1.5, 50);
    centerPointLight.position.set(0, 5, 0);
    scene.add(centerPointLight);

    // 5. Grid Pedestal / Cyber Platform
    const gridHelper = new THREE.GridHelper(30, 30, 0x14b8a6, 0x1e293b);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // Floating Ambient Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 40;
      posArray[i + 1] = Math.random() * 20 - 3;
      posArray[i + 2] = (Math.random() - 0.5) * 40;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Build Geometry Based on Visual Mode
    interactiveObjectsRef.current = [];

    if (visualMode === 'rings') {
      buildCategoryRings(scene);
    } else if (visualMode === 'towers') {
      buildSpendingTowers(scene);
    } else if (visualMode === 'vault') {
      buildBudgetVault(scene);
    } else if (visualMode === 'flow') {
      buildParticleFlow(scene);
    }

    // 7. Raycasting Setup for Mouse Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (cameraRef.current && sceneRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(interactiveObjectsRef.current);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const meta = hit.userData;
          if (meta && meta.category) {
            setHoveredData({
              category: meta.category,
              name: meta.name,
              amount: meta.amount,
              percentage: meta.percentage,
              color: meta.color,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
            document.body.style.cursor = 'pointer';
            return;
          }
        }
      }
      setHoveredData(null);
      document.body.style.cursor = 'default';
    };

    const handlePointerClick = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (cameraRef.current && sceneRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(interactiveObjectsRef.current);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const meta = hit.userData;
          if (meta && meta.category && onSelectCategory) {
            onSelectCategory(meta.category);
          }
        }
      }
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousemove', handlePointerMove);
    canvasEl.addEventListener('click', handlePointerClick);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto rotation
      if (autoRotate && !isDraggingRef.current) {
        cameraAngleRef.current.theta += delta * 0.35;
        updateCameraPosition();
      }

      // Animate floating particles
      particles.rotation.y = time * 0.05;

      // Animate interactive nodes gentle float
      interactiveObjectsRef.current.forEach((mesh, index) => {
        if (mesh.userData.isCore) {
          mesh.rotation.y += 0.01;
          mesh.rotation.x = Math.sin(time * 0.8) * 0.1;
        } else if (visualMode === 'rings') {
          // Subtle pulsation
          const scaleOffset = Math.sin(time * 1.5 + index) * 0.02;
          mesh.scale.set(1 + scaleOffset, 1 + scaleOffset, 1 + scaleOffset);
        } else if (visualMode === 'towers') {
          // Glow or subtle height breathing
        }
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || 420;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      canvasEl.removeEventListener('mousemove', handlePointerMove);
      canvasEl.removeEventListener('click', handlePointerClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [visualMode, wireframeMode, transactions, currency, selectedCategory]);

  // Update Camera Orbit Coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    
    // Convert spherical to cartesian
    const x = radius * Math.cos(phi) * Math.sin(theta);
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(targetLookAtRef.current);
  };

  // Mouse Orbit Drag Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.008)
    );

    updateCameraPosition();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(
      10,
      Math.min(45, cameraAngleRef.current.radius + e.deltaY * 0.02)
    );
    updateCameraPosition();
  };

  // Touch Support for Mobile Drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
    const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta -= deltaX * 0.01;
    cameraAngleRef.current.phi = Math.max(
      -Math.PI / 3,
      Math.min(Math.PI / 2.2, cameraAngleRef.current.phi + deltaY * 0.01)
    );

    updateCameraPosition();
    previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  // ================= 3D BUILDER ALGORITHMS =================

  // Mode 1: 3D Category Extruded Arc Donut Rings
  const buildCategoryRings = (scene: THREE.Scene) => {
    if (categoryBreakdown.length === 0) {
      buildEmptyState(scene);
      return;
    }

    let startAngle = 0;
    const innerRadius = 3.5;
    const outerRadius = 7.0;
    const height = 1.4;

    // Central Floating Core Orb
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 3);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6,
      emissive: 0x0f766e,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: wireframeMode,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0, 0);
    coreMesh.userData = { isCore: true };
    scene.add(coreMesh);
    interactiveObjectsRef.current.push(coreMesh);

    categoryBreakdown.forEach((cat) => {
      const sliceAngle = (cat.percentage / 100) * (Math.PI * 2);
      const isSelected = selectedCategory === cat.key;

      // Create 2D Arc Shape
      const shape = new THREE.Shape();
      const arcSegments = 32;
      const endAngle = startAngle + sliceAngle;

      const currentOuterRadius = isSelected ? outerRadius + 0.8 : outerRadius;
      const currentInnerRadius = isSelected ? innerRadius - 0.2 : innerRadius;

      // Outer Arc
      for (let i = 0; i <= arcSegments; i++) {
        const theta = startAngle + (i / arcSegments) * sliceAngle;
        const x = Math.cos(theta) * currentOuterRadius;
        const y = Math.sin(theta) * currentOuterRadius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }

      // Inner Arc backwards
      for (let i = arcSegments; i >= 0; i--) {
        const theta = startAngle + (i / arcSegments) * sliceAngle;
        const x = Math.cos(theta) * currentInnerRadius;
        const y = Math.sin(theta) * currentInnerRadius;
        shape.lineTo(x, y);
      }
      shape.closePath();

      // Extrude 3D Geometry
      const extrudeSettings = {
        depth: isSelected ? height + 0.8 : height,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.15,
        bevelThickness: 0.15,
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();

      const hexColor = CATEGORIES[cat.key]?.hexColor || 0x14b8a6;
      const material = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.25,
        metalness: 0.65,
        wireframe: wireframeMode,
        emissive: hexColor,
        emissiveIntensity: isSelected ? 0.6 : 0.15,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = Math.PI / 2; // Flat on horizontal plane

      // Offset slightly along mid-angle for separation
      const midAngle = startAngle + sliceAngle / 2;
      const offsetDistance = isSelected ? 0.9 : 0.25;
      mesh.position.x = Math.cos(midAngle) * offsetDistance;
      mesh.position.z = Math.sin(midAngle) * offsetDistance;
      mesh.position.y = isSelected ? 0.5 : 0;

      mesh.userData = {
        category: cat.key,
        name: cat.name,
        amount: cat.amount,
        percentage: cat.percentage,
        color: cat.color,
      };

      scene.add(mesh);
      interactiveObjectsRef.current.push(mesh);

      startAngle = endAngle;
    });
  };

  // Mode 2: 3D Spending Metropolis (Tower Pillars)
  const buildSpendingTowers = (scene: THREE.Scene) => {
    if (categoryBreakdown.length === 0) {
      buildEmptyState(scene);
      return;
    }

    const count = categoryBreakdown.length;
    const maxAmount = Math.max(...categoryBreakdown.map(c => c.amount), 1);
    const radius = 6.5;

    categoryBreakdown.forEach((cat, index) => {
      const angle = (index / count) * Math.PI * 2;
      const height = Math.max(1.0, (cat.amount / maxAmount) * 9.5);
      const isSelected = selectedCategory === cat.key;

      // Hexagonal Pillar Geometry
      const geometry = new THREE.CylinderGeometry(1.0, 1.2, height, 6);
      const hexColor = CATEGORIES[cat.key]?.hexColor || 0x14b8a6;

      const material = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.2,
        metalness: 0.7,
        wireframe: wireframeMode,
        emissive: hexColor,
        emissiveIntensity: isSelected ? 0.7 : 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      mesh.position.set(x, height / 2 - 2.8, z);

      // Glowing Top Cap Sphere
      const topCapGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const topCapMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const topCap = new THREE.Mesh(topCapGeo, topCapMat);
      topCap.position.set(0, height / 2 + 0.3, 0);
      mesh.add(topCap);

      mesh.userData = {
        category: cat.key,
        name: cat.name,
        amount: cat.amount,
        percentage: cat.percentage,
        color: cat.color,
      };

      scene.add(mesh);
      interactiveObjectsRef.current.push(mesh);
    });
  };

  // Mode 3: 3D Holographic Wealth & Budget Vault
  const buildBudgetVault = (scene: THREE.Scene) => {
    // Glass Vault Outer Cylinder
    const glassGeo = new THREE.CylinderGeometry(4.5, 4.5, 9, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x99f6e4,
      transparent: true,
      opacity: 0.28,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      wireframe: wireframeMode,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 1.5;
    scene.add(glassMesh);

    // Vault Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(5.2, 5.5, 1.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -3.2;
    scene.add(baseMesh);

    // Inner Liquid/Wealth Core (Filled based on spending vs total)
    const fillRatio = Math.min(1.0, Math.max(0.15, totalExpense / 8000));
    const liquidHeight = fillRatio * 7.5;
    const liquidGeo = new THREE.CylinderGeometry(4.2, 4.2, liquidHeight, 32);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      emissive: 0x0d9488,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = -3 + liquidHeight / 2;
    scene.add(liquidMesh);

    // Golden Floating Coins inside
    const coinGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.12, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xca8a04,
      emissiveIntensity: 0.3,
    });

    for (let i = 0; i < 8; i++) {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(
        (Math.random() - 0.5) * 5,
        -1.5 + Math.random() * 4.5,
        (Math.random() - 0.5) * 5
      );
      coin.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(coin);
    }
  };

  // Mode 4: 3D Constellation Flow
  const buildParticleFlow = (scene: THREE.Scene) => {
    // Central Hub
    const hubGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4338ca,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(0, 0, 0);
    hub.userData = { isCore: true };
    scene.add(hub);
    interactiveObjectsRef.current.push(hub);

    categoryBreakdown.forEach((cat, index) => {
      const phi = Math.acos(-1 + (2 * index) / categoryBreakdown.length);
      const theta = Math.sqrt(categoryBreakdown.length * Math.PI) * phi;
      const radius = 7.5;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const sphereSize = Math.max(0.6, (cat.percentage / 100) * 2.2);
      const nodeGeo = new THREE.SphereGeometry(sphereSize, 24, 24);
      const hexColor = CATEGORIES[cat.key]?.hexColor || 0x14b8a6;
      const nodeMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.2,
      });

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = {
        category: cat.key,
        name: cat.name,
        amount: cat.amount,
        percentage: cat.percentage,
        color: cat.color,
      };

      // Connecting Laser Line to Hub
      const lineMat = new THREE.LineBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.5,
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      scene.add(nodeMesh);
      interactiveObjectsRef.current.push(nodeMesh);
    });
  };

  const buildEmptyState = (scene: THREE.Scene) => {
    const geo = new THREE.TorusGeometry(4, 0.4, 16, 100);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-dark-surface/90 via-dark-card/70 to-dark-bg/95 border border-white/10 shadow-card backdrop-blur-xl select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing relative z-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      />

      {/* Top Floating HUD: Visual Mode Switcher & Stats */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Visual Mode Selector (Interactive) */}
        <div className="pointer-events-auto flex items-center bg-dark-card/90 border border-white/15 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVisualMode('rings'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              visualMode === 'rings'
                ? 'bg-brand-600 text-white shadow-glow-teal'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Ring</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVisualMode('towers'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              visualMode === 'towers'
                ? 'bg-brand-600 text-white shadow-glow-teal'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Towers</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVisualMode('vault'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              visualMode === 'vault'
                ? 'bg-brand-600 text-white shadow-glow-teal'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vault</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVisualMode('flow'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              visualMode === 'flow'
                ? 'bg-brand-600 text-white shadow-glow-teal'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cosmos</span>
          </button>
        </div>

        {/* Live Total Expense Pill */}
        <div className="bg-dark-card/90 border border-brand-500/30 rounded-2xl px-4 py-2 shadow-glow-teal backdrop-blur-md flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-ping" />
          <div>
            <div className="text-[10px] uppercase font-bold text-brand-300 tracking-wider">Total Volume</div>
            <div className="text-sm font-extrabold text-white">{formatCurrency(totalExpense, currency)}</div>
          </div>
        </div>
      </div>

      {/* Right Floating Camera Controls & Tools */}
      <div className="absolute right-4 top-20 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setAutoRotate(!autoRotate); }}
          title={autoRotate ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
          className={`p-2.5 rounded-xl border backdrop-blur-md text-xs font-medium transition-all cursor-pointer ${
            autoRotate 
              ? 'bg-brand-600/30 border-brand-500/50 text-brand-300 shadow-glow-teal' 
              : 'bg-dark-card/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setWireframeMode(!wireframeMode); }}
          title="Toggle Hologram Wireframe"
          className={`p-2.5 rounded-xl border backdrop-blur-md text-xs font-medium transition-all cursor-pointer ${
            wireframeMode 
              ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 shadow-glow-indigo' 
              : 'bg-dark-card/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setCameraPreset('iso'); }}
          title="Isometric View"
          className="p-2.5 rounded-xl bg-dark-card/80 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all text-xs cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setCameraPreset('top'); }}
          title="Top Down Radar View"
          className="p-2.5 rounded-xl bg-dark-card/80 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all text-xs cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Snapshot Capture Button */}
        {onCaptureSnapshot && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCaptureSnapshot(); }}
            title="Export High-Res 3D Image"
            className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-glow-teal hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Hover Raycast Tooltip Card */}
      {hoveredData && (
        <div
          className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-xl bg-dark-card/95 border border-white/20 shadow-2xl backdrop-blur-xl animate-fade-in"
          style={{
            left: `${hoveredData.x}px`,
            top: `${hoveredData.y}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: hoveredData.color }}
            />
            <span className="text-xs font-bold text-white">{hoveredData.name}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-brand-300">
              {formatCurrency(hoveredData.amount, currency)}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {hoveredData.percentage}% of total
            </span>
          </div>
        </div>
      )}

      {/* Bottom Interactive Navigation Helper */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
        <div className="flex items-center gap-2 bg-dark-surface/80 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
          <span>🖱️ Click & Drag to Orbit</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Scroll to Zoom</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Click 3D Slices to Filter</span>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="pointer-events-auto bg-brand-600/80 hover:bg-brand-600 text-white font-semibold px-3 py-1 rounded-full text-xs transition-all shadow-glow-teal"
          >
            Clear Filter ✕
          </button>
        )}
      </div>
    </div>
  );
};
