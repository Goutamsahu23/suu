import { useState, useRef, useMemo, useEffect, useCallback, memo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const GreetingCard = memo(({ cardIndex, currentCard, swipeOffset, rotation, texture, isSwiping, isAnimating }) => {
  const cardRef = useRef()
  const isTopCard = cardIndex === currentCard
  const isNextCard = cardIndex === currentCard + 1
  const isVisible = cardIndex >= currentCard && cardIndex < currentCard + 2 // Show only top 2 cards for performance
  
  // Calculate z position - stack cards behind each other
  const zOffset = (cardIndex - currentCard) * -0.15
  const baseScale = 1 - (cardIndex - currentCard) * 0.05
  
  // Calculate opacity for smooth fade-in when card becomes current
  const opacity = useMemo(() => {
    if (isTopCard && !isSwiping && !isAnimating) {
      return 1 // Fully visible when settled
    } else if (isNextCard) {
      const swipeDistance = Math.abs(swipeOffset)
      return Math.min(1, 0.7 + (swipeDistance / 8) * 0.3) // Fade in as card appears
    }
    return 0.8 // Slightly transparent when stacked
  }, [isTopCard, isNextCard, isSwiping, isAnimating, swipeOffset])
  
  useFrame(() => {
    if (!cardRef.current || !isVisible) return
    
    if (isTopCard) {
      // Top card follows swipe - only update if values changed
      if (Math.abs(cardRef.current.position.x - swipeOffset) > 0.001) {
        cardRef.current.position.x = swipeOffset
      }
      if (Math.abs(cardRef.current.rotation.z - rotation) > 0.001) {
        cardRef.current.rotation.z = rotation
        cardRef.current.rotation.y = swipeOffset * 0.05
      }
      
      // Scale down slightly as it moves away - smoother scaling
      const swipeDistance = Math.abs(swipeOffset)
      const targetScale = Math.max(0.7, 1 - swipeDistance * 0.04) // Slightly less aggressive
      const currentScale = cardRef.current.scale.x
      if (Math.abs(currentScale - targetScale) > 0.001) {
        // Smooth interpolation for scale
        const newScale = currentScale + (targetScale - currentScale) * 0.2
        cardRef.current.scale.set(newScale, newScale, newScale)
      }
    } else if (isNextCard && (isSwiping || isAnimating)) {
      // Next card pops up as current card is swiped - smoother animation
      const swipeDistance = Math.abs(swipeOffset)
      const maxSwipe = 8
      let swipeProgress = Math.min(1, swipeDistance / maxSwipe)
      
      // Smooth easing for pop-up effect
      swipeProgress = 1 - Math.pow(1 - swipeProgress, 2) // Ease-out quadratic
      
      const popUpScale = baseScale + (1 - baseScale) * swipeProgress
      const popUpZ = zOffset + swipeProgress * 0.15 // More forward movement
      
      // Smooth interpolation
      const currentZ = cardRef.current.position.z
      const currentScale = cardRef.current.scale.x
      const zDiff = Math.abs(currentZ - popUpZ)
      const scaleDiff = Math.abs(currentScale - popUpScale)
      
      if (zDiff > 0.001) {
        cardRef.current.position.z += (popUpZ - currentZ) * 0.15 // Smooth interpolation
      }
      if (scaleDiff > 0.001) {
        const newScale = currentScale + (popUpScale - currentScale) * 0.15
        cardRef.current.scale.set(newScale, newScale, newScale)
      }
    } else {
      // Other stacked cards stay centered - only update if needed
      if (Math.abs(cardRef.current.position.z - zOffset) > 0.001) {
        cardRef.current.position.z = zOffset
      }
      if (Math.abs(cardRef.current.scale.x - baseScale) > 0.001) {
        cardRef.current.scale.set(baseScale, baseScale, baseScale)
      }
    }
  })

  if (!isVisible) return null

  return (
    <group ref={cardRef} position={[0, 0, zOffset]}>
      {/* Card front - single plane to avoid double/ghost text */}
      <mesh castShadow={false} receiveShadow={false}>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial 
          map={texture || null}
          color={texture ? '#ffffff' : '#FFB6C1'}
          roughness={0.4}
          metalness={0}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
    </group>
  )
})

const FloatingHearts = memo(function FloatingHearts() {
  const heartsRef = useRef()
  
  useFrame((state) => {
    if (heartsRef.current) {
      heartsRef.current.rotation.y = state.clock.elapsedTime * 0.15
      heartsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.4
    }
  })

  const heartData = useMemo(() => [
    { pos: [6, 4, 1.5], color: '#FF69B4', emissive: '#FF1493', size: 0.35 },
    { pos: [-6, 3, 1.5], color: '#FFB6C1', emissive: '#FF69B4', size: 0.28 },
    { pos: [5, -4, 1.5], color: '#FF1493', emissive: '#C71585', size: 0.32 },
    { pos: [-5, -3, 1.5], color: '#FFC0CB', emissive: '#FFB6C1', size: 0.25 },
    { pos: [0, 5, 2], color: '#EC4899', emissive: '#DB2777', size: 0.2 },
    { pos: [7, -1, 1], color: '#F472B6', emissive: '#EC4899', size: 0.22 },
    { pos: [-7, 0, 1], color: '#FDA4AF', emissive: '#F472B6', size: 0.26 },
  ], [])

  return (
    <group ref={heartsRef}>
      {heartData.map(({ pos, color, emissive, size }, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshStandardMaterial 
            color={color}
            emissive={emissive}
            emissiveIntensity={0.4}
            transparent
            opacity={0.85}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
})

// Mobile: higher = card follows finger more; lower threshold = shorter swipe to flip
const SWIPE_SENSITIVITY = 0.055
const getSwipeThreshold = () => (typeof window !== 'undefined' ? Math.min(80, window.innerWidth * 0.2) : 80)

function BookGreetingCard({ onNextPage }) {
  const [currentCard, setCurrentCard] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef(null)
  const startXRef = useRef(0)
  const lastDeltaXRef = useRef(0)
  const lastOffsetRef = useRef(0)
  const lastRotationRef = useRef(0)

  const cards = useMemo(() => [
    {
      title: "Happy Rose Day",
      subtitle: "A Special Day",
      content: "On this Rose Day, I just want you to know how grateful I am to have you in my life. You’ve become someone I think about without trying, someone who makes my days lighter just by being there. This rose may fade with time, but what I feel for you only grows stronger. Thank you for being you — for your smile, your care, and the way you make everything feel a little more meaningful.",
      emoji: "🌹"
    },
    {
      title: "For You",
      subtitle: "You are special",
      content: "This rose is just a small reminder of how beautifully you’ve become a part of my life.",
      emoji: "💕"
    },
    {
      title: "With Love",
      subtitle: "Happy Rose Day!",
      content: "One rose for the girl who makes my normal days feel special",
      emoji: ""
    }
  ], [])

  const handleSwipeStart = useCallback((clientX, clientY) => {
    if (isAnimating) return
    startXRef.current = clientX
    lastDeltaXRef.current = 0
    setStartX(clientX)
    setStartY(clientY)
    setIsSwiping(true)
  }, [isAnimating])

  const handleSwipeMove = useCallback((clientX) => {
    if (!isSwiping || isAnimating) return
    const deltaX = clientX - startXRef.current
    lastDeltaXRef.current = deltaX
    const offsetX = deltaX * SWIPE_SENSITIVITY
    const rotZ = deltaX * 0.014
    lastOffsetRef.current = offsetX
    lastRotationRef.current = rotZ
    setSwipeOffset(offsetX)
    setRotation(rotZ)
  }, [isSwiping, isAnimating])

  const handleSwipeEnd = useCallback(() => {
    if (!isSwiping || isAnimating) return
    setIsSwiping(false)
    setIsAnimating(true)
    const deltaPx = lastDeltaXRef.current
    const threshold = getSwipeThreshold()
    if (Math.abs(deltaPx) > threshold) {
      if (currentCard < cards.length - 1) {
        // Any direction swipe - animate card out, then go to next card
        animateCardOutToNext(currentCard + 1)
      } else {
        // Last card - go to rose page
        animateCardOut(() => {
          setTimeout(() => onNextPage(), 300)
        })
        return
      }
    } else {
      // Snap back to center
      animateCardBack()
    }
  }, [isSwiping, isAnimating, currentCard, cards.length, onNextPage])

  // Animate card out of view completely, then change to next card - useCallback
  const animateCardOutToNext = useCallback((nextCard) => {
    const startOffset = lastOffsetRef.current
    const startRotation = lastRotationRef.current
    const direction = lastDeltaXRef.current < 0 ? -1 : 1
    const startTime = performance.now()
    const duration = 500 // Longer duration for smoother transition

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / duration)
      
      // Smooth cubic ease-out function (similar to CSS ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      if (progress < 1) {
        const targetOffset = direction * 20
        const targetRotation = direction * 0.6
        
        const currentOffset = startOffset + (targetOffset - startOffset) * easeProgress
        const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress
        
        setSwipeOffset(currentOffset)
        setRotation(currentRotation)
        requestAnimationFrame(animate)
      } else {
        // Smooth transition: slight delay before changing card for natural feel
        setTimeout(() => {
          setCurrentCard(nextCard)
          setSwipeOffset(0)
          setRotation(0)
          setIsAnimating(false)
        }, 50)
      }
    }
    requestAnimationFrame(animate)
  }, [])

  const animateCardBack = useCallback(() => {
    const startOffset = lastOffsetRef.current
    const startRotation = lastRotationRef.current
    const startTime = performance.now()
    const duration = 400 // Longer for smoother return

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / duration)
      
      // Smooth ease-out-cubic with slight bounce effect
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      // Add slight overshoot for spring effect
      const springProgress = progress < 1 
        ? easeProgress * (1 + 0.1 * Math.sin(progress * Math.PI))
        : 1
      
      if (progress < 1) {
        const currentOffset = startOffset * (1 - springProgress)
        const currentRotation = startRotation * (1 - springProgress)
        setSwipeOffset(currentOffset)
        setRotation(currentRotation)
        requestAnimationFrame(animate)
      } else {
        setSwipeOffset(0)
        setRotation(0)
        lastOffsetRef.current = 0
        lastRotationRef.current = 0
        setIsAnimating(false)
      }
    }
    requestAnimationFrame(animate)
  }, [])

  const animateCardOut = useCallback((callback) => {
    const startOffset = lastOffsetRef.current
    const startRotation = lastRotationRef.current
    const direction = lastDeltaXRef.current < 0 ? -1 : 1
    const startTime = performance.now()
    const duration = 500 // Longer for smoother exit

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / duration)
      
      // Smooth cubic ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      if (progress < 1) {
        const targetOffset = direction * 20
        const targetRotation = direction * 0.6
        const currentOffset = startOffset + (targetOffset - startOffset) * easeProgress
        const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress
        setSwipeOffset(currentOffset)
        setRotation(currentRotation)
        requestAnimationFrame(animate)
      } else {
        setSwipeOffset(0)
        setRotation(0)
        lastOffsetRef.current = 0
        lastRotationRef.current = 0
        setIsAnimating(false)
        if (callback) setTimeout(() => callback(), 100)
      }
    }
    requestAnimationFrame(animate)
  }, [onNextPage])

  // Mouse events
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseDown = (e) => {
      handleSwipeStart(e.clientX, e.clientY)
    }

    const handleMouseMove = (e) => {
      handleSwipeMove(e.clientX)
    }

    const handleMouseUp = () => {
      handleSwipeEnd()
    }

    // Touch events
    const handleTouchStart = (e) => {
      handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      handleSwipeMove(e.touches[0].clientX)
    }

    const handleTouchEnd = () => { handleSwipeEnd() }
    const handleTouchCancel = () => { handleSwipeEnd() }

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseUp)
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseUp)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [handleSwipeStart, handleSwipeMove, handleSwipeEnd])

  // Create card textures - canvas-drawn design
  const cardTextures = useMemo(() => {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = 512 * dpr
    const h = 640 * dpr

    const createTexture = (cardData) => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        ctx.scale(dpr, dpr)
        const cw = 512, ch = 640, cx = 256
        const maxTextWidth = 380
        const contentLineHeight = 19

        const wrapText = (text, font, maxW) => {
          if (!text || !text.trim()) return []
          ctx.font = font
          const words = text.trim().split(/\s+/)
          const lines = []
          let currentLine = ''
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxW) {
              if (currentLine) {
                lines.push(currentLine)
                currentLine = word
              } else {
                lines.push(word)
              }
            } else {
              currentLine = testLine
            }
          }
          if (currentLine) lines.push(currentLine)
          return lines
        }

        // Rich layered background
        const bgGrad = ctx.createRadialGradient(cx, 320, 0, cx, 320, 400)
        bgGrad.addColorStop(0, '#FFFBF7')
        bgGrad.addColorStop(0.4, '#FFF0F5')
        bgGrad.addColorStop(0.7, '#FFE4EC')
        bgGrad.addColorStop(1, '#FFD6E0')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, cw, ch)

        // Subtle pattern overlay (dots)
        ctx.fillStyle = 'rgba(255, 182, 193, 0.15)'
        for (let i = 0; i < 80; i++) {
          const x = (i * 37) % (cw - 40) + 20
          const y = (i * 53) % (ch - 40) + 20
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Corner pattern design - filigree at each corner
        const cornerSize = 155
        const cornerInset = 38
        const drawCornerPattern = (x, y, flipX, flipY) => {
          ctx.save()
          ctx.translate(x, y)
          ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
          const size = cornerSize
          const pink = 'rgba(219, 39, 119, 0.5)'
          const rose = 'rgba(236, 72, 153, 0.35)'
          ctx.strokeStyle = pink
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.moveTo(0, size * 0.3)
          ctx.quadraticCurveTo(size * 0.2, 0, size, 0)
          ctx.moveTo(size * 0.3, 0)
          ctx.quadraticCurveTo(0, size * 0.2, 0, size)
          ctx.stroke()
          ctx.strokeStyle = rose
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(0, size * 0.5)
          ctx.quadraticCurveTo(size * 0.35, 0, size * 0.7, 0)
          ctx.moveTo(size * 0.5, 0)
          ctx.quadraticCurveTo(0, size * 0.35, 0, size * 0.7)
          ctx.stroke()
          ctx.fillStyle = pink
          ;[[size * 0.15, 0], [size * 0.35, 0], [0, size * 0.15], [0, size * 0.35]].forEach(([px, py]) => {
            ctx.beginPath()
            ctx.arc(px, py, 4, 0, Math.PI * 2)
            ctx.fill()
          })
          ctx.fillStyle = rose
          ctx.beginPath()
          ctx.ellipse(size * 0.25, size * 0.25, 8, 4, Math.PI / 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        drawCornerPattern(cornerInset, cornerInset, false, false)
        drawCornerPattern(cw - cornerInset, cornerInset, true, false)
        drawCornerPattern(cornerInset, ch - cornerInset, false, true)
        drawCornerPattern(cw - cornerInset, ch - cornerInset, true, true)

        // Elegant double border
        ctx.strokeStyle = '#DB2777'
        ctx.lineWidth = 4
        ctx.strokeRect(28, 28, 456, 584)
        ctx.strokeStyle = '#F472B6'
        ctx.lineWidth = 1
        ctx.strokeRect(38, 38, 436, 564)

        // All text centered horizontally and vertically
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Precompute all content to measure total height
        const titleLines = wrapText(cardData.title, 'bold 36px Georgia, serif', maxTextWidth)
        const subtitleLines = wrapText(cardData.subtitle, 'italic 20px Georgia, serif', maxTextWidth)
        const contentFont = '16px Georgia, serif'
        const paragraphs = cardData.content.split('\n\n')
        let contentLines = []
        for (const para of paragraphs) {
          const wrapped = wrapText(para, contentFont, maxTextWidth)
          contentLines = contentLines.concat(wrapped)
          contentLines.push('')
        }
        if (contentLines[contentLines.length - 1] === '') contentLines.pop()

        const titleBlockHeight = titleLines.length * 32
        const subtitleBlockHeight = subtitleLines.length * 24
        const contentBlockHeight = contentLines.reduce((h, line) => h + (line === '' ? 6 : contentLineHeight), 0)
        const totalBlockHeight = titleBlockHeight + 18 + subtitleBlockHeight + 16 + 28 + contentBlockHeight

        const contentAreaTop = 60
        const contentAreaBottom = ch - 50
        const blockStartY = contentAreaTop + (contentAreaBottom - contentAreaTop - totalBlockHeight) / 2

        // Title
        ctx.shadowColor = 'rgba(219, 39, 119, 0.2)'
        ctx.shadowBlur = 2
        ctx.shadowOffsetY = 1
        const titleGrad = ctx.createLinearGradient(0, 0, cw, 0)
        titleGrad.addColorStop(0, '#9D174D')
        titleGrad.addColorStop(0.5, '#DB2777')
        titleGrad.addColorStop(1, '#EC4899')
        ctx.fillStyle = titleGrad
        titleLines.forEach((line, i) => {
          ctx.font = 'bold 36px Georgia, serif'
          ctx.fillText(line, cx, blockStartY + i * 32)
        })

        // Subtitle
        ctx.shadowBlur = 0
        ctx.fillStyle = '#BE185D'
        const subtitleStartY = blockStartY + titleBlockHeight + 18
        subtitleLines.forEach((line, i) => {
          ctx.font = 'italic 20px Georgia, serif'
          ctx.fillText(line, cx, subtitleStartY + i * 24)
        })

        // Decorative divider
        const dividerY = subtitleStartY + subtitleBlockHeight + 16
        ctx.strokeStyle = 'rgba(219, 39, 119, 0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([8, 6])
        ctx.beginPath()
        ctx.moveTo(80, dividerY)
        ctx.lineTo(cw - 80, dividerY)
        ctx.stroke()
        ctx.setLineDash([])

        // Content
        ctx.fillStyle = '#831843'
        let contentY = dividerY + 28
        contentLines.forEach((line) => {
          if (line === '') {
            contentY += 6
          } else {
            ctx.font = contentFont
            ctx.fillText(line, cx, contentY)
            contentY += contentLineHeight
          }
        })

        // Swipe hint
        ctx.shadowBlur = 0
        ctx.fillStyle = '#BE185D'
        ctx.font = 'italic 16px "Georgia", serif'
        ctx.fillText('swipe me', cx, ch - 30)

        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        return texture
      } catch (error) {
        console.error('Error creating texture:', error)
        return null
      }
    }

    return cards.map(createTexture)
  }, [cards])

  return (
    <div 
      ref={containerRef}
      className="book-greeting-container"
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 25%, #4a1942 50%, #6b2d5c 75%, #8b3a6b 100%)',
        cursor: isSwiping ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Layered ambient background effects */}
      <div className="book-ambient-bg" />
      <div className="book-ambient-glow book-ambient-glow-1" />
      <div className="book-ambient-glow book-ambient-glow-2" />
      {/* Rising bubbles - float up and fade midway */}
      {[...Array(28)].map((_, i) => (
        <div
          key={i}
          className="book-bubble"
          style={{
            left: `${(i * 7 + 3) % 94 + 3}%`,
            width: `${12 + (i % 5) * 8}px`,
            height: `${12 + (i % 5) * 8}px`,
            animationDelay: `${(i * 0.8) % 6}s`,
            animationDuration: `${6 + (i % 4)}s`,
          }}
        />
      ))}
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      >
        {/* Rich lighting for cards - warm rose tones */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[8, 8, 6]}
          intensity={1.1}
          color="#FFF5F7"
          castShadow={false}
        />
        <pointLight position={[-8, -6, 4]} intensity={0.5} color="#FFB6C1" />
        <pointLight position={[6, 4, 3]} intensity={0.35} color="#F472B6" />

        {/* Cards - stacked */}
        {cards.map((card, index) => {
          if (!cardTextures[index]) return null
          return (
            <GreetingCard
              key={index}
              cardIndex={index}
              currentCard={currentCard}
              swipeOffset={swipeOffset}
              rotation={rotation}
              texture={cardTextures[index]}
              totalCards={cards.length}
              isSwiping={isSwiping}
              isAnimating={isAnimating}
            />
          )
        })}

        {/* Floating hearts */}
        <FloatingHearts />

        {/* Sparkles - elegant rose-toned shimmer */}
        <Sparkles
          count={50}
          scale={18}
          size={1.2}
          speed={0.4}
          color="#FFB6C1"
          opacity={0.9}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>

      {/* Instructions - elegant glass pill */}
      <div 
        className="book-instructions"
        style={{
          position: 'absolute',
          bottom: '40px',
          zIndex: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#FFF5F7',
          fontSize: '22px',
          fontFamily: '"Georgia", "Times New Roman", serif',
          textAlign: 'center',
          background: 'rgba(26, 10, 46, 0.6)',
          padding: '18px 36px',
          borderRadius: '9999px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 182, 193, 0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset',
          pointerEvents: 'none',
          letterSpacing: '0.02em'
        }}
      >
        {currentCard < cards.length - 1 ? (
          <span style={{ fontWeight: 300 }}>🌹Swipe🌹</span>
        ) : (
          <span style={{ fontWeight: 300 }}>🌹Swipe🌹</span>
        )}
      </div>

      {/* Card indicator - refined badge */}
      <div 
        className="book-card-indicator"
        style={{
          position: 'absolute',
          top: '28px',
          zIndex: 10,
          right: '28px',
          color: '#FFF5F7',
          fontSize: '15px',
          fontFamily: '"Georgia", serif',
          background: 'rgba(26, 10, 46, 0.55)',
          padding: '12px 22px',
          borderRadius: '12px',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 182, 193, 0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
          letterSpacing: '0.03em'
        }}
      >
        {currentCard + 1} / {cards.length}
      </div>

    </div>
  )
}

export default BookGreetingCard
