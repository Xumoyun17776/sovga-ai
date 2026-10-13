/**
 * Real-time 3D gift box (three.js). Loaded lazily by <Gift3D/> so it never
 * weighs down the first paint. Sapphire lacquer box, champagne-gold ribbon
 * and bow, a few gold pearls orbiting. Follows the pointer gently.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export interface GiftSceneOptions {
  reducedMotion?: boolean;
  dark?: boolean;
}

export function mountGiftScene(container: HTMLElement, opts: GiftSceneOptions = {}) {
  const width = () => container.clientWidth || 1;
  const height = () => container.clientHeight || 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width(), height());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(32, width() / height(), 0.1, 100);
  camera.position.set(0, 0.6, 6.5);
  camera.lookAt(0, 0.1, 0);

  // ── lights ────────────────────────────────────────────────
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f9bff, 2.2);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  const warm = new THREE.PointLight(0xffd59a, 14, 12);
  warm.position.set(2.2, -1.2, 2.5);
  scene.add(warm);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  // ── materials ─────────────────────────────────────────────
  const lacquer = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#163aa8"),
    roughness: 0.28,
    metalness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.85,
  });
  const lidLacquer = lacquer.clone();
  lidLacquer.color = new THREE.Color("#1d47c9");
  const gold = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#e2b866"),
    metalness: 1,
    roughness: 0.24,
    envMapIntensity: 1.35,
  });
  const satin = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#e6c07a"),
    metalness: 0.75,
    roughness: 0.32,
    clearcoat: 0.6,
    envMapIntensity: 1.2,
  });

  // ── gift ──────────────────────────────────────────────────
  const gift = new THREE.Group();
  scene.add(gift);

  const B = 1.7; // box width
  const H = 1.25; // body height
  const body = new THREE.Mesh(new RoundedBoxGeometry(B, H, B, 6, 0.09), lacquer);
  body.position.y = -0.25;
  gift.add(body);

  const lid = new THREE.Mesh(new RoundedBoxGeometry(B + 0.14, 0.36, B + 0.14, 6, 0.08), lidLacquer);
  lid.position.y = body.position.y + H / 2 + 0.14;
  gift.add(lid);

  // ribbon bands (cross over the body and lid)
  const band = 0.26;
  const bandT = 0.03;
  const bodyBandA = new THREE.Mesh(new RoundedBoxGeometry(band, H + 0.01, B + bandT * 2, 2, 0.012), satin);
  bodyBandA.position.copy(body.position);
  const bodyBandB = new THREE.Mesh(new RoundedBoxGeometry(B + bandT * 2, H + 0.01, band, 2, 0.012), satin);
  bodyBandB.position.copy(body.position);
  const lidBandA = new THREE.Mesh(new RoundedBoxGeometry(band, 0.38, B + 0.14 + bandT * 2, 2, 0.012), satin);
  lidBandA.position.copy(lid.position);
  const lidBandB = new THREE.Mesh(new RoundedBoxGeometry(B + 0.14 + bandT * 2, 0.38, band, 2, 0.012), satin);
  lidBandB.position.copy(lid.position);
  gift.add(bodyBandA, bodyBandB, lidBandA, lidBandB);

  // bow: two flattened torus loops + tails + knot
  const bow = new THREE.Group();
  bow.position.y = lid.position.y + 0.2;
  const loopGeo = new THREE.TorusGeometry(0.4, 0.11, 24, 64);
  const loopL = new THREE.Mesh(loopGeo, satin);
  loopL.scale.set(1, 0.7, 0.5);
  loopL.position.set(-0.36, 0.24, 0);
  loopL.rotation.set(0.1, 0.25, 0.42);
  const loopR = loopL.clone();
  loopR.position.x = 0.36;
  loopR.rotation.set(0.1, -0.25, -0.42);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 24), satin);
  knot.scale.set(1.1, 0.85, 0.95);
  knot.position.y = 0.08;
  const tailGeo = new THREE.BoxGeometry(0.2, 0.03, 0.62);
  const tailL = new THREE.Mesh(tailGeo, satin);
  tailL.position.set(-0.14, -0.02, 0.32);
  tailL.rotation.set(0.12, 0.45, 0.05);
  const tailR = tailL.clone();
  tailR.position.x = 0.14;
  tailR.rotation.set(0.12, -0.45, -0.05);
  bow.add(loopL, loopR, knot, tailL, tailR);
  gift.add(bow);

  gift.rotation.set(0.32, -0.6, 0.04);
  gift.scale.setScalar(1);

  // orbiting gold pearls
  const pearls: { mesh: THREE.Mesh; r: number; speed: number; phase: number; y: number }[] = [];
  const pearlGeo = new THREE.SphereGeometry(1, 32, 24);
  [
    { s: 0.11, r: 2.05, speed: 0.38, phase: 0.4, y: 0.9 },
    { s: 0.075, r: 2.35, speed: -0.28, phase: 2.3, y: -0.7 },
    { s: 0.055, r: 1.85, speed: 0.5, phase: 4.1, y: 0.15 },
  ].forEach((p) => {
    const m = new THREE.Mesh(pearlGeo, gold);
    m.scale.setScalar(p.s);
    scene.add(m);
    pearls.push({ mesh: m, r: p.r, speed: p.speed, phase: p.phase, y: p.y });
  });

  // ── interaction ───────────────────────────────────────────
  let tx = 0;
  let ty = 0;
  const onPointer = (e: PointerEvent) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const onResize = () => {
    renderer.setSize(width(), height());
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
    if (opts.reducedMotion) render();
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  // Pause when off-screen or tab hidden.
  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((en) => en.isIntersecting);
  });
  io.observe(container);

  const clock = new THREE.Clock();
  let raf = 0;
  const baseY = -0.6;
  function render() {
    const t = clock.getElapsedTime();
    if (!opts.reducedMotion) {
      gift.rotation.y = baseY + Math.sin(t * 0.35) * 0.35 + tx * 0.35;
      gift.rotation.x = 0.3 + Math.sin(t * 0.5) * 0.04 + ty * 0.12;
      gift.position.y = Math.sin(t * 0.9) * 0.08;
      pearls.forEach((p) => {
        const a = p.phase + t * p.speed;
        p.mesh.position.set(Math.cos(a) * p.r, p.y + Math.sin(t * 0.8 + p.phase) * 0.12, Math.sin(a) * p.r * 0.55);
      });
    } else {
      pearls.forEach((p) => p.mesh.position.set(Math.cos(p.phase) * p.r, p.y, Math.sin(p.phase) * p.r * 0.55));
    }
    renderer.render(scene, camera);
  }
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    render();
  };
  if (opts.reducedMotion) render();
  else loop();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointer);
    ro.disconnect();
    io.disconnect();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    [lacquer, lidLacquer, gold, satin].forEach((m) => m.dispose());
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
