// Desktop-only hero: the real rosette-cake cut-out as a lit plane in 3D space, tilting
// toward the pointer, with a few sprinkles in the rosette colours drifting around it.
// Loaded lazily; phones and reduced-motion users get the plain <img> instead.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, useTexture } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { largestWebp } from '../lib/images'

const SPRINKLE_COLOURS = ['#f7b836', '#6b2a4a', '#f4a3b0', '#fef6f5']

function Cake({ aspect }: { aspect: number }) {
  const group = useRef<THREE.Group>(null)
  const tex = useTexture(largestWebp('cake-rosettes-cut', 2048))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const { pointer } = useThree()
  // Visible height at z=0 is 2·5.2·tan(19°) ≈ 3.58. The canvas overhangs the image box by
  // 18% per side (×1.36), so the cake is 3.58 / 1.36 ≈ 2.63 to match the <img> it replaces.
  const h = 2.63
  const w = h * aspect

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    // Up to ~6° of tilt toward the pointer, eased; a slow breathing bob on top.
    const k = 1 - Math.pow(0.0015, dt)
    g.rotation.y += (pointer.x * 0.11 - g.rotation.y) * k
    g.rotation.x += (-pointer.y * 0.08 - g.rotation.x) * k
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04
  })

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Sprinkles({ count = 46 }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 7,
        y: (Math.random() - 0.5) * 4.2,
        z: Math.random() * 2.2 - 0.4,
        r: Math.random() * Math.PI,
        s: 0.6 + Math.random() * 0.8,
        v: 0.15 + Math.random() * 0.3,
      })),
    [count],
  )
  const colours = useMemo(() => {
    const c = new Float32Array(count * 3)
    const col = new THREE.Color()
    for (let i = 0; i < count; i++) {
      col.set(SPRINKLE_COLOURS[i % SPRINKLE_COLOURS.length]).toArray(c, i * 3)
    }
    return c
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    seeds.forEach((p, i) => {
      dummy.position.set(p.x + Math.sin(t * p.v + i) * 0.08, p.y + Math.sin(t * p.v * 1.3 + i) * 0.12, p.z)
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
      <meshStandardMaterial vertexColors roughness={0.45} metalness={0.1} />
    </instancedMesh>
  )
}

export default function HeroCake3D({ aspect, onReady }: { aspect: number; onReady: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={() => requestAnimationFrame(onReady)}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[1.5, 3, 4]} intensity={1.6} color="#ffe2b0" />
      <Cake aspect={aspect} />
      <Sprinkles />
      <ContactShadows position={[0, -1.55, 0]} opacity={0.65} scale={6} blur={2.6} far={2.5} color="#120306" />
    </Canvas>
  )
}
