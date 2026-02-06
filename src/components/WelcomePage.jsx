import { useState, useEffect } from 'react'

function WelcomePage({ onEnter }) {
  const [isHovered, setIsHovered] = useState(false)
  const [particles, setParticles] = useState([])

  // Floating particles
  useEffect(() => {
    setParticles(
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 6,
        size: 2 + Math.random() * 4,
      }))
    )
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 via-pink-100 to-rose-100">

      {/* Animated background glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,113,133,0.35),transparent_60%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(244,114,182,0.3),transparent_60%)] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-pink-300 to-rose-400 opacity-60"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px rgba(251,113,133,0.6)`
          }}
        />
      ))}

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-2xl mx-4 sm:mx-6 animate-fade-in-up">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/95 backdrop-blur-xl border-2 border-rose-200/80 shadow-[0_25px_80px_rgba(225,29,72,0.25)] transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_30px_90px_rgba(225,29,72,0.3)]">
          {/* Inner padding container */}
          <div className="relative px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12">
            {/* Border glow - contained inside card */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-pink-400/30 via-rose-400/25 to-pink-500/30 blur-2xl animate-pulse pointer-events-none -z-10" style={{ margin: '-1px' }} />

          {/* Rose icon */}
          <div className="relative text-center mb-4">
            <div className="text-5xl sm:text-6xl animate-bounce" style={{ animationDuration: '2.5s' }}>🌹</div>
            <div className="absolute inset-0 text-5xl sm:text-6xl animate-ping opacity-20">🌹</div>
          </div>

          {/* Title */}
          <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 mb-3 animate-gradient-shift" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            Happy Rose Day ❤️
          </h1>

          {/* Subtitle */}
          <p className="text-center text-base md:text-lg text-gray-800 font-medium mb-5 animate-fade-in-up delay-200" style={{ fontFamily: "'Georgia', serif" }}>
            A little surprise made just for you
          </p>

          {/* Message */}
          <div className="text-center text-gray-700 text-sm md:text-base leading-relaxed space-y-3 px-2 sm:px-4 animate-fade-in-up delay-300" style={{ fontFamily: "'Georgia', serif" }}>
            <p>
              I know I’m a little far away to bring you real roses and come to you today,
              but if I can’t come, my skills surely will 😅💻
            </p>

            <p>
              This is a small Rose Day gift from your coder guy —
              made with a lot of love and a little bit of code.
            </p>

            <p className="font-semibold text-rose-600">
              I truly hope it brings a smile to your face 💕
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-6 flex justify-center animate-fade-in-up delay-500">
            <button
              onClick={onEnter}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative px-10 py-4 rounded-full text-base md:text-lg font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-[0_12px_40px_rgba(225,29,72,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
              
              <span className="relative z-10 flex items-center gap-3">
                Open Your Rose
                <span className={`transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`}>→</span>
              </span>
            </button>
          </div>

          </div>
        </div>
      </div>

      {/* Floating emojis */}
      <span className="absolute top-20 left-16 text-4xl animate-float-slow" style={{ animationDelay: '0s' }}>💖</span>
      <span className="absolute bottom-24 right-20 text-5xl animate-float-slow" style={{ animationDelay: '1s' }}>🌹</span>
      <span className="absolute top-1/3 right-12 text-4xl animate-float-slow" style={{ animationDelay: '2s' }}>💕</span>
      <span className="absolute bottom-1/3 left-16 text-4xl animate-float-slow" style={{ animationDelay: '3s' }}>💝</span>

    </div>
  )
}

export default WelcomePage
