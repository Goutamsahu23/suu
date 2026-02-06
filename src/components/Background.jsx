function Background() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-pink-950 to-rose-950">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-rose-600/30 animate-pulse" />
      
      {/* Radial gradient glow */}
      <div className="absolute inset-0 bg-radial-gradient from-pink-500/20 via-transparent to-transparent" 
           style={{
             background: 'radial-gradient(circle at center, rgba(255, 20, 147, 0.3) 0%, transparent 70%)'
           }} />
      
      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + i * 10}%`,
              width: `${200 + Math.random() * 100}px`,
              height: `${200 + Math.random() * 100}px`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(255, 20, 147, 0.4) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255, 105, 180, 0.3) 0%, transparent 70%)',
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Background
