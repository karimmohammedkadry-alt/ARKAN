import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Moon,
  Palette,
  Plus,
  Sofa,
  Sun,
  X,
} from 'lucide-react';
import { InteriorFinish, PropertyUnit } from '../types/realEstate';
import { formatCurrency } from '../data/mockProperties';
import {
  createMarbleTexture,
  createOakParquetTexture,
  createSlateTileTexture,
  createWovenRugTexture,
  detectSoftwareWebGL,
} from '../utils/threeHelpers';

interface ThreeInteriorTourModalProps {
  unit: PropertyUnit | null;
  onClose: () => void;
  onBookUnit: (unit: PropertyUnit) => void;
}

type RoomWaypointId = 'living' | 'kitchen' | 'bedroom' | 'terrace';
type DockTab = 'rooms' | 'colors' | 'furniture';
type FurnitureId = 'dining' | 'desk' | 'tv_fireplace' | 'reading_corner' | 'plants';

interface WaypointConfig {
  id: RoomWaypointId;
  label: string;
  pos: [number, number, number];
  yaw: number;
  pitch: number;
}

const WAYPOINTS: WaypointConfig[] = [
  { id: 'living', label: 'الصالة الرئيسية', pos: [-3.3, 1.65, 2.6], yaw: -0.42, pitch: -0.04 },
  { id: 'kitchen', label: 'المطبخ والطعام', pos: [3.1, 1.65, 2.3], yaw: 0.42, pitch: -0.07 },
  { id: 'bedroom', label: 'غرفة النوم', pos: [3.2, 1.65, -2.2], yaw: 2.58, pitch: -0.06 },
  { id: 'terrace', label: 'التراس / الحديقة', pos: [-1.4, 1.65, 5.4], yaw: 0.12, pitch: -0.03 },
];

const FINISH_LABELS: Record<InteriorFinish, string> = {
  marble: 'رخام كرارا',
  oak: 'باركيه بلوط',
  slate: 'حجر أردواز',
};

const WALL_PALETTE = [
  { id: 'pure_white', label: 'أبيض ناصع', hex: '#FAF9F6', accentHex: '#EEF2F6' },
  { id: 'warm_sand', label: 'بيج رملي', hex: '#F3ECE1', accentHex: '#E6DCCB' },
  { id: 'stone_gray', label: 'رمادي حجري', hex: '#E5E7EB', accentHex: '#CBD5E1' },
  { id: 'mist_blue', label: 'أزرق ضبابي', hex: '#E4EDF7', accentHex: '#CBD9EC' },
  { id: 'sage_green', label: 'أخضر مريمي', hex: '#E3ECE5', accentHex: '#C7DACB' },
];

const FURNITURE_CATALOG: Array<{ id: FurnitureId; label: string }> = [
  { id: 'dining', label: 'طقم طعام 4 مقاعد' },
  { id: 'tv_fireplace', label: 'مدفأة وشاشة جدارية' },
  { id: 'desk', label: 'مكتب عمل منزلي' },
  { id: 'reading_corner', label: 'كرسي استرخاء وإضاءة' },
  { id: 'plants', label: 'نباتات داخلية فاخرة' },
];

function createRoundedBoxGeometry(w: number, h: number, d: number, r = 0.04): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  shape.moveTo(-hw, -hd - r);
  shape.lineTo(hw, -hd - r);
  shape.quadraticCurveTo(hw + r, -hd - r, hw + r, -hd);
  shape.lineTo(hw + r, hd);
  shape.quadraticCurveTo(hw + r, hd + r, hw, hd + r);
  shape.lineTo(-hw, hd + r);
  shape.quadraticCurveTo(-hw - r, hd + r, -hw - r, hd);
  shape.lineTo(-hw - r, -hd);
  shape.quadraticCurveTo(-hw - r, -hd - r, -hw, -hd - r);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(h - r * 2, 0.02),
    bevelEnabled: true,
    bevelThickness: r,
    bevelSize: r,
    bevelSegments: 2,
  });
  geo.rotateX(Math.PI / 2);
  geo.center();
  return geo;
}

export const ThreeInteriorTourModal: React.FC<ThreeInteriorTourModalProps> = ({
  unit,
  onClose,
  onBookUnit,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomWaypointId>('living');
  const [activeTab, setActiveTab] = useState<DockTab>('rooms');
  const [finish, setFinish] = useState<InteriorFinish>(unit?.defaultFinish || 'marble');
  const [wallColorId, setWallColorId] = useState<string>('pure_white');
  const [enabledFurniture, setEnabledFurniture] = useState<Record<FurnitureId, boolean>>({
    dining: true,
    tv_fireplace: true,
    desk: false,
    reading_corner: true,
    plants: true,
  });
  const [warmLighting, setWarmLighting] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [playerRadar, setPlayerRadar] = useState({ x: 28, y: 65 });
  const [webglError, setWebglError] = useState(false);

  const controlsApiRef = useRef<{
    goToWaypoint: (wp: WaypointConfig) => void;
    setFinish: (f: InteriorFinish) => void;
    setWallColor: (hex: string, accentHex: string) => void;
    setFurnitureVisible: (id: FurnitureId, visible: boolean) => void;
    setMood: (warm: boolean) => void;
    nudgeMove: (forward: number, strafe: number) => void;
  } | null>(null);

  useEffect(() => {
    if (unit) {
      setFinish(unit.defaultFinish);
      setActiveRoom('living');
      setWallColorId('pure_white');
      setEnabledFurniture({
        dining: true,
        tv_fireplace: true,
        desk: unit.modelVariant === 'apartment' || unit.modelVariant === 'duplex',
        reading_corner: true,
        plants: true,
      });
    }
  }, [unit]);

  useEffect(() => {
    if (!unit) return;
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
      setWebglError(true);
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

    const onContextLost = (e: Event) => e.preventDefault();
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const scene = new THREE.Scene();
    const isVilla = unit.modelVariant === 'villa';
    const isPenthouse = unit.modelVariant === 'penthouse';
    const isDuplex = unit.modelVariant === 'duplex';

    const skyColorHex = isVilla ? 0xe6f2ec : 0xeef4fb;
    scene.background = new THREE.Color(skyColorHex);
    scene.fog = new THREE.Fog(skyColorHex, 22, 70);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 95);
    const startWp = WAYPOINTS[0];
    camera.position.set(...startWp.pos);

    // Three-point + Interior lighting
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0xd6d3d1, 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    sunLight.position.set(10, 16, 15);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.left = -11;
    sunLight.shadow.camera.right = 11;
    sunLight.shadow.camera.top = 11;
    sunLight.shadow.camera.bottom = -11;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const interiorLamp1 = new THREE.PointLight(0xffedd5, 1.25, 14);
    interiorLamp1.position.set(-2.8, 2.9, 0.4);
    scene.add(interiorLamp1);

    const interiorLamp2 = new THREE.PointLight(0xffedd5, 1.15, 14);
    interiorLamp2.position.set(3.2, 2.8, -2.5);
    scene.add(interiorLamp2);

    // Procedural Textures
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const marbleTex = createMarbleTexture(maxAniso);
    const oakTex = createOakParquetTexture(maxAniso);
    const slateTex = createSlateTileTexture(maxAniso);
    const rugTex = createWovenRugTexture(maxAniso);

    const floorMat = new THREE.MeshStandardMaterial({
      map: unit.defaultFinish === 'oak' ? oakTex : unit.defaultFinish === 'slate' ? slateTex : marbleTex,
      roughness: unit.defaultFinish === 'marble' ? 0.22 : 0.56,
      metalness: 0.05,
    });

    const ceilingHeight = isDuplex ? 4.4 : isPenthouse ? 4.0 : 3.4;

    // Main apartment floor (14m x 10m)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 10), floorMat);
    floor.position.set(0, -0.1, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Exterior Terrace / Garden Deck
    const terraceWidth = isVilla ? 16 : 14;
    const terraceDepth = isVilla ? 5.2 : 3.4;
    const terraceDeck = new THREE.Mesh(
      new THREE.BoxGeometry(terraceWidth, 0.18, terraceDepth),
      new THREE.MeshStandardMaterial({
        color: isVilla ? 0xebdfd0 : 0xe2e8f0,
        roughness: 0.78,
      })
    );
    terraceDeck.position.set(0, -0.11, 5 + terraceDepth / 2);
    terraceDeck.receiveShadow = true;
    scene.add(terraceDeck);

    // Shared Realistic PBR Materials
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf9f6, roughness: 0.86 });
    const accentWallMat = new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 0.78 });
    const walnutMat = new THREE.MeshStandardMaterial({ color: 0x7c583a, roughness: 0.52 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.32, metalness: 0.75 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc8a253, roughness: 0.22, metalness: 0.9 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.16, metalness: 0.95 });
    const fabricLightMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.92 });
    const fabricAccentMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.88 });
    const fabricWarmMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      roughness: 0.05,
      metalness: 0.06,
      transmission: isSoftwareGl ? 0 : 0.78,
      transparent: true,
      opacity: isSoftwareGl ? 0.34 : 0.86,
      depthWrite: false,
    });

    // Architectural Walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(14.2, ceilingHeight, 0.22), wallMat);
    backWall.position.set(0, ceilingHeight / 2, -5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.22, ceilingHeight, 10.2), wallMat);
    leftWall.position.set(-7, ceilingHeight / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.22, ceilingHeight, 10.2), wallMat);
    rightWall.position.set(7, ceilingHeight / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Bedroom Partition Wall
    const partitionLeft = new THREE.Mesh(new THREE.BoxGeometry(3.8, ceilingHeight, 0.18), accentWallMat);
    partitionLeft.position.set(1.9, ceilingHeight / 2, -0.6);
    partitionLeft.castShadow = true;
    partitionLeft.receiveShadow = true;
    scene.add(partitionLeft);

    const partitionRight = new THREE.Mesh(new THREE.BoxGeometry(1.6, ceilingHeight, 0.18), accentWallMat);
    partitionRight.position.set(6.2, ceilingHeight / 2, -0.6);
    partitionRight.castShadow = true;
    scene.add(partitionRight);

    // Ceiling (with Skylight cutout feel for Penthouse!)
    if (isPenthouse) {
      const ceilingLeft = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 10.2), wallMat);
      ceilingLeft.position.set(-4.8, ceilingHeight + 0.05, 0);
      scene.add(ceilingLeft);
      const ceilingRight = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.2, 10.2), wallMat);
      ceilingRight.position.set(4.3, ceilingHeight + 0.05, 0);
      scene.add(ceilingRight);
      const skylightGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 10.0), glassMat);
      skylightGlass.position.set(-0.5, ceilingHeight + 0.08, 0);
      scene.add(skylightGlass);
    } else {
      const ceiling = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.2, 10.2), wallMat);
      ceiling.position.set(0, ceilingHeight + 0.05, 0);
      scene.add(ceiling);
    }

    // Front Glazing Curtain Wall + Sliding Opening
    const mullionPositions = [-4.2, -1.6, 1.4, 3.8];
    mullionPositions.forEach((mx) => {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.1, ceilingHeight, 0.14), darkMetalMat);
      mullion.position.set(mx, ceilingHeight / 2, 4.9);
      scene.add(mullion);
    });
    const frontGlassLeft = new THREE.Mesh(new THREE.BoxGeometry(5.4, ceilingHeight - 0.1, 0.04), glassMat);
    frontGlassLeft.position.set(-4.2, ceilingHeight / 2, 4.9);
    scene.add(frontGlassLeft);
    const frontGlassRight = new THREE.Mesh(new THREE.BoxGeometry(4.8, ceilingHeight - 0.1, 0.04), glassMat);
    frontGlassRight.position.set(4.5, ceilingHeight / 2, 4.9);
    scene.add(frontGlassRight);

    // --- HOUSE-SPECIFIC ARCHITECTURAL FEATURES ---
    if (isDuplex) {
      // Sculptural floating oak staircase + mezzanine upper gallery
      const stairGroup = new THREE.Group();
      stairGroup.position.set(-0.3, 0, -4.3);
      for (let s = 0; s < 10; s++) {
        const tread = new THREE.Mesh(createRoundedBoxGeometry(1.15, 0.07, 0.34, 0.015), walnutMat);
        tread.position.set(s * 0.34 - 1.5, 0.24 + s * 0.24, 0.45);
        tread.castShadow = true;
        stairGroup.add(tread);
      }
      const mezzanineSlab = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 3.2), accentWallMat);
      mezzanineSlab.position.set(1.8, 2.75, 0.6);
      mezzanineSlab.castShadow = true;
      stairGroup.add(mezzanineSlab);

      const mezzGlass = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.9, 0.05), glassMat);
      mezzGlass.position.set(1.8, 3.28, 2.15);
      stairGroup.add(mezzGlass);
      scene.add(stairGroup);
    }

    if (isVilla) {
      // Lush Courtyard Garden, Pool & Olive Tree outside sliding doors
      const gardenLawn = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.08, 6),
        new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.92 })
      );
      gardenLawn.position.set(-3.5, -0.08, 10.6);
      gardenLawn.receiveShadow = true;
      scene.add(gardenLawn);

      const villaPool = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 0.12, 2.6),
        new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.08, clearcoat: 1 })
      );
      villaPool.position.set(3.2, -0.02, 8.2);
      scene.add(villaPool);

      // Pergola beams over patio
      [-5.5, -2.5, 0.5].forEach((px) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.0, 0.16), walnutMat);
        post.position.set(px, 1.5, 9.6);
        scene.add(post);
      });
      const pergolaBeam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.14, 0.22), walnutMat);
      pergolaBeam.position.set(-2.5, 3.05, 9.6);
      scene.add(pergolaBeam);

      // Courtyard Olive Tree
      const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.8, 10), walnutMat);
      treeTrunk.position.set(-5.2, 0.9, 8.4);
      scene.add(treeTrunk);
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.84 });
      [
        [0, 1.9, 0, 0.95],
        [-0.55, 1.65, 0.35, 0.65],
        [0.55, 1.7, -0.25, 0.7],
      ].forEach(([cx, cy, cz, r]) => {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), canopyMat);
        leaf.position.set(-5.2 + cx, cy, 8.4 + cz);
        leaf.castShadow = true;
        scene.add(leaf);
      });
    } else {
      // Sky Balcony / Infinity Edge Balustrade
      const balustrade = new THREE.Mesh(new THREE.BoxGeometry(14, 1.05, 0.05), glassMat);
      balustrade.position.set(0, 0.52, 8.35);
      scene.add(balustrade);
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(14, 0.06, 0.1), brassMat);
      handrail.position.set(0, 1.06, 8.35);
      scene.add(handrail);

      if (isPenthouse) {
        const skyPool = new THREE.Mesh(
          new THREE.BoxGeometry(5.2, 0.16, 2.2),
          new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, roughness: 0.08, clearcoat: 1 })
        );
        skyPool.position.set(3.8, 0.02, 7.0);
        scene.add(skyPool);
      }

      // Distant city horizon buildings
      const skylineMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.82 });
      [-16, -9, -3, 5, 12, 19].forEach((bx, i) => {
        const h = 9 + ((i * 5) % 12);
        const bldg = new THREE.Mesh(new THREE.BoxGeometry(3.6, h, 3.6), skylineMat);
        bldg.position.set(bx, h / 2 - 8, 22 + (i % 3) * 4);
        scene.add(bldg);
      });
    }

    // --- BASE REALISTIC LIVING ROOM (Beveled Extruded Sofa + Lathe Table/Vase) ---
    const livingGroup = new THREE.Group();
    livingGroup.position.set(-3.4, 0, -0.2);
    scene.add(livingGroup);

    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.025, 3.6),
      new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.96 })
    );
    rug.position.set(0, 0.015, 0.3);
    rug.receiveShadow = true;
    livingGroup.add(rug);

    // Sculpted Beveled L-Sofa
    const sofaBase = new THREE.Mesh(createRoundedBoxGeometry(3.5, 0.24, 1.06, 0.04), walnutMat);
    sofaBase.position.set(0, 0.16, -1.05);
    sofaBase.castShadow = true;
    livingGroup.add(sofaBase);

    [-1.05, 0, 1.05].forEach((cx) => {
      const seatCushion = new THREE.Mesh(createRoundedBoxGeometry(1.02, 0.22, 0.94, 0.05), fabricLightMat);
      seatCushion.position.set(cx, 0.38, -1.0);
      seatCushion.castShadow = true;
      livingGroup.add(seatCushion);

      const backCushion = new THREE.Mesh(createRoundedBoxGeometry(0.98, 0.48, 0.24, 0.05), fabricLightMat);
      backCushion.position.set(cx, 0.68, -1.38);
      backCushion.rotation.x = -0.14;
      backCushion.castShadow = true;
      livingGroup.add(backCushion);
    });

    const armLeft = new THREE.Mesh(createRoundedBoxGeometry(0.24, 0.56, 1.05, 0.05), fabricLightMat);
    armLeft.position.set(-1.66, 0.46, -1.02);
    livingGroup.add(armLeft);

    const armRight = armLeft.clone();
    armRight.position.set(1.66, 0.46, -1.02);
    livingGroup.add(armRight);

    const chaiseCushion = new THREE.Mesh(createRoundedBoxGeometry(1.04, 0.24, 1.75, 0.05), fabricLightMat);
    chaiseCushion.position.set(-1.1, 0.36, -0.12);
    chaiseCushion.castShadow = true;
    livingGroup.add(chaiseCushion);

    // Accent Throw Pillows
    [-1.0, 0.95].forEach((px, idx) => {
      const pillow = new THREE.Mesh(
        createRoundedBoxGeometry(0.42, 0.36, 0.15, 0.04),
        idx === 0 ? fabricAccentMat : fabricWarmMat
      );
      pillow.position.set(px, 0.64, -1.16);
      pillow.rotation.x = -0.22;
      pillow.rotation.z = idx === 0 ? 0.12 : -0.1;
      livingGroup.add(pillow);
    });

    // Sculpted Marble Coffee Table + Lathe Ceramic Vase
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.76, 0.07, 32),
      new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.18 })
    );
    tableTop.position.set(0.35, 0.42, 0.45);
    tableTop.castShadow = true;
    livingGroup.add(tableTop);

    const tablePedestal = new THREE.Mesh(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.42, 0),
          new THREE.Vector2(0.24, 0.12),
          new THREE.Vector2(0.18, 0.28),
          new THREE.Vector2(0.34, 0.38),
        ],
        24
      ),
      walnutMat
    );
    tablePedestal.position.set(0.35, 0.01, 0.45);
    livingGroup.add(tablePedestal);

    const ceramicVase = new THREE.Mesh(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.08, 0),
          new THREE.Vector2(0.15, 0.12),
          new THREE.Vector2(0.11, 0.24),
          new THREE.Vector2(0.06, 0.32),
          new THREE.Vector2(0.08, 0.35),
        ],
        20
      ),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2 })
    );
    ceramicVase.position.set(0.38, 0.46, 0.42);
    livingGroup.add(ceramicVase);

    // Chandelier Pendant
    const pendantStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8), brassMat);
    pendantStem.position.set(0, ceilingHeight - 0.45, 0.2);
    livingGroup.add(pendantStem);

    const pendantRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.58, 0.032, 12, 36),
      new THREE.MeshStandardMaterial({ color: 0xfff7ed, emissive: 0xffedd5, emissiveIntensity: 0.9 })
    );
    pendantRing.rotation.x = Math.PI / 2;
    pendantRing.position.set(0, ceilingHeight - 0.9, 0.2);
    livingGroup.add(pendantRing);

    // --- BASE REALISTIC KITCHEN (Island, Faucet Tube, Appliances) ---
    const kitchenGroup = new THREE.Group();
    kitchenGroup.position.set(3.4, 0, 1.8);
    scene.add(kitchenGroup);

    const islandBody = new THREE.Mesh(
      createRoundedBoxGeometry(2.6, 0.9, 1.05, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.32 })
    );
    islandBody.position.set(0, 0.45, 0);
    islandBody.castShadow = true;
    kitchenGroup.add(islandBody);

    const islandCounter = new THREE.Mesh(
      createRoundedBoxGeometry(2.72, 0.07, 1.15, 0.02),
      new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.18 })
    );
    islandCounter.position.set(0, 0.93, 0);
    kitchenGroup.add(islandCounter);

    // Chrome Gooseneck Faucet (TubeGeometry) + Sink Basin
    const sinkBasin = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.45), darkMetalMat);
    sinkBasin.position.set(-0.5, 0.96, 0);
    kitchenGroup.add(sinkBasin);

    const faucetCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5, 0.96, -0.18),
      new THREE.Vector3(-0.5, 1.24, -0.18),
      new THREE.Vector3(-0.5, 1.32, -0.06),
      new THREE.Vector3(-0.5, 1.2, 0.02),
    ]);
    const faucetMesh = new THREE.Mesh(new THREE.TubeGeometry(faucetCurve, 16, 0.018, 8, false), chromeMat);
    kitchenGroup.add(faucetMesh);

    // Bar Stools with curved backrests
    [-0.75, 0, 0.75].forEach((sx) => {
      const seat = new THREE.Mesh(createRoundedBoxGeometry(0.38, 0.07, 0.38, 0.03), walnutMat);
      seat.position.set(sx, 0.68, 0.85);
      kitchenGroup.add(seat);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.66, 10), brassMat);
      leg.position.set(sx, 0.33, 0.85);
      kitchenGroup.add(leg);
    });

    // Cabinets + Built-in Stainless Refrigerator
    const cabinets = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 2.55, 2.7),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 })
    );
    cabinets.position.set(3.15, 1.28, -0.6);
    cabinets.castShadow = true;
    kitchenGroup.add(cabinets);

    const fridge = new THREE.Mesh(createRoundedBoxGeometry(0.74, 2.15, 0.95, 0.03), chromeMat);
    fridge.position.set(3.14, 1.08, 1.3);
    fridge.castShadow = true;
    kitchenGroup.add(fridge);

    // --- BASE MASTER BEDROOM SUITE ---
    const bedGroup = new THREE.Group();
    bedGroup.position.set(3.4, 0, -3.1);
    scene.add(bedGroup);

    const bedFrame = new THREE.Mesh(createRoundedBoxGeometry(2.25, 0.3, 2.32, 0.04), walnutMat);
    bedFrame.position.set(0, 0.16, -0.5);
    bedFrame.castShadow = true;
    bedGroup.add(bedFrame);

    const mattress = new THREE.Mesh(createRoundedBoxGeometry(2.08, 0.28, 2.16, 0.06), fabricLightMat);
    mattress.position.set(0, 0.44, -0.48);
    mattress.castShadow = true;
    bedGroup.add(mattress);

    // Channeled Tufted Headboard Panels
    for (let h = -2; h <= 2; h++) {
      const panel = new THREE.Mesh(createRoundedBoxGeometry(0.46, 1.25, 0.14, 0.04), fabricAccentMat);
      panel.position.set(h * 0.48, 0.74, -1.65);
      panel.castShadow = true;
      bedGroup.add(panel);
    }

    [-0.52, 0.52].forEach((px) => {
      const bedPillow = new THREE.Mesh(createRoundedBoxGeometry(0.76, 0.18, 0.42, 0.05), fabricLightMat);
      bedPillow.position.set(px, 0.66, -1.28);
      bedGroup.add(bedPillow);
    });

    // Nightstands + Lathe Bedside Lamps
    [-1.55, 1.55].forEach((nx) => {
      const stand = new THREE.Mesh(createRoundedBoxGeometry(0.54, 0.5, 0.48, 0.03), walnutMat);
      stand.position.set(nx, 0.25, -1.45);
      bedGroup.add(stand);

      const lampShade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.18, 0.24, 18),
        new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfde68a, emissiveIntensity: 0.75 })
      );
      lampShade.position.set(nx, 0.72, -1.45);
      bedGroup.add(lampShade);
    });

    // --- TOGGLEABLE EXTRA REALISTIC FURNITURE GROUPS ---
    const furnitureGroups: Record<FurnitureId, THREE.Group> = {
      dining: new THREE.Group(),
      tv_fireplace: new THREE.Group(),
      desk: new THREE.Group(),
      reading_corner: new THREE.Group(),
      plants: new THREE.Group(),
    };

    // 1. Dining Set (Table + 4 Curved Chairs)
    const diningGrp = furnitureGroups.dining;
    diningGrp.position.set(0.4, 0, 2.2);
    const dTop = new THREE.Mesh(createRoundedBoxGeometry(1.75, 0.07, 1.05, 0.04), walnutMat);
    dTop.position.set(0, 0.76, 0);
    dTop.castShadow = true;
    diningGrp.add(dTop);
    [
      [-0.7, -0.38],
      [0.7, -0.38],
      [-0.7, 0.38],
      [0.7, 0.38],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.74, 10), darkMetalMat);
      leg.position.set(lx, 0.37, lz);
      diningGrp.add(leg);
    });
    [
      [-0.45, -0.68, 0],
      [0.45, -0.68, 0],
      [-0.45, 0.68, Math.PI],
      [0.45, 0.68, Math.PI],
    ].forEach(([cx, cz, rotY]) => {
      const chair = new THREE.Group();
      chair.position.set(cx, 0, cz);
      chair.rotation.y = rotY;
      const cSeat = new THREE.Mesh(createRoundedBoxGeometry(0.44, 0.07, 0.44, 0.03), fabricWarmMat);
      cSeat.position.y = 0.46;
      chair.add(cSeat);
      const cBack = new THREE.Mesh(createRoundedBoxGeometry(0.44, 0.38, 0.06, 0.03), fabricWarmMat);
      cBack.position.set(0, 0.68, -0.19);
      chair.add(cBack);
      const cLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 8), darkMetalMat);
      cLegs.position.y = 0.22;
      chair.add(cLegs);
      diningGrp.add(chair);
    });
    scene.add(diningGrp);

    // 2. Wall TV & Architectural Fireplace Console (on Left Wall of Living Room)
    const tvGrp = furnitureGroups.tv_fireplace;
    tvGrp.position.set(-6.6, 0, -0.2);
    const mediaConsole = new THREE.Mesh(createRoundedBoxGeometry(0.58, 0.5, 3.1, 0.03), walnutMat);
    mediaConsole.position.set(0.15, 0.25, 0);
    mediaConsole.castShadow = true;
    tvGrp.add(mediaConsole);

    const fireplaceGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.24, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xfb923c, emissiveIntensity: 1.4 })
    );
    fireplaceGlow.position.set(0.42, 0.34, 0);
    tvGrp.add(fireplaceGlow);

    const tvBezel = new THREE.Mesh(createRoundedBoxGeometry(0.06, 1.15, 2.05, 0.02), darkMetalMat);
    tvBezel.position.set(0.02, 1.55, 0);
    tvGrp.add(tvBezel);
    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 1.05, 1.95),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12, metalness: 0.4 })
    );
    tvScreen.position.set(0.03, 1.55, 0);
    tvGrp.add(tvScreen);
    scene.add(tvGrp);

    // 3. Home Office Desk + Ergonomic Chair
    const deskGrp = furnitureGroups.desk;
    deskGrp.position.set(-1.6, 0, -4.1);
    const deskTop = new THREE.Mesh(createRoundedBoxGeometry(1.55, 0.06, 0.74, 0.03), walnutMat);
    deskTop.position.set(0, 0.75, 0);
    deskTop.castShadow = true;
    deskGrp.add(deskTop);
    [-0.68, 0.68].forEach((dx) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.74, 0.64), darkMetalMat);
      frame.position.set(dx, 0.37, 0);
      deskGrp.add(frame);
    });
    const monitor = new THREE.Mesh(createRoundedBoxGeometry(0.75, 0.44, 0.04, 0.015), darkMetalMat);
    monitor.position.set(0, 1.1, -0.18);
    deskGrp.add(monitor);
    const officeSeat = new THREE.Mesh(createRoundedBoxGeometry(0.52, 0.08, 0.5, 0.03), fabricAccentMat);
    officeSeat.position.set(0, 0.48, 0.62);
    deskGrp.add(officeSeat);
    const officeBack = new THREE.Mesh(createRoundedBoxGeometry(0.48, 0.52, 0.07, 0.03), fabricAccentMat);
    officeBack.position.set(0, 0.78, 0.84);
    deskGrp.add(officeBack);
    scene.add(deskGrp);

    // 4. Reading Corner (Lounge Chair + Arc Floor Lamp)
    const readGrp = furnitureGroups.reading_corner;
    readGrp.position.set(-5.6, 0, 3.0);
    const loungeChair = new THREE.Mesh(createRoundedBoxGeometry(0.92, 0.38, 0.92, 0.08), fabricWarmMat);
    loungeChair.position.set(0, 0.34, 0);
    loungeChair.rotation.y = 0.6;
    loungeChair.castShadow = true;
    readGrp.add(loungeChair);
    const loungeBack = new THREE.Mesh(createRoundedBoxGeometry(0.88, 0.52, 0.2, 0.06), fabricWarmMat);
    loungeBack.position.set(-0.22, 0.66, 0.25);
    loungeBack.rotation.y = 0.6;
    readGrp.add(loungeBack);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.05, 20), brassMat);
    lampBase.position.set(-0.65, 0.025, -0.65);
    readGrp.add(lampBase);
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.95, 10), brassMat);
    lampPole.position.set(-0.65, 1.0, -0.65);
    readGrp.add(lampPole);
    const floorShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.26, 0.3, 20),
      new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfef3c7, emissiveIntensity: 0.7 })
    );
    floorShade.position.set(-0.65, 2.0, -0.65);
    readGrp.add(floorShade);
    scene.add(readGrp);

    // 5. Indoor Lush Potted Plants
    const plantGrp = furnitureGroups.plants;
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.72 });
    [
      [-6.2, -3.9],
      [6.1, 4.1],
      [0.9, -4.1],
    ].forEach(([px, pz]) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.44, 18), potMat);
      pot.position.set(px, 0.22, pz);
      pot.castShadow = true;
      plantGrp.add(pot);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.9, 8), walnutMat);
      stem.position.set(px, 0.85, pz);
      plantGrp.add(stem);

      [
        [0, 1.35, 0, 0.3],
        [0.18, 1.18, 0.12, 0.22],
        [-0.16, 1.22, -0.1, 0.24],
      ].forEach(([lx, ly, lz, r]) => {
        const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), leafMat);
        crown.position.set(px + lx, ly, pz + lz);
        crown.castShadow = true;
        plantGrp.add(crown);
      });
    });
    scene.add(plantGrp);

    // Sync initial furniture visibility
    (Object.keys(furnitureGroups) as FurnitureId[]).forEach((fid) => {
      furnitureGroups[fid].visible = enabledFurniture[fid];
    });

    // --- Walk & Look Navigation State ---
    let targetPos = new THREE.Vector3(...startWp.pos);
    let currentPos = new THREE.Vector3(...startWp.pos);
    let targetYaw = startWp.yaw;
    let currentYaw = startWp.yaw;
    let targetPitch = startWp.pitch;
    let currentPitch = startWp.pitch;
    let isGuiding = false;

    const keysDown: Record<string, boolean> = {};
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const clampInteriorBounds = (v: THREE.Vector3) => {
      v.x = THREE.MathUtils.clamp(v.x, -6.1, 6.1);
      v.z = THREE.MathUtils.clamp(v.z, -4.2, isVilla ? 9.0 : 7.5);
      v.y = 1.65;
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      isGuiding = false;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };
      targetYaw -= dx * 0.0045;
      targetPitch = THREE.MathUtils.clamp(targetPitch - dy * 0.0035, -0.7, 0.65);
      requestRender();
    };
    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        keysDown[e.code] = true;
        isGuiding = false;
        requestRender();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown[e.code] = false;
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let frameId = 0;
    let disposed = false;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();
    let lastRadarSync = 0;

    const lookEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    const forwardVec = new THREE.Vector3();
    const rightVec = new THREE.Vector3();

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

        const moveSpeed = 4.2 * dt;
        forwardVec.set(-Math.sin(currentYaw), 0, -Math.cos(currentYaw)).normalize();
        rightVec.set(Math.cos(currentYaw), 0, -Math.sin(currentYaw)).normalize();

        let moving = false;
        if (keysDown['KeyW'] || keysDown['ArrowUp']) {
          targetPos.addScaledVector(forwardVec, moveSpeed);
          moving = true;
        }
        if (keysDown['KeyS'] || keysDown['ArrowDown']) {
          targetPos.addScaledVector(forwardVec, -moveSpeed);
          moving = true;
        }
        if (keysDown['KeyD'] || keysDown['ArrowRight']) {
          targetPos.addScaledVector(rightVec, moveSpeed);
          moving = true;
        }
        if (keysDown['KeyA'] || keysDown['ArrowLeft']) {
          targetPos.addScaledVector(rightVec, -moveSpeed);
          moving = true;
        }
        clampInteriorBounds(targetPos);

        const dampSpeed = isGuiding ? 4.8 : 9.0;
        currentPos.x = THREE.MathUtils.damp(currentPos.x, targetPos.x, dampSpeed, dt);
        currentPos.z = THREE.MathUtils.damp(currentPos.z, targetPos.z, dampSpeed, dt);
        currentYaw = THREE.MathUtils.damp(currentYaw, targetYaw, dampSpeed, dt);
        currentPitch = THREE.MathUtils.damp(currentPitch, targetPitch, dampSpeed, dt);

        camera.position.copy(currentPos);
        lookEuler.set(currentPitch, currentYaw, 0, 'YXZ');
        camera.quaternion.setFromEuler(lookEuler);

        const stillSettling =
          moving ||
          currentPos.distanceTo(targetPos) > 0.02 ||
          Math.abs(currentYaw - targetYaw) > 0.005 ||
          Math.abs(currentPitch - targetPitch) > 0.005;

        if (stillSettling) renderDirty = true;
        else isGuiding = false;

        if (now - lastRadarSync > 120) {
          lastRadarSync = now;
          const rx = ((currentPos.x + 7) / 14) * 100;
          const ry = ((currentPos.z + 5) / 14.5) * 100;
          setPlayerRadar({
            x: THREE.MathUtils.clamp(rx, 8, 92),
            y: THREE.MathUtils.clamp(ry, 8, 92),
          });
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty && !disposed) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

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

    controlsApiRef.current = {
      goToWaypoint: (wp: WaypointConfig) => {
        targetPos.set(...wp.pos);
        targetYaw = wp.yaw;
        targetPitch = wp.pitch;
        isGuiding = true;
        lastTime = performance.now();
        requestRender();
      },
      setFinish: (f: InteriorFinish) => {
        if (f === 'marble') {
          floorMat.map = marbleTex;
          floorMat.roughness = 0.22;
        } else if (f === 'oak') {
          floorMat.map = oakTex;
          floorMat.roughness = 0.56;
        } else {
          floorMat.map = slateTex;
          floorMat.roughness = 0.48;
        }
        floorMat.needsUpdate = true;
        requestRender();
      },
      setWallColor: (hex: string, accentHex: string) => {
        wallMat.color.set(hex);
        accentWallMat.color.set(accentHex);
        requestRender();
      },
      setFurnitureVisible: (id: FurnitureId, visible: boolean) => {
        if (furnitureGroups[id]) {
          furnitureGroups[id].visible = visible;
          requestRender();
        }
      },
      setMood: (warm: boolean) => {
        if (warm) {
          scene.background = new THREE.Color(0xfef3c7);
          scene.fog = new THREE.Fog(0xfef3c7, 20, 65);
          sunLight.color.setHex(0xfdba74);
          sunLight.intensity = 1.25;
          interiorLamp1.intensity = 2.4;
          interiorLamp2.intensity = 2.2;
        } else {
          scene.background = new THREE.Color(skyColorHex);
          scene.fog = new THREE.Fog(skyColorHex, 22, 70);
          sunLight.color.setHex(0xfffbeb);
          sunLight.intensity = 1.8;
          interiorLamp1.intensity = 1.25;
          interiorLamp2.intensity = 1.15;
        }
        requestRender();
      },
      nudgeMove: (forward: number, strafe: number) => {
        isGuiding = false;
        const fwd = new THREE.Vector3(-Math.sin(currentYaw), 0, -Math.cos(currentYaw)).normalize();
        const right = new THREE.Vector3(Math.cos(currentYaw), 0, -Math.sin(currentYaw)).normalize();
        targetPos.addScaledVector(fwd, forward);
        targetPos.addScaledVector(right, strafe);
        clampInteriorBounds(targetPos);
        lastTime = performance.now();
        requestRender();
      },
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
      envTex.dispose();
      marbleTex.dispose();
      oakTex.dispose();
      slateTex.dispose();
      rugTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [unit]);

  if (!unit) return null;

  const handleRoomSelect = (wp: WaypointConfig) => {
    setActiveRoom(wp.id);
    controlsApiRef.current?.goToWaypoint(wp);
  };

  const handleFinishChange = (f: InteriorFinish) => {
    setFinish(f);
    controlsApiRef.current?.setFinish(f);
  };

  const handleWallColorSelect = (paletteItem: (typeof WALL_PALETTE)[number]) => {
    setWallColorId(paletteItem.id);
    controlsApiRef.current?.setWallColor(paletteItem.hex, paletteItem.accentHex);
  };

  const handleToggleFurniture = (fid: FurnitureId) => {
    const nextVal = !enabledFurniture[fid];
    setEnabledFurniture((prev) => ({ ...prev, [fid]: nextVal }));
    controlsApiRef.current?.setFurnitureVisible(fid, nextVal);
  };

  const handleMoodToggle = (warm: boolean) => {
    setWarmLighting(warm);
    controlsApiRef.current?.setMood(warm);
  };

  const variantBadge =
    unit.modelVariant === 'penthouse'
      ? 'تصميم بنتهاوس بسقف زجاجي ومسبح'
      : unit.modelVariant === 'villa'
        ? 'تصميم فيلا بحديقة ومسبح خاص'
        : unit.modelVariant === 'duplex'
          ? 'تصميم دوبلكس بسلم وميزانين علوي'
          : 'تصميم شقة حديثة بإطلالة مدينة';

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`جولة افتراضية داخل ${unit.title}`}
    >
      {/* Top Tour Header */}
      <div className="h-16 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:-translate-y-0.5 rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
          >
            <X className="w-4 h-4" />
            <span>إغلاق الجولة</span>
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {unit.title}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {unit.city} · {unit.district} · {variantBadge} · {formatCurrency(unit.price)} ج.م
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {unit.status === 'متاح' ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookUnit(unit);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              <span>شراء / حجز إلكتروني</span>
            </button>
          ) : (
            <span className="text-xs font-semibold text-amber-700 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md whitespace-nowrap">
              الحالة: {unit.status}
            </span>
          )}
        </div>
      </div>

      {/* Main 3D Interior Viewport */}
      <div className="relative flex-1 bg-slate-100 overflow-hidden select-none">
        {webglError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <img
              src={unit.image}
              alt={unit.title}
              referrerPolicy="no-referrer"
              className="w-full max-w-lg h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-slate-700">تعذر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز.</p>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        )}

        {/* Compact 2D Floorplan Radar Minimap (Top-Left) */}
        <div className="hidden sm:block absolute top-4 left-4 z-10 w-36 bg-white/95 border border-slate-200 rounded-lg p-2.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>مخطط الوحدة</span>
            <span className="font-mono-nums text-[10px] text-slate-400">{unit.areaSqm}m²</span>
          </div>
          <div className="relative w-full h-24 bg-slate-50 border border-slate-200 rounded overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-5 border-t border-dashed border-slate-300 bg-blue-50/40" />
            <div className="absolute right-0 top-0 w-1/2 h-11 border-b border-l border-slate-300" />
            <span className="absolute top-1 right-1.5 text-[9px] text-slate-400">النوم</span>
            <span className="absolute top-1 left-1.5 text-[9px] text-slate-400">الصالة</span>
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400">
              {unit.modelVariant === 'villa' ? 'الحديقة' : 'التراس'}
            </span>
            <div
              className="absolute w-3 h-3 -ml-1.5 -mt-1.5 bg-blue-700 rounded-full border-2 border-white shadow"
              style={{ left: `${playerRadar.x}%`, top: `${playerRadar.y}%` }}
            />
          </div>
        </div>

        {/* Accessible On-Screen Walk Pad (Top-Right) */}
        <div className="absolute top-4 right-4 z-10 bg-white/95 border border-slate-200 rounded-lg p-2 shadow-sm flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-slate-500 mb-0.5">تحرك داخل البيت</span>
          <button
            type="button"
            onClick={() => controlsApiRef.current?.nudgeMove(1.2, 0)}
            className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            aria-label="تقدم للأمام"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => controlsApiRef.current?.nudgeMove(0, 1.0)}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              aria-label="تحرك لليمين"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => controlsApiRef.current?.nudgeMove(-1.2, 0)}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              aria-label="تراجع للخلف"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => controlsApiRef.current?.nudgeMove(0, -1.0)}
              className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              aria-label="تحرك لليسار"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Tabbed Bottom Control Dock */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(920px,95%)] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setControlsCollapsed((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-b-0 border-slate-200 rounded-t-md hover:bg-slate-50 cursor-pointer"
          >
            {controlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>إظهار أدوات التخصيص والتجول</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>إخفاء الأدوات</span>
              </>
            )}
          </button>

          {!controlsCollapsed && (
            <div className="w-full bg-white/95 border border-slate-200 rounded-lg p-3 shadow-sm space-y-2.5">
              {/* Dock Category Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setActiveTab('rooms')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                      activeTab === 'rooms' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    الغرف والإضاءة
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('colors')}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                      activeTab === 'colors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>ألوان الحوائط والأرضيات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('furniture')}
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                      activeTab === 'furniture'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    <Sofa className="w-3.5 h-3.5" />
                    <span>إضافة وتخصيص الأثاث</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  اسحب للنظر 360° · مفاتيح WASD للمشي
                </span>
              </div>

              {/* Tab 1: Rooms & Lighting */}
              {activeTab === 'rooms' && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-md">
                    {WAYPOINTS.map((wp) => (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() => handleRoomSelect(wp)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer whitespace-nowrap ${
                          activeRoom === wp.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {wp.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                    <button
                      type="button"
                      onClick={() => handleMoodToggle(false)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded cursor-pointer whitespace-nowrap ${
                        !warmLighting ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>نهاري</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoodToggle(true)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded cursor-pointer whitespace-nowrap ${
                        warmLighting ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>مسائي دافئ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Wall Colors & Floor Finishes */}
              {activeTab === 'colors' && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">لون الحوائط:</span>
                    {WALL_PALETTE.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleWallColorSelect(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                          wallColorId === c.id
                            ? 'border-blue-700 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-slate-300 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">الأرضية:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                      {(Object.keys(FINISH_LABELS) as InteriorFinish[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleFinishChange(key)}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer whitespace-nowrap ${
                            finish === key
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {FINISH_LABELS[key]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Add / Remove Furniture */}
              {activeTab === 'furniture' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 ml-1">
                    اختر قطع الأثاث لإضافتها أو إزالتها داخل الغرف:
                  </span>
                  {FURNITURE_CATALOG.map((item) => {
                    const active = enabledFurniture[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleFurniture(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all duration-150 cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Plus
                          className={`w-3.5 h-3.5 transition-transform ${
                            active ? 'rotate-45' : ''
                          }`}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
