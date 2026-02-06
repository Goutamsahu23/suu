import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import WelcomePage from './components/WelcomePage'
import BookGreetingCard from './components/BookGreetingCard'
import Rose3D from './components/Rose3D'
import FallingHearts from './components/FallingHearts'
import Background from './components/Background'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome') // 'welcome', 'book', 'rose'

  const handleEnterBook = () => {
    setCurrentPage('book')
  }

  const handleEnterRose = () => {
    setCurrentPage('rose')
  }

  if (currentPage === 'welcome') {
    return <WelcomePage onEnter={handleEnterBook} />
  }

  if (currentPage === 'book') {
    return <BookGreetingCard onNextPage={handleEnterRose} />
  }

  // Rose 3D page (currentPage === 'rose')
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Background />
      <FallingHearts />
      <div className="absolute inset-0 z-10">
        <Canvas shadows camera={{ position: [0, 150, 250], fov: 33 }}>
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[5, 8, 5]} 
            intensity={1.2} 
            castShadow
            color="#FFFFFF"
          />
          <pointLight position={[0, 150, 250]} intensity={0.8} castShadow color="#FFFFFF" />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#FF69B4" />
          <pointLight position={[0, -5, 5]} intensity={0.4} color="#FFB6C1" />
          <pointLight position={[5, 2, -5]} intensity={0.5} color="#FF1744" />
          <pointLight position={[0, 10, 0]} intensity={0.6} color="#FFFFFF" />
          <OrbitControls
            autoRotate
            autoRotateSpeed={2}
            enableDamping
            enablePan={false}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
          <Rose3D />
        </Canvas>
      </div>
    </div>
  )
}

export default App
