import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import {
  createCondensationBumpTexture,
  createDonutDoughTexture,
  createGoldenFryTexture,
  createMarbledCoffeeTexture,
  createOrganicBumpTexture,
  createPaperFiberBumpTexture,
  createStripedStrawTexture,
} from './models/textures';
import {
  createChunkyBlackLidGeometry,
  createChunkyPaperCupGeometry,
  createCoffeeBeanGeometry,
  createCrispyFryGeometry,
  createDrippingIcingGeometry,
  createLiquidCrownGeometry,
  createScoopFryCartonGeometry,
  createSculptedIceCubeGeometry,
  createTaperedSplashGeometry,
  createTeardropDropletGeometry,
  createThickClearCupGeometry,
  createThickDomeLidGeometry,
} from './models/geometries';

/**
 * Soft Studio Environment Map (RoomEnvironment via PMREMGenerator)
 * so the glass cup, ice cubes, and thick glossy liquid have realistic reflections & refraction.
 */
const StudioEnvironment: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const envScene = new RoomEnvironment();
    const envTex = pmrem.fromScene(envScene, 0.035).texture;
    scene.environment = envTex;

    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
};

interface CafeSceneProps {
  onCupHoverChange: (hovered: boolean) => void;
}

const CafeHero3DScene: React.FC<CafeSceneProps> = ({ onCupHoverChange }) => {
  const { camera, gl } = useThree();

  // Static invisible raycast hit proxy (doesn't move when the cup rises, preventing hover jitter)
  const staticHitProxyRef = useRef<THREE.Mesh>(null);

  // Master cluster lift/rotation group + individual item lift groups (controlled 100% by GSAP timeline)
  const clusterLiftRef = useRef<THREE.Group>(null);
  const icedLatteLiftRef = useRef<THREE.Group>(null);
  const paperCupLiftRef = useRef<THREE.Group>(null);
  const donutLiftRef = useRef<THREE.Group>(null);
  const friesLiftRef = useRef<THREE.Group>(null);
  const floatersLiftRef = useRef<THREE.Group>(null);

  // Inner float groups controlled by useFrame for weightless mid-air hovering ("berhenti dan ngambang")
  const icedLatteFloatRef = useRef<THREE.Group>(null);
  const paperCupFloatRef = useRef<THREE.Group>(null);
  const donutFloatRef = useRef<THREE.Group>(null);
  const friesFloatRef = useRef<THREE.Group>(null);
  const floatersFloatRef = useRef<THREE.Group>(null);

  const domeLidRef = useRef<THREE.Group>(null);
  const crownMeshRef = useRef<THREE.Mesh>(null);
  const splashWaveRefs = useRef<(THREE.Mesh | null)[]>([]);
  const dropletRefs = useRef<(THREE.Mesh | null)[]>([]);
  const splashPulseGroupRef = useRef<THREE.Group>(null);
  const externalGlbGroupRef = useRef<THREE.Group>(null);
  const [hasExternalCupGlb, setHasExternalCupGlb] = useState(false);

  // Raycaster & hover state
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointerNDC = useMemo(() => new THREE.Vector2(-99, -99), []);
  const isCupHoveredRef = useRef(false);
  const hoverFloatWeight = useRef(0);
  const hoverFloatPhase = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Base resting pose of the tilted central iced latte cup (lowered so hover lift has ample top headroom)
  const BASE_CLUSTER_Y = -0.54;
  const BASE_CUP_Y = -0.12;
  const BASE_CUP_ROT_X = 0.05;
  const BASE_CUP_ROT_Y = 0;
  const BASE_CUP_ROT_Z = -0.2;

  // Load /cup.glb via Three.js GLTFLoader if present; otherwise use procedural PBR cup
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/cup.glb',
      (gltf) => {
        if (!externalGlbGroupRef.current) return;
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });
        externalGlbGroupRef.current.clear();
        externalGlbGroupRef.current.add(model);
        setHasExternalCupGlb(true);
      },
      undefined,
      () => {
        setHasExternalCupGlb(false);
      }
    );
  }, []);

  // Memoize 3D geometries & procedural PBR textures
  const assets = useMemo(() => {
    const marbledCoffeeTex = createMarbledCoffeeTexture();
    const condensationBumpTex = createCondensationBumpTexture();
    const donutDoughTex = createDonutDoughTexture();
    const fryTex = createGoldenFryTexture();
    const paperFiberBumpTex = createPaperFiberBumpTexture();
    const bumpTex = createOrganicBumpTexture();
    const strawTex = createStripedStrawTexture();

    const clearCupGeo = createThickClearCupGeometry();
    const domeLidGeo = createThickDomeLidGeometry();
    const drippingIcingGeo = createDrippingIcingGeometry(0.42, 0.198);
    const fryCartonGeo = createScoopFryCartonGeometry();
    const coffeeBeanGeo = createCoffeeBeanGeometry();
    const paperCupGeo = createChunkyPaperCupGeometry();
    const blackLidGeo = createChunkyBlackLidGeometry();

    const iceCubeGeo = createSculptedIceCubeGeometry(0.27);
    const iceInnerCoreGeo = new RoundedBoxGeometry(0.14, 0.13, 0.14, 4, 0.035);
    const sugarCubeGeo = new RoundedBoxGeometry(0.22, 0.22, 0.22, 6, 0.045);

    // 360° Sculpted Liquid Rim Crown + Teardrop Droplet Geometry
    const liquidCrownGeo = createLiquidCrownGeometry();
    const teardropGeo = createTeardropDropletGeometry();

    // 8 Multi-Layered Sweeping Fluid Simulation Splash Ribbons & Crown Tendrils
    const splashWaves: Array<{
      geo: THREE.BufferGeometry;
      tone: 'milk' | 'latte' | 'espresso';
    }> = [
      // 1. Hero sweeping right-upward creamy milk ribbon wave
      {
        tone: 'milk',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(0.32, 0.02, 0.14),
            new THREE.Vector3(0.68, 0.28, 0.26),
            new THREE.Vector3(1.06, 0.48, 0.18),
            new THREE.Vector3(1.36, 0.78, 0.02),
            new THREE.Vector3(1.24, 1.08, -0.08),
          ],
          0.175,
          0.056,
          1.85
        ),
      },
      // 2. Intertwined caramel-latte spiral ribbon following the main wave
      {
        tone: 'latte',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(0.24, 0.01, 0.24),
            new THREE.Vector3(0.58, 0.22, 0.34),
            new THREE.Vector3(0.95, 0.42, 0.26),
            new THREE.Vector3(1.18, 0.72, 0.12),
          ],
          0.135,
          0.045,
          1.7
        ),
      },
      // 3. Deep roasted espresso-caramel jet ribbon curling up-right
      {
        tone: 'espresso',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(0.38, 0.02, -0.06),
            new THREE.Vector3(0.76, 0.26, -0.04),
            new THREE.Vector3(1.08, 0.56, 0.04),
            new THREE.Vector3(1.02, 0.88, 0.12),
          ],
          0.115,
          0.04,
          1.6
        ),
      },
      // 4. Sweeping front-left creamy milk arch wave
      {
        tone: 'milk',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(-0.28, 0.02, 0.22),
            new THREE.Vector3(-0.56, 0.26, 0.32),
            new THREE.Vector3(-0.78, 0.54, 0.24),
            new THREE.Vector3(-0.68, 0.82, 0.12),
          ],
          0.15,
          0.048,
          1.75
        ),
      },
      // 5. Left-side café-latte crown tendril
      {
        tone: 'latte',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(-0.42, 0.03, -0.04),
            new THREE.Vector3(-0.74, 0.28, -0.14),
            new THREE.Vector3(-0.96, 0.52, -0.08),
            new THREE.Vector3(-0.88, 0.74, 0.02),
          ],
          0.125,
          0.042,
          1.65
        ),
      },
      // 6. Front center-left rising milk crest
      {
        tone: 'milk',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(-0.12, 0.04, 0.34),
            new THREE.Vector3(0.06, 0.34, 0.44),
            new THREE.Vector3(0.34, 0.62, 0.34),
          ],
          0.13,
          0.044,
          1.7
        ),
      },
      // 7. Back-right swirling latte-cream ribbon
      {
        tone: 'latte',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(0.24, 0.04, -0.28),
            new THREE.Vector3(0.64, 0.32, -0.34),
            new THREE.Vector3(0.98, 0.46, -0.22),
            new THREE.Vector3(1.12, 0.66, -0.12),
          ],
          0.13,
          0.044,
          1.65
        ),
      },
      // 8. Back-left espresso-milk contrast tendril
      {
        tone: 'espresso',
        geo: createTaperedSplashGeometry(
          [
            new THREE.Vector3(-0.22, 0.03, -0.32),
            new THREE.Vector3(-0.52, 0.3, -0.38),
            new THREE.Vector3(-0.72, 0.56, -0.26),
          ],
          0.11,
          0.038,
          1.55
        ),
      },
    ];

    return {
      marbledCoffeeTex,
      condensationBumpTex,
      donutDoughTex,
      fryTex,
      paperFiberBumpTex,
      bumpTex,
      strawTex,
      clearCupGeo,
      domeLidGeo,
      drippingIcingGeo,
      fryCartonGeo,
      coffeeBeanGeo,
      paperCupGeo,
      blackLidGeo,
      iceCubeGeo,
      iceInnerCoreGeo,
      sugarCubeGeo,
      liquidCrownGeo,
      teardropGeo,
      splashWaves,
    };
  }, []);

  // 34 Physical 3D Condensation Water Beads batched into a single InstancedMesh (1 draw call!)
  const condensationMeshRef = useRef<THREE.InstancedMesh>(null);
  const condensationBeads = useMemo(() => {
    const beads: Array<{
      pos: [number, number, number];
      scale: [number, number, number];
    }> = [];
    for (let i = 0; i < 34; i++) {
      const y = -0.68 + (((i * 37) % 100) / 100) * 1.18;
      const t = (y + 0.84) / 1.48;
      const rCup = THREE.MathUtils.lerp(0.422, 0.605, t) + 0.008;
      const theta = (i * 2.39996 + 0.4) % (Math.PI * 2);
      const s = 0.011 + (i % 4) * 0.0045;
      beads.push({
        pos: [Math.cos(theta) * rCup, y, Math.sin(theta) * rCup],
        scale: [s, s * 1.28, s],
      });
    }
    return beads;
  }, []);

  useEffect(() => {
    const mesh = condensationMeshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    condensationBeads.forEach((bead, i) => {
      dummy.position.set(bead.pos[0], bead.pos[1], bead.pos[2]);
      dummy.scale.set(bead.scale[0], bead.scale[1], bead.scale[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [condensationBeads]);

  // 22 Teardrop & Micro Satellite Liquid Droplets oriented along their radial burst vectors
  const satelliteDroplets = useMemo(() => {
    const rawSpecs: Array<{
      target: [number, number, number];
      r: number;
      stretch: number;
      tone: 'milk' | 'latte' | 'espresso';
    }> = [
      // Right main splash crown droplets
      { target: [1.22, 1.24, -0.09], r: 0.056, stretch: 1.35, tone: 'milk' },
      { target: [1.46, 0.96, 0.04], r: 0.044, stretch: 1.3, tone: 'milk' },
      { target: [1.36, 0.64, 0.22], r: 0.036, stretch: 1.25, tone: 'latte' },
      { target: [1.04, 1.02, 0.14], r: 0.038, stretch: 1.28, tone: 'espresso' },
      { target: [1.54, 0.74, -0.08], r: 0.028, stretch: 1.2, tone: 'milk' },
      { target: [1.18, 0.82, -0.22], r: 0.034, stretch: 1.25, tone: 'latte' },
      // Front & upper-center droplets
      { target: [0.46, 0.78, 0.38], r: 0.038, stretch: 1.25, tone: 'milk' },
      { target: [0.76, 0.92, 0.28], r: 0.032, stretch: 1.22, tone: 'latte' },
      { target: [-0.08, 0.74, 0.48], r: 0.03, stretch: 1.2, tone: 'milk' },
      { target: [0.22, 0.96, 0.34], r: 0.026, stretch: 1.15, tone: 'milk' },
      // Left splash arch droplets
      { target: [-0.66, 0.98, 0.14], r: 0.046, stretch: 1.32, tone: 'milk' },
      { target: [-0.94, 0.86, 0.04], r: 0.038, stretch: 1.28, tone: 'latte' },
      { target: [-1.08, 0.62, -0.1], r: 0.032, stretch: 1.24, tone: 'milk' },
      { target: [-0.82, 0.68, 0.32], r: 0.03, stretch: 1.22, tone: 'espresso' },
      { target: [-0.76, 0.72, -0.28], r: 0.032, stretch: 1.25, tone: 'espresso' },
      // Back & rim-hugging fine mist droplets
      { target: [0.88, 0.66, -0.32], r: 0.032, stretch: 1.2, tone: 'latte' },
      { target: [0.54, 0.56, -0.38], r: 0.026, stretch: 1.18, tone: 'milk' },
      { target: [-0.42, 0.58, -0.4], r: 0.025, stretch: 1.15, tone: 'latte' },
      { target: [1.32, 1.12, 0.12], r: 0.024, stretch: 1.18, tone: 'milk' },
      { target: [0.92, 1.18, -0.02], r: 0.028, stretch: 1.22, tone: 'milk' },
      { target: [-0.52, 1.1, 0.02], r: 0.025, stretch: 1.2, tone: 'milk' },
      { target: [1.14, 0.46, 0.32], r: 0.026, stretch: 1.15, tone: 'espresso' },
    ];

    const upAxis = new THREE.Vector3(0, 1, 0);
    return rawSpecs.map((s) => {
      // Orient the teardrop's +Y head along its velocity trajectory vector from cup opening
      const dir = new THREE.Vector3(s.target[0], s.target[1], s.target[2]).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(upAxis, dir);
      const euler = new THREE.Euler().setFromQuaternion(quat);
      return {
        target: s.target,
        scale: [s.r, s.r * s.stretch, s.r] as [number, number, number],
        rot: [euler.x, euler.y, euler.z] as [number, number, number],
        tone: s.tone,
      };
    });
  }, []);

  // 11 Sculpted Matte Crispy Golden French Fries
  const friesList = useMemo(() => {
    const specs = [
      { pos: [-0.26, 0.28, 0.08], rot: [0.08, 0.04, 0.18], h: 0.82, bend: -0.022 },
      { pos: [-0.13, 0.36, 0.1], rot: [0.07, -0.02, 0.09], h: 0.92, bend: -0.014 },
      { pos: [0.01, 0.34, 0.11], rot: [0.08, 0.01, -0.03], h: 0.88, bend: 0.012 },
      { pos: [0.15, 0.3, 0.1], rot: [0.09, 0.03, -0.14], h: 0.84, bend: 0.018 },
      { pos: [0.28, 0.24, 0.07], rot: [0.08, -0.04, -0.25], h: 0.78, bend: 0.025 },
      { pos: [-0.28, 0.42, -0.06], rot: [-0.04, 0.05, 0.14], h: 0.96, bend: -0.02 },
      { pos: [-0.15, 0.5, -0.05], rot: [-0.03, -0.03, 0.07], h: 1.06, bend: -0.012 },
      { pos: [-0.01, 0.48, -0.06], rot: [-0.04, 0.02, -0.02], h: 1.04, bend: 0.01 },
      { pos: [0.13, 0.46, -0.05], rot: [-0.03, 0.03, -0.11], h: 1.0, bend: 0.016 },
      { pos: [0.25, 0.41, -0.06], rot: [-0.04, -0.04, -0.2], h: 0.94, bend: 0.022 },
      { pos: [0.35, 0.32, -0.04], rot: [-0.02, -0.05, -0.3], h: 0.84, bend: 0.028 },
    ];
    return specs.map((s) => ({
      pos: s.pos as [number, number, number],
      rot: s.rot as [number, number, number],
      geo: createCrispyFryGeometry(s.h, s.bend),
    }));
  }, []);

  // 34 Rainbow 3D Capsule Sprinkles + 14 Nonpareil Sugar Pearls on the Pink Donut
  const { chunkySprinkles, sugarPearls } = useMemo(() => {
    const items: Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      color: string;
    }> = [];
    const pearls: Array<{
      pos: [number, number, number];
      color: string;
      r: number;
    }> = [];
    const colors = [
      '#38BDF8',
      '#FACC15',
      '#4ADE80',
      '#F43F5E',
      '#FFFDF9',
      '#C084FC',
    ];
    const majorR = 0.42;
    const tubeR = 0.215;

    for (let i = 0; i < 34; i++) {
      const u = (i * 2.39996 + 0.2) % (Math.PI * 2);
      const norm = ((i * 67) % 100) / 100;
      const phi = (norm - 0.48) * 1.32;

      const r = majorR + tubeR * Math.sin(phi);
      const x = r * Math.cos(u);
      const z = r * Math.sin(u);
      const y = tubeR * Math.cos(phi) + 0.009;

      const yaw = (i * 1.85) % (Math.PI * 2);
      const pitch = Math.PI / 2 + phi * 0.65;
      const roll = ((i * 1.13) % 1.1) - 0.55;

      items.push({
        pos: [x, y, z],
        rot: [pitch, yaw, roll],
        color: colors[i % colors.length],
      });
    }

    const pearlColors = ['#FFFDF9', '#F472B6', '#38BDF8', '#FDE047'];
    for (let i = 0; i < 14; i++) {
      const u = (i * 2.39996 + 1.1) % (Math.PI * 2);
      const norm = ((i * 43 + 17) % 100) / 100;
      const phi = (norm - 0.45) * 1.15;
      const r = majorR + tubeR * Math.sin(phi);
      const x = r * Math.cos(u);
      const z = r * Math.sin(u);
      const y = tubeR * Math.cos(phi) + 0.012;
      pearls.push({
        pos: [x, y, z],
        color: pearlColors[i % pearlColors.length],
        r: 0.02 + (i % 3) * 0.005,
      });
    }

    return { chunkySprinkles: items, sugarPearls: pearls };
  }, []);

  // 7 Floating 3D Roasted Coffee Beans
  const floatingBeans = useMemo(
    () => [
      { pos: [-0.36, 1.38, 0.15], rot: [0.3, 0.4, -0.5] },
      { pos: [-0.52, 0.85, 0.32], rot: [-0.2, 0.5, 0.4] },
      { pos: [-1.58, 0.08, 0.25], rot: [0.4, -0.3, 0.5] },
      { pos: [-1.25, -0.18, 0.35], rot: [-0.3, 0.6, -0.2] },
      { pos: [-1.52, -0.35, 0.28], rot: [0.5, 0.2, -0.6] },
      { pos: [1.48, 0.02, 0.25], rot: [-0.4, -0.5, 0.4] },
      { pos: [1.55, -1.15, 0.22], rot: [0.3, 0.7, -0.4] },
    ],
    []
  );

  // 4 Soft-Beveled White Sugar Cubes with Subsurface Scattering
  const sugarCubes = useMemo(
    () => [
      { pos: [1.18, 1.18, 0.18], rot: [0.4, 0.6, -0.35] },
      { pos: [-0.88, -0.22, 0.38], rot: [-0.35, 0.4, 0.25] },
      { pos: [0.12, -1.12, 0.35], rot: [0.3, -0.5, 0.4] },
      { pos: [-0.18, -1.32, 0.28], rot: [-0.4, 0.3, -0.5] },
    ],
    []
  );

  // Build ONE paused GSAP timeline:
  // 1) Whole cluster + central cup rotate noticeably in 3D & lift higher up, then stop mid-air
  // 2) At "peak", the 360° Liquid Rim Crown swells up, 8 multi-tone splash ribbons unfurl outward,
  //    and 22 teardrop droplets shoot out along their trajectories
  // 3) On pointer leave, tl.reverse() smoothly returns everything to its exact initial resting pose
  useEffect(() => {
    const clusterLift = clusterLiftRef.current;
    const cupLift = icedLatteLiftRef.current;
    const crown = crownMeshRef.current;
    const lid = domeLidRef.current;
    const paperLift = paperCupLiftRef.current;
    const donutLift = donutLiftRef.current;
    const friesLift = friesLiftRef.current;
    const floatersLift = floatersLiftRef.current;
    if (!clusterLift || !cupLift || !crown) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    // Initial hidden state for liquid crown, splash ribbons, and teardrop droplets
    crown.scale.set(0.75, 0.001, 0.75);
    crown.position.set(0, -0.04, 0);

    splashWaveRefs.current.forEach((mesh) => {
      if (!mesh) return;
      mesh.scale.set(0.001, 0.001, 0.001);
      mesh.rotation.y = -0.28;
    });

    dropletRefs.current.forEach((mesh) => {
      if (!mesh) return;
      mesh.position.set(0, 0.04, 0);
      mesh.scale.set(0.001, 0.001, 0.001);
    });

    const tl = gsap.timeline({ paused: true });

    // (a1) Master cluster rotates in 3D and rises upward
    tl.to(
      clusterLift.position,
      {
        y: BASE_CLUSTER_Y + 0.26,
        duration: 0.85,
        ease: 'power3.out',
      },
      0
    ).to(
      clusterLift.rotation,
      {
        x: 0.09,
        y: 0.52,
        z: 0.04,
        duration: 0.85,
        ease: 'power3.out',
      },
      0
    );

    // (a2) Central iced latte cup rises even higher (+0.48 local, so +0.74 total lift!)
    //      and rotates noticeably (+0.78 rad local Y + 3D tilt), then stops
    tl.to(
      cupLift.position,
      {
        y: BASE_CUP_Y + 0.48,
        duration: 0.85,
        ease: 'power3.out',
      },
      0
    ).to(
      cupLift.rotation,
      {
        x: BASE_CUP_ROT_X + 0.1,
        y: BASE_CUP_ROT_Y + 0.78,
        z: BASE_CUP_ROT_Z + 0.14,
        duration: 0.85,
        ease: 'power3.out',
      },
      0
    );

    // Dome lid lifts higher and tilts open as the cup rises so the liquid crown erupts cleanly
    if (lid) {
      tl.to(
        lid.position,
        {
          y: 1.54,
          x: 0.26,
          duration: 0.85,
          ease: 'power3.out',
        },
        0
      ).to(
        lid.rotation,
        {
          z: -0.36,
          y: 0.28,
          duration: 0.85,
          ease: 'power3.out',
        },
        0
      );
    }

    // Surrounding items also lift higher up & rotate noticeably in 3D, then stop & float
    if (paperLift) {
      tl.to(
        paperLift.position,
        { x: -1.26, y: 0.88, z: 0.06, duration: 0.85, ease: 'power3.out' },
        0
      ).to(
        paperLift.rotation,
        { x: 0.28, y: 0.72, z: 0.22, duration: 0.85, ease: 'power3.out' },
        0
      );
    }
    if (donutLift) {
      tl.to(
        donutLift.position,
        { x: -1.18, y: -0.58, z: 0.36, duration: 0.85, ease: 'power3.out' },
        0
      ).to(
        donutLift.rotation,
        { x: 0.74, y: 0.68, z: 0.35, duration: 0.85, ease: 'power3.out' },
        0
      );
    }
    if (friesLift) {
      tl.to(
        friesLift.position,
        { x: 1.24, y: -0.38, z: 0.3, duration: 0.85, ease: 'power3.out' },
        0
      ).to(
        friesLift.rotation,
        { x: 0.24, y: -0.74, z: -0.15, duration: 0.85, ease: 'power3.out' },
        0
      );
    }
    if (floatersLift) {
      tl.to(
        floatersLift.position,
        { y: 0.34, duration: 0.85, ease: 'power3.out' },
        0
      ).to(
        floatersLift.rotation,
        { y: 0.42, z: 0.08, duration: 0.85, ease: 'power3.out' },
        0
      );
    }

    // Label "peak" as the cup reaches the top of its lift
    tl.addLabel('peak', 0.42);

    // (b1) 360° Liquid Rim Crown swells up and flares out of the cup opening
    tl.to(
      crown.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.46,
        ease: 'back.out(1.6)',
      },
      'peak'
    ).to(
      crown.position,
      {
        y: 0,
        duration: 0.46,
        ease: 'power3.out',
      },
      'peak'
    );

    // (b2) 8 Multi-layered milk, latte & espresso splash ribbons whip outward & unfurl
    splashWaveRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      tl.to(
        mesh.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.52,
          ease: 'back.out(1.65)',
        },
        `peak+=${0.03 + idx * 0.022}`
      ).to(
        mesh.rotation,
        {
          y: 0,
          duration: 0.52,
          ease: 'power3.out',
        },
        `peak+=${0.03 + idx * 0.022}`
      );
    });

    // (b3) 22 Teardrop satellite droplets shoot outward and upward along their 3D trajectories
    dropletRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const spec = satelliteDroplets[i];
      if (!spec) return;
      tl.to(
        mesh.position,
        {
          x: spec.target[0],
          y: spec.target[1],
          z: spec.target[2],
          duration: 0.5,
          ease: 'power3.out',
        },
        `peak+=${0.06 + i * 0.016}`
      ).to(
        mesh.scale,
        {
          x: spec.scale[0],
          y: spec.scale[1],
          z: spec.scale[2],
          duration: 0.42,
          ease: 'back.out(1.85)',
        },
        `peak+=${0.06 + i * 0.016}`
      );
    });

    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [satelliteDroplets]);

  // Raycast on pointermove against the static hover zone so the cup never escapes
  // from under the cursor when it rises up, and reverses cleanly when the pointer moves away.
  useEffect(() => {
    const domElement = gl.domElement;

    const setHoveredState = (nextHovered: boolean) => {
      if (nextHovered !== isCupHoveredRef.current) {
        isCupHoveredRef.current = nextHovered;
        onCupHoverChange(nextHovered);
        if (nextHovered) {
          tlRef.current?.timeScale(1).play();
        } else {
          tlRef.current?.timeScale(1.15).reverse();
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!staticHitProxyRef.current) return;
      const rect = domElement.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObject(staticHitProxyRef.current, false);
      setHoveredState(hits.length > 0);
    };

    const handlePointerLeave = () => {
      setHoveredState(false);
    };

    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [camera, gl, onCupHoverChange, pointerNDC, raycaster]);

  // Frame loop:
  // - When hovered at the top: cup, splash waves & treats gently float/levitate in mid-air ("berhenti dan ngambang")
  // - When pointer leaves: hoverFloatWeight smoothly dampens to 0 so the cup settles to its exact base pose
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    const targetWeight = isCupHoveredRef.current ? 1 : 0;
    hoverFloatWeight.current = THREE.MathUtils.lerp(
      hoverFloatWeight.current,
      targetWeight,
      dt * 4.2
    );
    const w = hoverFloatWeight.current;

    if (w > 0.001) {
      hoverFloatPhase.current += dt * 2.4;
    } else {
      hoverFloatPhase.current = 0;
    }
    const p = hoverFloatPhase.current;

    // Cup mid-air levitation ("berhenti dan ngambang") while hovered, returning to 0 when pointer leaves
    if (icedLatteFloatRef.current) {
      icedLatteFloatRef.current.position.y = Math.sin(p) * 0.09 * w;
      icedLatteFloatRef.current.rotation.y = Math.sin(p * 0.75) * 0.075 * w;
      icedLatteFloatRef.current.rotation.z = Math.cos(p * 0.9) * 0.04 * w;
    }

    // Subtle zero-gravity liquid ripple on the frozen splash crown while floating mid-air
    if (splashPulseGroupRef.current) {
      const pulse = 1 + Math.sin(p * 1.6) * 0.035 * w;
      splashPulseGroupRef.current.scale.set(pulse, 1 + Math.cos(p * 1.4) * 0.04 * w, pulse);
      splashPulseGroupRef.current.rotation.y = Math.sin(p * 0.9) * 0.045 * w;
    }

    // Surrounding items gentle float (idle float + enhanced mid-air float when hovered)
    const floatAmp = 0.05 + w * 0.04;
    if (paperCupFloatRef.current) {
      paperCupFloatRef.current.position.y = Math.sin(t * 1.8) * floatAmp;
      paperCupFloatRef.current.rotation.z = Math.cos(t * 1.4) * 0.04 * w;
    }
    if (donutFloatRef.current) {
      donutFloatRef.current.position.y = Math.sin(t * 1.6 + 1.4) * floatAmp;
      donutFloatRef.current.rotation.y = Math.sin(t * 1.3) * 0.06 * w;
    }
    if (friesFloatRef.current) {
      friesFloatRef.current.position.y = Math.sin(t * 1.7 + 2.8) * floatAmp;
      friesFloatRef.current.rotation.z = Math.sin(t * 1.5) * 0.04 * w;
    }
    if (floatersFloatRef.current) {
      floatersFloatRef.current.position.y = Math.sin(t * 1.5 + 0.9) * (0.04 + w * 0.045);
    }
  });

  // Helper to render glossy physically-based fluid material (fast GPU shader, no extra transmission FBO)
  const renderFluidMaterial = (tone: 'milk' | 'latte' | 'espresso') => {
    if (tone === 'espresso') {
      return (
        <meshPhysicalMaterial
          color="#9A5220"
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.02}
          specularIntensity={1}
          envMapIntensity={2.1}
        />
      );
    }
    if (tone === 'latte') {
      return (
        <meshPhysicalMaterial
          color="#DFB484"
          roughness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.025}
          sheen={0.35}
          sheenColor="#FFF6EA"
          envMapIntensity={2.0}
        />
      );
    }
    return (
      <meshPhysicalMaterial
        color="#FAF1E4"
        roughness={0.06}
        clearcoat={1}
        clearcoatRoughness={0.025}
        sheen={0.45}
        sheenColor="#FFFFFF"
        envMapIntensity={2.0}
      />
    );
  };

  return (
    <>
      <StudioEnvironment />
      {/* Soft Studio Lighting with Optimized 1024x1024 Shadow Map */}
      <ambientLight intensity={0.82} />
      <directionalLight
        castShadow
        position={[-4.5, 8.5, 6.2]}
        intensity={2.25}
        color="#FFFDF9"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={18}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[5.2, 2.8, 4.2]} intensity={0.85} color="#E6F7F3" />
      <directionalLight position={[0.4, 5.2, -5.5]} intensity={2.35} color="#FFFFFF" />
      <pointLight position={[0.25, 0.2, 1.15]} intensity={1.15} distance={3.5} color="#FFE4C2" />

      {/* Static Raycast Hit Volume (stays anchored in world space so the cup never escapes the cursor when lifted) */}
      <mesh
        ref={staticHitProxyRef}
        position={[0, -0.14, 0.1]}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const next = !isCupHoveredRef.current;
          isCupHoveredRef.current = next;
          onCupHoverChange(next);
          if (next) {
            tlRef.current?.timeScale(1).play();
          } else {
            tlRef.current?.timeScale(1.15).reverse();
          }
        }}
      >
        <cylinderGeometry args={[1.95, 1.85, 3.6, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={clusterLiftRef} position={[0, BASE_CLUSTER_Y, 0]} scale={0.89}>
        {/* =====================================================================
            1. CENTRAL ICED LATTE CUP (#cup)
               - icedLatteLiftRef: GSAP rotates & lifts higher up, then stops; reverses on leave
               - icedLatteFloatRef: Gently floats in mid-air ("ngambang") while hovered
           ===================================================================== */}
        <group
          ref={icedLatteLiftRef}
          position={[0.04, BASE_CUP_Y, 0]}
          rotation={[BASE_CUP_ROT_X, BASE_CUP_ROT_Y, BASE_CUP_ROT_Z]}
        >
          <group ref={icedLatteFloatRef}>
            {/* External cup.glb loaded via GLTFLoader when available */}
            <group ref={externalGlbGroupRef} visible={hasExternalCupGlb} />

            {/* Built-in Physically-Based Refractive Glass & Volumetric Liquid Cup */}
            <group visible={!hasExternalCupGlb}>
              {/* Deep Volumetric Marbled Espresso & Milk Core Layer */}
              <mesh castShadow receiveShadow position={[0, -0.12, 0]}>
                <cylinderGeometry args={[0.558, 0.388, 1.35, 64]} />
                <meshPhysicalMaterial
                  map={assets.marbledCoffeeTex}
                  roughness={0.18}
                  clearcoat={0.75}
                  clearcoatRoughness={0.1}
                  sheen={0.35}
                  sheenColor="#F6E3CA"
                />
              </mesh>

              {/* Outer Translucent Coffee/Milk Subsurface Volume Layer */}
              <mesh position={[0, -0.115, 0]}>
                <cylinderGeometry args={[0.576, 0.399, 1.37, 64]} />
                <meshPhysicalMaterial
                  map={assets.marbledCoffeeTex}
                  transmission={0.32}
                  thickness={0.26}
                  ior={1.36}
                  attenuationColor="#9E5622"
                  attenuationDistance={0.42}
                  roughness={0.12}
                  clearcoat={0.9}
                  clearcoatRoughness={0.06}
                />
              </mesh>

              {/* Creamy Milk Foam Surface Meniscus Crown */}
              <mesh receiveShadow position={[0, 0.56, 0]} scale={[1, 0.28, 1]}>
                <sphereGeometry args={[0.575, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial
                  color="#F5E9D9"
                  roughness={0.14}
                  clearcoat={0.92}
                  sheen={0.45}
                  sheenColor="#FFFDF9"
                />
              </mesh>

              {/* 5 Sculpted Ice Cubes with Real Internal Refraction */}
              {[
                { pos: [-0.17, 0.68, 0.12], rot: [0.32, 0.42, -0.22], s: 1.0 },
                { pos: [0.17, 0.69, 0.14], rot: [-0.26, 0.62, 0.25], s: 1.0 },
                { pos: [0.01, 0.73, -0.14], rot: [0.22, -0.32, 0.36], s: 0.96 },
                { pos: [-0.22, 0.36, 0.24], rot: [0.45, 0.18, 0.28], s: 0.88 },
                { pos: [0.24, 0.32, 0.22], rot: [-0.35, -0.42, -0.18], s: 0.86 },
              ].map((ice, idx) => (
                <group
                  key={`ice-${idx}`}
                  position={ice.pos as [number, number, number]}
                  rotation={ice.rot as [number, number, number]}
                  scale={ice.s}
                >
                  <mesh castShadow receiveShadow geometry={assets.iceCubeGeo}>
                    <meshPhysicalMaterial
                      color="#FFFDF9"
                      transmission={0.92}
                      thickness={0.34}
                      ior={1.309}
                      roughness={0.055}
                      bumpMap={assets.bumpTex}
                      bumpScale={0.005}
                      clearcoat={1}
                      clearcoatRoughness={0.03}
                      attenuationColor="#FCEAD2"
                      attenuationDistance={0.75}
                      envMapIntensity={2.2}
                    />
                  </mesh>
                  <mesh geometry={assets.iceInnerCoreGeo}>
                    <meshPhysicalMaterial
                      color="#FFF9F0"
                      transparent
                      opacity={0.38}
                      roughness={0.25}
                      ior={1.31}
                    />
                  </mesh>
                </group>
              ))}

              {/* Physical Double-Walled Transparent Plastic Cup with Real Refraction & Condensation */}
              <mesh geometry={assets.clearCupGeo}>
                <meshPhysicalMaterial
                  color="#FFFFFF"
                  transmission={0.94}
                  thickness={0.2}
                  ior={1.49}
                  roughness={0.045}
                  bumpMap={assets.condensationBumpTex}
                  bumpScale={0.0022}
                  clearcoat={1}
                  clearcoatRoughness={0.03}
                  attenuationColor="#F4FBF8"
                  attenuationDistance={2.6}
                  specularIntensity={1}
                  envMapIntensity={2.1}
                />
              </mesh>

              {/* 34 Physical 3D Condensation Water Beads batched in 1 InstancedMesh draw call */}
              <instancedMesh
                ref={condensationMeshRef}
                args={[undefined, undefined, condensationBeads.length]}
              >
                <sphereGeometry args={[1, 10, 8]} />
                <meshPhysicalMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.72}
                  roughness={0.02}
                  clearcoat={1}
                  envMapIntensity={2.2}
                />
              </instancedMesh>

              {/* Spiral-Striped Caramel & Cream Paper Straw */}
              <mesh
                castShadow
                position={[0.24, 1.32, 0.04]}
                rotation={[0.04, 0, -0.22]}
              >
                <cylinderGeometry args={[0.058, 0.058, 1.65, 32]} />
                <meshPhysicalMaterial
                  map={assets.strawTex}
                  bumpMap={assets.paperFiberBumpTex}
                  bumpScale={0.004}
                  roughness={0.44}
                  clearcoat={0.15}
                />
              </mesh>

              {/* Floating Open Double-Walled Refractive Dome Lid */}
              <group
                ref={domeLidRef}
                position={[0.16, 1.24, 0.02]}
                rotation={[0.18, 0.08, -0.24]}
              >
                <mesh geometry={assets.domeLidGeo}>
                  <meshPhysicalMaterial
                    color="#FFFFFF"
                    transmission={0.94}
                    thickness={0.16}
                    ior={1.49}
                    roughness={0.04}
                    clearcoat={1}
                    clearcoatRoughness={0.025}
                    attenuationColor="#F4FBF8"
                    attenuationDistance={2.8}
                    specularIntensity={1}
                    envMapIntensity={2.2}
                  />
                </mesh>
              </group>
            </group>

            {/* =================================================================
                2. FLUID SIMULATION SPLASH SYSTEM (#splash & #droplets)
                   - 360° Sculpted Liquid Rim Crown Sheet
                   - 8 Multi-Tone Sweeping Ribbon Sheets (Milk, Latte, Espresso)
                   - 22 Velocity-Oriented 3D Teardrop Satellite Droplets
               ================================================================= */}
            <group position={[0, 0.58, 0]}>
              <group ref={splashPulseGroupRef}>
                {/* 360° Liquid Rim Crown Wave Sheet */}
                <mesh
                  ref={crownMeshRef}
                  castShadow
                  receiveShadow
                  geometry={assets.liquidCrownGeo}
                  scale={[0.75, 0.001, 0.75]}
                >
                  {renderFluidMaterial('milk')}
                </mesh>

                {/* 8 Sweeping Multi-Tone Fluid Splash Ribbons & Tendrils */}
                {assets.splashWaves.map((wave, idx) => (
                  <mesh
                    key={`splash-wave-${idx}`}
                    ref={(el) => {
                      splashWaveRefs.current[idx] = el;
                    }}
                    castShadow
                    receiveShadow
                    geometry={wave.geo}
                    scale={[0.001, 0.001, 0.001]}
                  >
                    {renderFluidMaterial(wave.tone)}
                  </mesh>
                ))}

                {/* 22 Velocity-Aligned 3D Teardrop Satellite Droplets */}
                {satelliteDroplets.map((drop, idx) => (
                  <mesh
                    key={`drop-${idx}`}
                    ref={(el) => {
                      dropletRefs.current[idx] = el;
                    }}
                    castShadow
                    geometry={assets.teardropGeo}
                    position={[0, 0.04, 0]}
                    rotation={drop.rot}
                    scale={[0.001, 0.001, 0.001]}
                  >
                    {renderFluidMaterial(drop.tone)}
                  </mesh>
                ))}
              </group>
            </group>
          </group>
        </group>

        {/* =====================================================================
            3. SURROUNDING CAFÉ ITEMS
           ===================================================================== */}
        {/* White Takeaway Paper Coffee Cup with Black Lid (Upper-Left) */}
        <group
          ref={paperCupLiftRef}
          position={[-1.15, 0.58, -0.08]}
          rotation={[0.18, 0.25, 0.34]}
          scale={0.86}
        >
          <group ref={paperCupFloatRef}>
            <mesh castShadow receiveShadow geometry={assets.paperCupGeo}>
              <meshPhysicalMaterial
                color="#F4F0EA"
                bumpMap={assets.paperFiberBumpTex}
                bumpScale={0.006}
                roughness={0.56}
                clearcoat={0.08}
                sheen={0.25}
                sheenColor="#FFFDF9"
              />
            </mesh>
            <mesh castShadow receiveShadow geometry={assets.blackLidGeo}>
              <meshPhysicalMaterial
                color="#1F2023"
                bumpMap={assets.bumpTex}
                bumpScale={0.002}
                roughness={0.3}
                clearcoat={0.34}
                clearcoatRoughness={0.22}
                specularIntensity={0.9}
              />
            </mesh>
            <mesh position={[0, 0.725, 0.26]} scale={[1.4, 0.4, 0.7]}>
              <sphereGeometry args={[0.055, 20, 16]} />
              <meshStandardMaterial color="#0A0A0B" roughness={0.65} />
            </mesh>
          </group>
        </group>

        {/* Pink-Glazed Donut with Glossy Subsurface Scattering & Soft Bumps (Lower-Left) */}
        <group
          ref={donutLiftRef}
          position={[-1.08, -0.88, 0.28]}
          rotation={[0.58, 0.18, 0.24]}
          scale={0.96}
        >
          <group ref={donutFloatRef}>
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.42, 0.19, 56, 112]} />
              <meshPhysicalMaterial
                map={assets.donutDoughTex}
                bumpMap={assets.bumpTex}
                bumpScale={0.014}
                roughness={0.48}
                clearcoat={0.08}
                sheen={0.45}
                sheenColor="#FFE2B3"
              />
            </mesh>
            <mesh castShadow receiveShadow geometry={assets.drippingIcingGeo}>
              <meshPhysicalMaterial
                color="#F468AE"
                emissive="#5E0F32"
                emissiveIntensity={0.14}
                bumpMap={assets.bumpTex}
                bumpScale={0.0055}
                roughness={0.11}
                clearcoat={1}
                clearcoatRoughness={0.055}
                sheen={0.55}
                sheenColor="#FFB8DC"
                sheenRoughness={0.25}
              />
            </mesh>
            {chunkySprinkles.map((sp, idx) => (
              <mesh
                key={`sprinkle-${idx}`}
                castShadow
                receiveShadow
                position={sp.pos}
                rotation={sp.rot}
              >
                <capsuleGeometry args={[0.017, 0.062, 8, 14]} />
                <meshPhysicalMaterial
                  color={sp.color}
                  roughness={0.18}
                  clearcoat={0.75}
                  sheen={0.3}
                  sheenColor="#FFFFFF"
                />
              </mesh>
            ))}
            {sugarPearls.map((pr, idx) => (
              <mesh
                key={`pearl-${idx}`}
                castShadow
                receiveShadow
                position={pr.pos}
              >
                <sphereGeometry args={[pr.r, 16, 16]} />
                <meshPhysicalMaterial
                  color={pr.color}
                  roughness={0.14}
                  clearcoat={0.9}
                />
              </mesh>
            ))}
          </group>
        </group>

        {/* Red Paper Carton with Fiber Texture & Matte Crispy Fries (Lower-Right) */}
        <group
          ref={friesLiftRef}
          position={[1.14, -0.68, 0.22]}
          rotation={[0.14, -0.28, -0.24]}
          scale={0.94}
        >
          <group ref={friesFloatRef}>
            <mesh castShadow receiveShadow geometry={assets.fryCartonGeo}>
              <meshPhysicalMaterial
                color="#E32920"
                bumpMap={assets.paperFiberBumpTex}
                bumpScale={0.0085}
                roughness={0.54}
                clearcoat={0.12}
                clearcoatRoughness={0.35}
                sheen={0.22}
                sheenColor="#FF8A80"
              />
            </mesh>
            {friesList.map((fry, idx) => (
              <mesh
                key={`fry-${idx}`}
                castShadow
                receiveShadow
                geometry={fry.geo}
                position={fry.pos}
                rotation={fry.rot}
              >
                <meshPhysicalMaterial
                  map={assets.fryTex}
                  bumpMap={assets.bumpTex}
                  bumpScale={0.016}
                  roughness={0.62}
                  clearcoat={0.05}
                  sheen={0.28}
                  sheenColor="#FFE082"
                />
              </mesh>
            ))}
          </group>
        </group>

        {/* Floating Roasted Coffee Beans & Subsurface Sugar Cubes */}
        <group ref={floatersLiftRef}>
          <group ref={floatersFloatRef}>
            {floatingBeans.map((b, idx) => (
              <mesh
                key={`bean-${idx}`}
                castShadow
                receiveShadow
                geometry={assets.coffeeBeanGeo}
                position={b.pos as [number, number, number]}
                rotation={b.rot as [number, number, number]}
              >
                <meshPhysicalMaterial
                  color="#3B1E0D"
                  bumpMap={assets.bumpTex}
                  bumpScale={0.0085}
                  roughness={0.25}
                  metalness={0.03}
                  clearcoat={0.76}
                  clearcoatRoughness={0.14}
                  specularIntensity={1}
                  specularColor="#FFE4C4"
                />
              </mesh>
            ))}

            {sugarCubes.map((sc, idx) => (
              <mesh
                key={`sugar-${idx}`}
                castShadow
                receiveShadow
                geometry={assets.sugarCubeGeo}
                position={sc.pos as [number, number, number]}
                rotation={sc.rot as [number, number, number]}
              >
                <meshPhysicalMaterial
                  color="#FAF8F5"
                  emissive="#FFFDF9"
                  emissiveIntensity={0.1}
                  bumpMap={assets.bumpTex}
                  bumpScale={0.018}
                  roughness={0.34}
                  clearcoat={0.45}
                  clearcoatRoughness={0.2}
                  sheen={0.65}
                  sheenColor="#FFFFFF"
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </>
  );
};

export const CoffeeMarket3D: React.FC = () => {
  const [cupHovered, setCupHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Automatically pause WebGL rendering when the hero section is scrolled out of view
  // so scrolling down the rest of the page uses 0% WebGL GPU budget.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '120px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-[500px] sm:h-[580px] select-none ${
        cupHovered ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Static Camera, Soft Studio Lighting, Capped DPR & Viewport-Aware Frameloop */}
      <Canvas
        shadows
        frameloop={isVisible ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.1, 6.35], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{ background: 'transparent' }}
      >
        <CafeHero3DScene onCupHoverChange={setCupHovered} />
      </Canvas>
    </div>
  );
};
