import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Compass, Eye, RotateCcw, Sun } from 'lucide-react';
import { PropertyUnit } from '../types/realEstate';
import { formatCurrency } from '../data/mockProperties';
import {
  createContactShadowTexture,
  createPlazaGridTexture,
  detectSoftwareWebGL,
} from '../utils/threeHelpers';

interface ThreeMasterplanHeroProps {
  units: PropertyUnit[];
  selectedUnitId: string;
  onSelectUnit: (unit: PropertyUnit) => void;
  onLaunchTour: (unit: PropertyUnit) => void;
  onOpenBooking: (unit: PropertyUnit) => void;
}

type CameraPreset = 'overview' | 'tower' | 'villas';

const PRESET_VIEWS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number]; label: string }
> = {
  overview: { pos: [19, 13.5, 21], target: [0, 3.2, 0], label: 'نظرة شاملة' },
  tower: { pos: [11, 10.5, 13], target: [-1.5, 6.2, -1], label: 'البرج السكني' },
  villas: { pos: [13, 6.5, 12], target: [5.5, 1.4, 2.5], label: 'الفلل الخاصة' },
};

function getStatusColorHex(status: PropertyUnit['status']): number {
  if (status === 'متاح') return 0x1d4ed8;
  if (status === 'محجوز') return 0xd97706;
  return 0x94a3b8;
}

export const ThreeMasterplanHero: React.FC<ThreeMasterplanHeroProps> = ({
  units,
  selectedUnitId,
  onSelectUnit,
  onLaunchTour,
  onOpenBooking,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [activePreset, setActivePreset] = useState<CameraPreset>('overview');
  const [sunElevation, setSunElevation] = useState<number>(58);
  const [hoveredUnit, setHoveredUnit] = useState<PropertyUnit | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const unitsRef = useRef(units);
  unitsRef.current = units;

  const selectedIdRef = useRef(selectedUnitId);
  selectedIdRef.current = selectedUnitId;

  const onSelectUnitRef = useRef(onSelectUnit);
  onSelectUnitRef.current = onSelectUnit;

  const sceneRefs = useRef<{
    requestRender: () => void;
    updateUnitVisuals: () => void;
    setCameraPreset: (preset: CameraPreset) => void;
    setSunAngle: (deg: number) => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f7fb);
    scene.fog = new THREE.Fog(0xf4f7fb, 34, 82);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 140);
    camera.position.set(...PRESET_VIEWS.overview.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...PRESET_VIEWS.overview.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 9;
    controls.maxDistance = 36;
    controls.maxPolarAngle = Math.PI / 2.12;
    controls.minPolarAngle = 0.25;

    // Three-point warm/cool daylight rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xe2e8f0, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
    keyLight.position.set(16, 24, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 64;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbfdbfe, 0.65);
    rimLight.position.set(-16, 12, -14);
    scene.add(rimLight);

    // Architectural plaza & ground plane
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const plazaTex = createPlazaGridTexture(maxAniso);
    const groundMat = new THREE.MeshStandardMaterial({
      map: plazaTex,
      roughness: 0.88,
      metalness: 0.05,
      color: 0xffffff,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Elevated limestone architectural plinth
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.72,
      metalness: 0.05,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(23, 0.35, 17), plinthMat);
    plinth.position.set(1, 0.175, 0.5);
    plinth.receiveShadow = true;
    scene.add(plinth);

    // Contact shadows beneath tower and villas
    const contactTex = createContactShadowTexture();
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    });
    const towerShadow = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 11.5), contactMat);
    towerShadow.rotation.x = -Math.PI / 2;
    towerShadow.position.set(-3.2, 0.37, -1);
    scene.add(towerShadow);

    // Shared architectural materials
    const limestoneMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.52,
      metalness: 0.06,
    });
    const soffitWoodMat = new THREE.MeshStandardMaterial({
      color: 0xc2956b,
      roughness: 0.65,
      metalness: 0.04,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      roughness: 0.08,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.68,
      transparent: true,
      opacity: isSoftwareGl ? 0.52 : 0.92,
      ior: 1.5,
      clearcoat: 1.0,
    });
    const poolWaterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
    });

    // --- 1. Sculptural Residential Tower (Composite Group) ---
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-3.2, 0.35, -1);
    scene.add(towerGroup);

    // Lobby colonnade podium
    const podiumBase = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.4, 7.2), limestoneMat);
    podiumBase.position.y = 0.7;
    podiumBase.castShadow = true;
    podiumBase.receiveShadow = true;
    towerGroup.add(podiumBase);

    const lobbyGlass = new THREE.Mesh(new THREE.BoxGeometry(7.3, 1.25, 6.8), glassMat);
    lobbyGlass.position.y = 0.7;
    towerGroup.add(lobbyGlass);

    // Vertical structural core
    const coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 11.8, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6, metalness: 0.1 })
    );
    coreMesh.position.y = 6.5;
    coreMesh.castShadow = true;
    towerGroup.add(coreMesh);

    // Interactive unit floor modules mapped to units
    const clickableMeshes: THREE.Mesh[] = [];
    const unitVisualMap = new Map<
      string,
      { indicatorMat: THREE.MeshStandardMaterial; ringMesh: THREE.Mesh; unitId: string }
    >();

    const towerUnits = unitsRef.current.filter((u) => u.masterplanZone === 'tower');
    const floorLevels = 6;

    for (let f = 0; f < floorLevels; f++) {
      const floorY = 1.65 + f * 1.68;
      const mappedUnit =
        towerUnits.find((u) => u.towerFloorIndex === f) || towerUnits[f % Math.max(towerUnits.length, 1)];

      const floorGroup = new THREE.Group();
      floorGroup.position.y = floorY;

      const cantileverOffset = (f % 2 === 0 ? 0.25 : -0.25);

      // Floor slab + warm wood soffit trim
      const slab = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.22, 6.2), limestoneMat);
      slab.position.x = cantileverOffset;
      slab.castShadow = true;
      slab.receiveShadow = true;
      floorGroup.add(slab);

      const soffit = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.08, 6.0), soffitWoodMat);
      soffit.position.set(cantileverOffset, -0.11, 0);
      floorGroup.add(soffit);

      // Glazed residential volume
      const unitVolumeMat = new THREE.MeshStandardMaterial({
        color: mappedUnit ? getStatusColorHex(mappedUnit.status) : 0x1d4ed8,
        roughness: 0.28,
        metalness: 0.15,
        emissive: 0x000000,
      });

      const volume = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.25, 5.2), unitVolumeMat);
      volume.position.set(cantileverOffset, 0.72, 0);
      volume.castShadow = true;
      volume.receiveShadow = true;

      if (mappedUnit) {
        volume.userData.unitId = mappedUnit.id;
        volume.layers.enable(1);
        clickableMeshes.push(volume);
      }
      floorGroup.add(volume);

      // Glass balcony balustrade around slab edge
      const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(6.75, 0.42, 6.15), glassMat);
      balconyGlass.position.set(cantileverOffset, 0.32, 0);
      floorGroup.add(balconyGlass);

      // Selection highlight frame
      const highlightMat = new THREE.MeshBasicMaterial({
        color: 0x0f172a,
        wireframe: true,
        visible: false,
      });
      const highlightBox = new THREE.Mesh(new THREE.BoxGeometry(6.95, 1.48, 6.35), highlightMat);
      highlightBox.position.set(cantileverOffset, 0.74, 0);
      floorGroup.add(highlightBox);

      if (mappedUnit && !unitVisualMap.has(mappedUnit.id)) {
        unitVisualMap.set(mappedUnit.id, {
          indicatorMat: unitVolumeMat,
          ringMesh: highlightBox,
          unitId: mappedUnit.id,
        });
      }

      towerGroup.add(floorGroup);
    }

    // Rooftop infinity terrace & pergola
    const roofY = 1.65 + floorLevels * 1.68;
    const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.25, 6.4), limestoneMat);
    roofDeck.position.y = roofY;
    roofDeck.castShadow = true;
    towerGroup.add(roofDeck);

    const roofPool = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 2.2), poolWaterMat);
    roofPool.position.set(1.1, roofY + 0.15, 1.4);
    towerGroup.add(roofPool);

    // --- 2. Courtyard Garden Villas (East & West Composite Groups) ---
    const createVillaGroup = (x: number, z: number, unit: PropertyUnit | undefined) => {
      const vg = new THREE.Group();
      vg.position.set(x, 0.35, z);

      // Main limestone pavilion
      const mainWing = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.7, 3.2), limestoneMat);
      mainWing.position.set(0, 0.85, -0.8);
      mainWing.castShadow = true;
      mainWing.receiveShadow = true;
      vg.add(mainWing);

      // Status-coded living pavilion
      const villaMat = new THREE.MeshStandardMaterial({
        color: unit ? getStatusColorHex(unit.status) : 0x1d4ed8,
        roughness: 0.32,
        metalness: 0.12,
      });
      const upperSuite = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.35, 2.8), villaMat);
      upperSuite.position.set(-0.4, 2.35, -0.8);
      upperSuite.castShadow = true;
      if (unit) {
        upperSuite.userData.unitId = unit.id;
        upperSuite.layers.enable(1);
        clickableMeshes.push(upperSuite);
      }
      vg.add(upperSuite);

      // Roof overhang
      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.18, 3.7), limestoneMat);
      roof.position.set(-0.2, 3.1, -0.8);
      roof.castShadow = true;
      vg.add(roof);

      // Courtyard pool
      const pool = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.8), poolWaterMat);
      pool.position.set(0.4, 0.05, 1.7);
      vg.add(pool);

      const highlightBox = new THREE.Mesh(
        new THREE.BoxGeometry(5.1, 3.3, 5.4),
        new THREE.MeshBasicMaterial({ color: 0x0f172a, wireframe: true, visible: false })
      );
      highlightBox.position.set(0, 1.65, 0.2);
      vg.add(highlightBox);

      if (unit) {
        unitVisualMap.set(unit.id, {
          indicatorMat: villaMat,
          ringMesh: highlightBox,
          unitId: unit.id,
        });
      }

      scene.add(vg);
    };

    const villaEast = unitsRef.current.find((u) => u.masterplanZone === 'villa-east');
    const villaWest = unitsRef.current.find((u) => u.masterplanZone === 'villa-west');
    createVillaGroup(5.6, -2.5, villaEast);
    createVillaGroup(5.6, 3.8, villaWest);

    // --- 3. Instanced Olive/Cypress Landscaping Trees ---
    const treePositions: [number, number, number][] = [
      [-8.5, 0.35, -5.8],
      [-8.5, 0.35, 4.8],
      [1.2, 0.35, 6.2],
      [9.8, 0.35, -5.6],
      [10.2, 0.35, 6.0],
      [1.5, 0.35, -6.2],
      [-4.2, 0.35, 6.4],
    ];
    const trunkGeo = new THREE.CylinderGeometry(0.11, 0.16, 1.1, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78553a, roughness: 0.9 });
    const canopyGeo = new THREE.IcosahedronGeometry(0.75, 1);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x6b8f71, roughness: 0.82 });

    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treePositions.length);
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, treePositions.length);
    trunks.castShadow = !isSoftwareGl;
    canopies.castShadow = !isSoftwareGl;

    const dummy = new THREE.Object3D();
    treePositions.forEach(([tx, ty, tz], i) => {
      const s = 0.85 + ((i * 17) % 30) / 100;
      dummy.position.set(tx, ty + 0.55 * s, tz);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tx, ty + 1.45 * s, tz);
      dummy.scale.set(s * 1.1, s * 0.95, s * 1.1);
      dummy.updateMatrix();
      canopies.setMatrixAt(i, dummy.matrix);
    });
    trunks.computeBoundingSphere();
    canopies.computeBoundingSphere();
    scene.add(trunks);
    scene.add(canopies);

    // --- Camera transition & On-demand render scheduler ---
    const targetCamPos = new THREE.Vector3(...PRESET_VIEWS.overview.pos);
    const targetLookAt = new THREE.Vector3(...PRESET_VIEWS.overview.target);
    let animatingCamera = false;
    let lastTime = performance.now();
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed || renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (animatingCamera) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 5.5, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 5.5, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 5.5, dt);

          controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLookAt.x, 5.5, dt);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLookAt.y, 5.5, dt);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLookAt.z, 5.5, dt);

          if (
            camera.position.distanceTo(targetCamPos) < 0.08 &&
            controls.target.distanceTo(targetLookAt) < 0.05
          ) {
            animatingCamera = false;
          } else {
            renderDirty = true;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty && !disposed) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    const handleControlStart = () => {
      animatingCamera = false;
    };
    const handleControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('change', handleControlChange);

    // Raycasting for click & hover
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let lastHoverTime = 0;

    const updatePointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const now = Date.now();
      if (now - lastHoverTime < 60) return;
      lastHoverTime = now;

      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const unitId = hits[0].object.userData.unitId as string;
        const found = unitsRef.current.find((u) => u.id === unitId) || null;
        renderer.domElement.style.cursor = 'pointer';
        setHoveredUnit(found);
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHoveredUnit(null);
      }
    };

    let downPos = { x: 0, y: 0 };
    const handlePointerDown = (ev: PointerEvent) => {
      downPos = { x: ev.clientX, y: ev.clientY };
    };
    const handlePointerUp = (ev: PointerEvent) => {
      const moved = Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y);
      if (moved > 6) return;
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const unitId = hits[0].object.userData.unitId as string;
        const found = unitsRef.current.find((u) => u.id === unitId);
        if (found) {
          onSelectUnitRef.current(found);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 320);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const updateUnitVisuals = () => {
      unitsRef.current.forEach((unit) => {
        const entry = unitVisualMap.get(unit.id);
        if (!entry) return;
        entry.indicatorMat.color.setHex(getStatusColorHex(unit.status));
        const isSelected = unit.id === selectedIdRef.current;
        entry.indicatorMat.emissive.setHex(isSelected ? 0x1e3a8a : 0x000000);
        entry.indicatorMat.emissiveIntensity = isSelected ? 0.35 : 0;
        entry.ringMesh.visible = isSelected;
      });
      requestRender();
    };

    const setCameraPreset = (preset: CameraPreset) => {
      const cfg = PRESET_VIEWS[preset];
      targetCamPos.set(...cfg.pos);
      targetLookAt.set(...cfg.target);
      animatingCamera = true;
      lastTime = performance.now();
      requestRender();
    };

    const setSunAngle = (deg: number) => {
      const rad = THREE.MathUtils.degToRad(deg);
      keyLight.position.set(Math.cos(rad) * 24, 14 + Math.sin(rad) * 14, 14);
      requestRender();
    };

    sceneRefs.current = {
      requestRender,
      updateUnitVisuals,
      setCameraPreset,
      setSunAngle,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    updateUnitVisuals();
    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('change', handleControlChange);
      controls.dispose();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
      envTex.dispose();
      plazaTex.dispose();
      contactTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync live unit updates & selected unit highlight into 3D scene
  useEffect(() => {
    sceneRefs.current?.updateUnitVisuals();
  }, [units, selectedUnitId]);

  const selectedUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  const handlePresetClick = (preset: CameraPreset) => {
    setActivePreset(preset);
    sceneRefs.current?.setCameraPreset(preset);
  };

  const handleSunChange = (val: number) => {
    setSunElevation(val);
    sceneRefs.current?.setSunAngle(val);
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[600px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden select-none">
      {/* Isolated WebGL mount container */}
      {webglUnavailable ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <img
            src={selectedUnit.image}
            alt={selectedUnit.title}
            referrerPolicy="no-referrer"
            className="w-full max-w-md h-56 object-cover rounded-lg mb-4 border border-slate-200"
          />
          <p className="text-sm font-medium text-slate-700">
            معاينة معمارية ثنائية الأبعاد (WebGL غير مفعل على هذا المتصفح)
          </p>
        </div>
      ) : (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      )}

      {/* Top-Right Compact Unit Inspector Tag (no backdrop-blur over WebGL) */}
      <div className="absolute top-4 right-4 z-10 max-w-xs bg-white/95 border border-slate-200 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="font-mono-nums text-xs text-slate-500">{selectedUnit.code}</span>
          <span
            className={`text-xs font-semibold ${
              selectedUnit.status === 'متاح'
                ? 'text-emerald-700'
                : selectedUnit.status === 'محجوز'
                  ? 'text-amber-700'
                  : 'text-slate-500'
            }`}
          >
            {selectedUnit.status} · {selectedUnit.listingType}
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 truncate">{selectedUnit.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 tabular-nums">
          <span>{selectedUnit.areaSqm} م²</span>
          <span aria-hidden="true">·</span>
          <span>{selectedUnit.bedrooms} غرف</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(selectedUnit.price)} ج.م
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLaunchTour(selectedUnit)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>جولة 3D داخلية</span>
          </button>
          {selectedUnit.status === 'متاح' && (
            <button
              type="button"
              onClick={() => onOpenBooking(selectedUnit)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 hover:-translate-y-0.5 rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              شراء / حجز
            </button>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredUnit && hoveredUnit.id !== selectedUnit.id && (
        <div className="absolute top-4 left-4 z-10 bg-slate-900 text-white text-xs px-3 py-2 rounded-md pointer-events-none">
          <p className="font-semibold">{hoveredUnit.title}</p>
          <p className="text-slate-300 mt-0.5">
            اضغط للتحديد · {hoveredUnit.status} · {formatCurrency(hoveredUnit.price)} ج.م
          </p>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(680px,94%)] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setControlsCollapsed((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-b-0 border-slate-200 rounded-t-md hover:bg-slate-50 transition-colors"
        >
          {controlsCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>إظهار أدوات المجسم</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>إخفاء الأدوات</span>
            </>
          )}
        </button>

        {!controlsCollapsed && (
          <div className="w-full bg-white/95 border border-slate-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            {/* Camera Presets */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
              {(Object.keys(PRESET_VIEWS) as CameraPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    activePreset === preset
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {PRESET_VIEWS[preset].label}
                </button>
              ))}
            </div>

            {/* Sun Elevation Slider */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="whitespace-nowrap">زاوية الشمس</span>
              <input
                type="range"
                min={15}
                max={145}
                value={sunElevation}
                onChange={(e) => handleSunChange(Number(e.target.value))}
                aria-label="زاوية الإضاءة الشمسية"
                className="w-24 accent-blue-700 cursor-pointer"
              />
            </div>

            {/* Color Legend + Reset */}
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-700 inline-block" />
                متاح
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-600 inline-block" />
                محجوز
              </span>
              <button
                type="button"
                onClick={() => handlePresetClick('overview')}
                className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700 font-medium whitespace-nowrap"
                title="إعادة ضبط الكاميرا"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ضبط</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom-Right Interaction Hint */}
      <div className="hidden sm:flex items-center gap-1.5 absolute bottom-4 right-4 z-10 text-[11px] text-slate-500 bg-white/90 border border-slate-200 px-2.5 py-1 rounded">
        <Compass className="w-3.5 h-3.5 text-blue-700" />
        <span>اسحب للتدوير · اضغط على الطوابق للاختيار</span>
      </div>
    </div>
  );
};
