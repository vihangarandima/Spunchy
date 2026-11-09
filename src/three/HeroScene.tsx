// The hero as a 3D scene: "the cabinet at night".
// The real rosette-cake cut-out stands on a glossy dark shelf (with its reflection) under a
// gold spotlight, gold swash ribbons draw themselves around it, out-of-focus cabinet lights
// drift behind and sprinkles float through. The camera follows the pointer (or device
// tilt) and dollies in as the hero scrolls away. `lite` is the phone version.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

const GOLD = '#f7b836'
const NIGHT = '#3a0a12'
const FLOOR_Y = -1.35

export type SceneInput = {
  /** -1..1 pointer (or tilt) position, written by the hero */
  pointer: MutableRefObject<{ x: number; y: number }>
  /** 0..1 hero scroll progress, written by the hero */
  scroll: MutableRefObject<number>
}

/** A soft round sprite for bokeh and glows, drawn once on a canvas. */
function useRadialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, inner)
    grad.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.55)'))
    grad.addColorStop(1, outer)
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [inner, outer])
}

/** Out-of-focus cabinet lights far behind the cake. */
function Bokeh({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const sprite = useRadialTexture()
  const [positions, colours, seeds] = useMemo(() => {
    const p = new Float32Array(count * 3)
    const c = new Float32Array(count * 3)
    const s = new Float32Array(count)
    const palette = ['#f7b836', '#ffd98a', '#fef6f5', '#e8823a', '#f4a3b0'].map((x) => new THREE.Color(x))
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 26
      p[i * 3 + 1] = Math.random() * 9 - 2.5
      p[i * 3 + 2] = -5 - Math.random() * 12
      palette[i % palette.length].toArray(c, i * 3)
      s[i] = Math.random() * Math.PI * 2
    }
    return [p, c, s]
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pos = ref.current!.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) pos.setY(i, positions[i * 3 + 1] + Math.sin(t * 0.25 + seeds[i]) * 0.25)
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
        <bufferAttribute attach="attributes-color" args={[colours, 3]} />
      </bufferGeometry>
      <pointsMaterial map={sprite} vertexColors size={1.1} sizeAttenuation transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </points>
  )
}

/** The cake, its reflection in the glossy shelf, and a slow living sway. */
function Cake({ x, height }: { x: number; height: number }) {
  const tex = useTexture('/hero/cake-1280.webp')
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const img = tex.image as HTMLImageElement
  const aspect = img.width / img.height
  const w = height * aspect
  const group = useRef<THREE.Group>(null)

  // Mirror image under the shelf line, fading out with distance from it.
  const reflection = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: tex }, strength: { value: 0.32 } },
        transparent: true,
        depthWrite: false,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
        fragmentShader:
          'uniform sampler2D map; uniform float strength; varying vec2 vUv; void main(){ vec4 c = texture2D(map, vec2(vUv.x, 1. - vUv.y)); float fade = smoothstep(0.55, 1.0, vUv.y); gl_FragColor = vec4(c.rgb * 0.8, c.a * fade * strength); }',
      }),
    [tex],
  )

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.06
  })

  return (
    <group ref={group} position={[x, FLOOR_Y + height / 2 - height * 0.04, 0]}>
      <mesh renderOrder={2}>
        <planeGeometry args={[w, height]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
      <mesh position={[0, -height + height * 0.08, 0]} renderOrder={0} material={reflection}>
        <planeGeometry args={[w, height]} />
      </mesh>
    </group>
  )
}

/** Glossy dark shelf; slightly see-through so the reflection reads through it. */
function Shelf({ x }: { x: number }) {
  const pool = useRadialTexture('rgba(247,184,54,1)', 'rgba(247,184,54,0)')
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y, 0]} renderOrder={1}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#1c0509" roughness={0.35} metalness={0.4} transparent opacity={0.72} depthWrite={false} />
      </mesh>
      {/* Pool of spotlight on the shelf */}
      <mesh rotation-x={-Math.PI / 2} position={[x, FLOOR_Y + 0.01, 0.2]} renderOrder={1}>
        <planeGeometry args={[5.5, 3.2]} />
        <meshBasicMaterial map={pool} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

/** The track spot from the shop: a soft volumetric cone of gold light from above. */
function Spotlight({ x }: { x: number }) {
  const alpha = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, '#000')
    grad.addColorStop(0.25, '#555')
    grad.addColorStop(1, '#fff')
    g.fillStyle = grad
    g.fillRect(0, 0, 4, 256)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh position={[x, 1.6, -0.4]}>
      <cylinderGeometry args={[0.18, 2.6, 6.2, 48, 1, true]} />
      <meshBasicMaterial color={GOLD} alphaMap={alpha} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

/**
 * A gold swash ribbon spiralling around the cake: thick in the middle and tapered at both
 * ends like the logo swash. It draws itself on, then keeps flowing slowly.
 */
function SwashRibbon({ cx, phase, turns, radius, rise, width, delay }: { cx: number; phase: number; turns: number; radius: number; rise: [number, number]; width: number; delay: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const N = 220
    for (let i = 0; i <= N; i++) {
      const u = i / N
      const a = phase + u * Math.PI * 2 * turns
      const r = radius * (0.85 + 0.25 * Math.sin(u * Math.PI))
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, THREE.MathUtils.lerp(rise[0], rise[1], u) + Math.sin(u * Math.PI * 3) * 0.12, Math.sin(a) * r * 0.55))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const S = 400
    const pos: number[] = []
    const idx: number[] = []
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i <= S; i++) {
      const u = i / S
      const p = curve.getPointAt(u)
      const t = curve.getTangentAt(u)
      const side = new THREE.Vector3().crossVectors(t, up).normalize()
      const n = new THREE.Vector3().crossVectors(side, t).normalize()
      const w = width * Math.pow(Math.sin(Math.PI * u), 0.8) * (0.6 + 0.4 * u) // taper both ends, heavier toward the kick
      pos.push(p.x + n.x * w, p.y + n.y * w, p.z + n.z * w, p.x - n.x * w, p.y - n.y * w, p.z - n.z * w)
      if (i < S) {
        const k = i * 2
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    g.setDrawRange(0, 0)
    return g
  }, [cx, phase, turns, radius, rise, width])

  useFrame((state) => {
    const t = state.clock.elapsedTime - delay
    const total = geometry.index!.count
    const p = THREE.MathUtils.clamp(t / 2.2, 0, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    geometry.setDrawRange(0, Math.floor((total / 6) * eased) * 6)
    if (mesh.current) mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12 + phase) * 0.08
  })

  return (
    <mesh ref={mesh} geometry={geometry} position={[0, 0, 0]}>
      <meshStandardMaterial color={GOLD} metalness={1} roughness={0.18} side={THREE.DoubleSide} envMapIntensity={1.6} emissive="#b77a0c" emissiveIntensity={0.45} />
    </mesh>
  )
}

function Sprinkles({ count, cx }: { count: number; cx: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: cx + (Math.random() - 0.5) * 8,
        y: Math.random() * 4.5 - 1.2,
        z: Math.random() * 3.4 - 1.2,
        r: Math.random() * Math.PI,
        s: 0.6 + Math.random() * 0.9,
        v: 0.12 + Math.random() * 0.28,
      })),
    [count, cx],
  )
  const colours = useMemo(() => {
    const c = new Float32Array(count * 3)
    const palette = ['#f7b836', '#6b2a4a', '#f4a3b0', '#fef6f5'].map((x) => new THREE.Color(x))
    for (let i = 0; i < count; i++) palette[i % palette.length].toArray(c, i * 3)
    return c
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    seeds.forEach((p, i) => {
      // Slow fall that wraps around, with a little drift
      const y = ((p.y - t * p.v * 0.35 + 1.2) % 4.5 + 4.5) % 4.5 - 1.2
      dummy.position.set(p.x + Math.sin(t * p.v + i) * 0.12, y, p.z)
      dummy.rotation.set(p.r + t * p.v, p.r * 0.5, p.r + t * p.v * 0.7)
      dummy.scale.setScalar(p.s)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[0.022, 0.09, 4, 8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colours, 3]} />
      </capsuleGeometry>
      <meshStandardMaterial vertexColors roughness={0.4} metalness={0.15} />
    </instancedMesh>
  )
}

/** Camera follows the pointer a little and dollies toward the cake as the hero scrolls. */
function CameraRig({ input, target }: { input: SceneInput; target: THREE.Vector3 }) {
  const { camera } = useThree()
  const base = useMemo(() => camera.position.clone(), [camera])
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, dt)
    const s = input.scroll.current
    const px = input.pointer.current.x
    const py = input.pointer.current.y
    camera.position.x += (base.x + px * 0.6 - camera.position.x) * k
    camera.position.y += (base.y + py * 0.3 + s * 0.8 - camera.position.y) * k
    camera.position.z += (base.z - s * 2.2 - camera.position.z) * k
    camera.lookAt(target.x + px * 0.15, target.y + s * 0.4, 0)
  })
  return null
}

export default function HeroScene({ input, lite, onReady }: { input: SceneInput; lite: boolean; onReady: () => void }) {
  // Phones: the cake sits centred above the type; desktop: off to the right.
  const cx = lite ? 0 : 1.85
  const cakeHeight = lite ? 1.95 : 2.4
  // Phones aim lower so the cake sits in the top half, above the type.
  const target = useMemo(() => new THREE.Vector3(0, lite ? -1.25 : -0.1, 0), [lite])

  return (
    <Canvas
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      camera={{ position: lite ? [0, 0.9, 8.6] : [0, 0.5, 7.4], fov: lite ? 42 : 36 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.Fog(NIGHT, 9, 24)
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.55} />
      <spotLight position={[cx, 6, 2]} angle={0.5} penumbra={0.9} intensity={60} color="#ffd9a0" />
      <pointLight position={[-4, 2, 3]} intensity={8} color="#f4a3b0" />
      {/* A tiny studio, rendered into the env map locally (no HDR download), for the gold */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} color="#ffe2b0" position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#f7b836" position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#fef6f5" position={[4, 2, 4]} scale={2} />
      </Environment>

      <Suspense fallback={null}>
      <Bokeh count={lite ? 45 : 120} />
      <Shelf x={cx} />
      <Spotlight x={cx} />
      <Cake x={cx} height={cakeHeight} />
      <SwashRibbon cx={cx} phase={-0.6} turns={1.15} radius={lite ? 1.55 : 1.9} rise={[-1.15, 1.25]} width={0.075} delay={0.15} />
      {!lite && <SwashRibbon cx={cx} phase={2.4} turns={0.85} radius={2.35} rise={[1.6, -0.7]} width={0.05} delay={0.6} />}
      <Sprinkles count={lite ? 26 : 60} cx={cx} />
      <CameraRig input={input} target={target} />
      <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}

/** Fires once the first frame with the (suspended) textures has rendered. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    requestAnimationFrame(onReady)
  })
  return null
}
