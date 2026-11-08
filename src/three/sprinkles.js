// Hero signature moment: a drift of sugar sprinkles in the brand colours,
// floating over the real cake photo. Loaded as its own chunk after first paint.
//
// Budget rules (§7): one InstancedMesh (one draw call), no shadows, no
// post-processing, DPR capped, render loop stops when the canvas is off-screen,
// the tab is hidden, or nothing has moved for a while. Frame time is watched;
// if the device struggles it drops to 'low', then hands back to the static hero.
import {
  WebGLRenderer, Scene, PerspectiveCamera, InstancedMesh, CapsuleGeometry,
  MeshLambertMaterial, HemisphereLight, DirectionalLight, Object3D, Color, Vector2,
} from 'three';

const COLORS = ['#C8401C', '#F5B026', '#FFF1DE', '#E98AA6', '#7A4A8C', '#2B1A14', '#F5B026', '#E98AA6'];
const COUNTS = { high: 240, low: 110 };
const DPR = { high: 1.75, low: 1 };
const IDLE_MS = 9000; // stop rendering after this long without input

export function mountSprinkles(canvas, { tier = 'high', onFallback } = {}) {
  let quality = tier;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: quality === 'high', powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, DPR[quality]));
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 12);
  scene.add(new HemisphereLight('#fff7ec', '#6b3a22', 2.2));
  const sun = new DirectionalLight('#ffffff', 1.6);
  sun.position.set(3, 5, 6);
  scene.add(sun);

  const geo = new CapsuleGeometry(0.06, 0.32, 3, 6);
  const mat = new MeshLambertMaterial();
  const max = COUNTS.high;
  const mesh = new InstancedMesh(geo, mat, max);
  mesh.count = COUNTS[quality];
  scene.add(mesh);

  // Per-sprinkle state in typed arrays (no per-frame allocation).
  const pos = new Float32Array(max * 3), vel = new Float32Array(max * 3), rot = new Float32Array(max * 3), spin = new Float32Array(max * 3);
  const col = new Color();
  const rand = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < max; i++) {
    pos.set([rand(-9, 9), rand(-6, 6), rand(-6, 4)], i * 3);
    vel.set([rand(-0.08, 0.08), rand(-0.35, -0.12), 0], i * 3);
    rot.set([rand(0, 6.3), rand(0, 6.3), rand(0, 6.3)], i * 3);
    spin.set([rand(-1, 1), rand(-1, 1), rand(-1, 1)], i * 3);
    mesh.setColorAt(i, col.set(COLORS[i % COLORS.length]));
  }
  mesh.instanceColor.needsUpdate = true;

  const dummy = new Object3D();
  const pointer = new Vector2(0, 0), target = new Vector2(0, 0);
  let tilt = null;
  let scrollY = 0;
  let w = 1, h = 1;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    wake();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ---- run / pause bookkeeping ----
  let visible = true, raf = 0, last = 0, lastInput = performance.now(), energy = 1;
  const frameTimes = [];
  function wake() {
    lastInput = performance.now();
    if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }, { threshold: 0 });
  io.observe(canvas);
  const onVis = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', onVis);

  const onPointer = (e) => {
    target.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    wake();
  };
  const onScroll = () => { scrollY = window.scrollY; wake(); };
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('scroll', onScroll, { passive: true });

  function tick(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    const frameMs = now - last;
    last = now;

    // Ease to a stop when idle -> then stop the loop entirely (render on demand).
    const idle = now - lastInput > IDLE_MS;
    energy += ((idle ? 0 : 1) - energy) * Math.min(1, dt * (idle ? 0.8 : 3));

    if (tilt) target.set(tilt.x, tilt.y);
    pointer.lerp(target, Math.min(1, dt * 3));
    camera.position.x = pointer.x * 0.8;
    camera.position.y = pointer.y * 0.5 - scrollY * 0.002;
    camera.lookAt(0, -scrollY * 0.002, 0);

    // Pointer in world space at z=0 for a gentle repel.
    const px = pointer.x * 7, py = pointer.y * 4.5;
    for (let i = 0; i < mesh.count; i++) {
      const k = i * 3;
      let x = pos[k] + vel[k] * dt * energy, y = pos[k + 1] + vel[k + 1] * dt * energy, z = pos[k + 2];
      const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
      if (d2 < 4 && energy > 0.05) { const f = (4 - d2) * 0.02 * energy; x += dx * f; y += dy * f; }
      if (y < -7) { y = 7; x = rand(-9, 9); }
      if (x < -10) x = 10; else if (x > 10) x = -10;
      pos[k] = x; pos[k + 1] = y;
      rot[k] += spin[k] * dt * energy; rot[k + 1] += spin[k + 1] * dt * energy; rot[k + 2] += spin[k + 2] * dt * energy;
      dummy.position.set(x, y, z);
      dummy.rotation.set(rot[k], rot[k + 1], rot[k + 2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);

    // Adaptive quality: watch the last 90 frames while actively animating.
    if (energy > 0.9) {
      frameTimes.push(frameMs);
      if (frameTimes.length > 90) {
        frameTimes.shift();
        const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        if (avg > 24 && quality === 'high') {
          quality = 'low'; mesh.count = COUNTS.low; renderer.setPixelRatio(DPR.low); resize(); frameTimes.length = 0;
        } else if (avg > 30 && quality === 'low') {
          dispose(); onFallback?.(); return;
        }
      }
    }

    if (energy > 0.002) raf = requestAnimationFrame(tick);
  }

  async function enableTilt() {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return false;
    if (typeof DOE.requestPermission === 'function') {
      try { if ((await DOE.requestPermission()) !== 'granted') return false; } catch { return false; }
    }
    tilt = { x: 0, y: 0 };
    addEventListener('deviceorientation', onTilt, { passive: true });
    wake();
    return true;
  }
  function onTilt(e) {
    tilt.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
    tilt.y = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 30));
    wake();
  }

  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect(); io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    removeEventListener('pointermove', onPointer);
    removeEventListener('scroll', onScroll);
    removeEventListener('deviceorientation', onTilt);
    geo.dispose(); mat.dispose(); renderer.dispose();
  }

  resize();
  wake();
  return { dispose, enableTilt };
}
