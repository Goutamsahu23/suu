import { Suspense, useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

// Component to handle the loaded GLB model
function RoseModel({ gltf }) {
  const groupRef = useRef()
  const scaleRef = useRef(0) // Start from scale 0
  const startTimeRef = useRef(null)
  
  // Create realistic rose materials with gradient (old colors)
  const materials = useMemo(() => {
    // Create gradient texture for rose petals
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Create radial gradient from center (lighter red) to edges (deep crimson)
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, '#DC143C') // Lighter crimson at center
    gradient.addColorStop(0.4, '#B22222') // Medium red
    gradient.addColorStop(0.7, '#8B0000') // Deep crimson red
    gradient.addColorStop(1, '#5A0000') // Darker red at edges
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    const gradientTexture = new THREE.CanvasTexture(canvas)
    gradientTexture.needsUpdate = true
    gradientTexture.wrapS = THREE.RepeatWrapping
    gradientTexture.wrapT = THREE.RepeatWrapping
    
    // Deep, rich red rose with gradient texture
    const roseMaterial = new THREE.MeshStandardMaterial({
      map: gradientTexture,
      color: '#F7879A', // Deep crimson red (base color)
      metalness: 0.1,
      roughness: 5.7, // Velvet-like texture
      side: THREE.DoubleSide,
      emissive: '#4A0000',
      emissiveIntensity: 0.15,
    })
    
    // Darker green calyx (the base of the flower)
    const calyxMaterial = new THREE.MeshStandardMaterial({
      color: '#1a4d1a',
      metalness: 0,
      roughness: 0.85,
      side: THREE.DoubleSide
    })
    
    // Natural green leaves
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: '#3d6b3d',
      metalness: 0,
      roughness: 0.75,
      side: THREE.DoubleSide
    })
    
    return { roseMaterial, calyxMaterial, leafMaterial }
  }, [])
  
  // Clone and setup the model
  const clonedModel = useMemo(() => {
    if (!gltf || !gltf.scene) return null
    
    const cloned = gltf.scene.clone()
    
    // Center and normalize the model
    const box = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 110 / maxDim  // Increased from 4 to 20 to make the rose much bigger
    
    // First pass: get bounding box to determine parts
    const meshes = []
    cloned.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child)
      }
    })
    
    // Calculate bounding boxes for all meshes to identify parts by position
    const meshBounds = meshes.map((mesh, index) => {
      const box = new THREE.Box3().setFromObject(mesh)
      const center = box.getCenter(new THREE.Vector3())
      return { mesh, center, minY: box.min.y, maxY: box.max.y, index }
    })
    
    // Sort by Y position (bottom to top)
    meshBounds.sort((a, b) => a.center.y - b.center.y)
    
    // Find the overall bounds
    const overallMinY = Math.min(...meshBounds.map(m => m.minY))
    const overallMaxY = Math.max(...meshBounds.map(m => m.maxY))
    const rangeY = overallMaxY - overallMinY
    
    // Log mesh distribution for debugging
    const totalMeshes = meshBounds.length
    console.log(`=== ROSE MATERIAL ASSIGNMENT ===`)
    console.log(`Total meshes: ${totalMeshes}`)
    console.log(`Y range: ${overallMinY.toFixed(2)} to ${overallMaxY.toFixed(2)} (range: ${rangeY.toFixed(2)})`)
    
    // Use relativeY thresholds directly - simpler and more reliable
    const CALYX_THRESHOLD = 0.15  // Bottom 15% = calyx
    const LEAF_THRESHOLD = 0.35   // 15-35% = leaves/stem
    // Above 35% = rose petals
    
    let calyxAssigned = 0
    let leafAssigned = 0
    let petalAssigned = 0
    
    // Apply materials based on relativeY position - SIMPLE AND DIRECT
    meshBounds.forEach((bounds, sortedIndex) => {
      const mesh = bounds.mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
      
      const relativeY = (bounds.center.y - overallMinY) / rangeY
      
      // Determine material based ONLY on relativeY position
      let selectedMaterial
      if (relativeY < CALYX_THRESHOLD) {
        // Bottom 15% - Calyx (dark green)
        selectedMaterial = materials.calyxMaterial
        calyxAssigned++
      } else if (relativeY < LEAF_THRESHOLD) {
        // 15-35% - Leaves/Stem (natural green)
        selectedMaterial = materials.leafMaterial
        leafAssigned++
      } else {
        // Top 65% - Rose petals (red gradient)
        selectedMaterial = materials.roseMaterial
        petalAssigned++
      }
      
      // Log for first few and last few meshes
      if (sortedIndex < 5 || sortedIndex >= totalMeshes - 5) {
        const matType = selectedMaterial === materials.roseMaterial ? 'PETAL' : 
                        selectedMaterial === materials.calyxMaterial ? 'CALYX' : 'LEAF'
        console.log(`Mesh ${sortedIndex}: Y=${bounds.center.y.toFixed(2)}, relY=${relativeY.toFixed(3)}, Material=${matType}`)
      }
      
      mesh.material = selectedMaterial
      
      // Smooth the geometry for better appearance
      if (mesh.geometry) {
        mesh.geometry.computeVertexNormals()
      }
    })
    
    console.log(`Material assignment: Calyx=${calyxAssigned}, Leaves=${leafAssigned}, Petals=${petalAssigned}`)
    console.log(`=== END MATERIAL ASSIGNMENT ===`)
    
    cloned.position.sub(center.multiplyScalar(scale))
    cloned.scale.setScalar(scale)
    
    // Set initial rotation for better viewing angle
    cloned.rotation.set(-Math.PI / 8, 0, 0)
    
    return cloned
  }, [gltf, materials])

  // Scale-up animation on mount
  useFrame((state) => {
    if (groupRef.current) {
      // Initialize start time on first frame
      if (startTimeRef.current === null) {
        startTimeRef.current = state.clock.elapsedTime
      }
      
      // Calculate animation progress (1 second duration)
      const elapsed = state.clock.elapsedTime - startTimeRef.current
      const duration = 1.2 // 1.2 seconds for smooth scale-up
      const progress = Math.min(1, elapsed / duration)
      
      // Smooth ease-out cubic easing
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      // Animate scale from 0 to 1
      if (progress < 1) {
        scaleRef.current = easeProgress
        groupRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current)
      } else {
        // Animation complete, set to full scale
        if (scaleRef.current < 1) {
          scaleRef.current = 1
          groupRef.current.scale.set(1, 1, 1)
        }
      }
    }
  })

  // Gentle rotation animation
  useFrame((state, delta) => {
    if (groupRef.current && scaleRef.current >= 1) {
      // Only rotate after scale-up animation is complete
      groupRef.current.rotation.y += delta * 0.3
    }
    
    // Very subtle floating animation (only after scale-up)
    if (groupRef.current && scaleRef.current >= 1) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  if (!clonedModel) return null

  return (
    <group ref={groupRef} scale={[0, 0, 0]}>
      <primitive object={clonedModel} />
    </group>
  )
}


// Loading fallback component
function RoseLoading() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#FF69B4" />
    </mesh>
  )
}

// Main Rose3D component with enhanced lighting
export default function Rose3D() {
  return (
    <>
      {/* Enhanced lighting setup for realistic rose appearance */}
      <ambientLight intensity={0.4} />
      
      {/* Key light - main light source */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light - softer light from the side */}
      <directionalLight
        position={[-3, 2, -5]}
        intensity={0.5}
        color="#ffeedd"
      />
      
      {/* Rim light - creates depth and separation */}
      <pointLight
        position={[0, 4, -3]}
        intensity={0.8}
        color="#ffcccc"
      />
      
      {/* Bottom light for subtle illumination */}
      <pointLight
        position={[0, -2, 2]}
        intensity={0.3}
        color="#ffffff"
      />
      
      <Suspense fallback={<RoseLoading />}>
        <Rose3DLoader />
      </Suspense>
    </>
  )
}

// Internal component that loads the GLB model
function Rose3DLoader() {
  const gltf = useLoader(
    GLTFLoader,
    '/rose_colored_gradient.glb'
  )

  return <RoseModel gltf={gltf} />
}