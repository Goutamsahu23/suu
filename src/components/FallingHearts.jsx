import { useEffect, useState } from 'react'

function FallingHearts() {
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const createHeart = () => {
      return {
        id: Math.random(),
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        size: 20 + Math.random() * 30,
        opacity: 0.6 + Math.random() * 0.4,
      }
    }

    // Create initial hearts
    const initialHearts = Array.from({ length: 15 }, createHeart)
    setHearts(initialHearts)

    // Add new hearts periodically
    const interval = setInterval(() => {
      setHearts((prev) => {
        const newHearts = [...prev, createHeart()]
        // Keep only last 20 hearts
        return newHearts.slice(-20)
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute top-0 animate-fall"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
          }}
        >
          <svg
            width={heart.size}
            height={heart.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#FF1493"
              className="animate-pulse"
            />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  )
}

export default FallingHearts
