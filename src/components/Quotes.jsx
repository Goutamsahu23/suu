import { useState, useEffect } from 'react'

const quotes = [
  "A rose by any other name would smell as sweet, but none as beautiful as you.",
  "Like a rose, your love blooms in my heart every single day.",
  "Every petal of this rose represents a reason why I love you.",
  "In the garden of my heart, you are the most beautiful rose.",
  "Roses are red, violets are blue, but nothing compares to my love for you.",
  "Your love is like a rose - beautiful, delicate, and forever blooming.",
  "On this Rose Day, I give you my heart wrapped in petals of love.",
  "A single rose can be my garden, a single friend my world - and that friend is you.",
  "The rose speaks of love silently, in a language known only to the heart.",
  "You are the rose that makes my life a beautiful garden.",
]

function Quotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    // Reset displayed text when quote changes
    setDisplayedText('')
    setIsTyping(true)
    
    const currentQuote = quotes[currentQuoteIndex]
    let charIndex = 0
    
    // Typewriter effect
    const typingInterval = setInterval(() => {
      if (charIndex < currentQuote.length) {
        setDisplayedText(currentQuote.substring(0, charIndex + 1))
        charIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 50) // Adjust speed here (lower = faster)

    return () => clearInterval(typingInterval)
  }, [currentQuoteIndex])

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530) // Slightly faster than typing to create blinking effect

    return () => clearInterval(cursorInterval)
  }, [])

  // Change quote after typing is complete
  useEffect(() => {
    if (!isTyping) {
      const timeout = setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length)
      }, 3000) // Show completed quote for 3 seconds before changing

      return () => clearTimeout(timeout)
    }
  }, [isTyping])

  return (
    <div className="absolute bottom-16 left-0 right-0 flex justify-center z-20 px-4">
      <div className="rounded-3xl p-8 max-w-3xl transition-all duration-700 opacity-100 translate-y-0 scale-100 bg-transparent">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl animate-bounce">💕</span>
        </div>
        <p className="text-white text-xl md:text-3xl font-semibold text-center leading-relaxed drop-shadow-lg min-h-[4rem] md:min-h-[6rem] flex items-center justify-center">
          <span>
            "{displayedText}
            {showCursor && (isTyping || !isTyping) && (
              <span className="inline-block w-0.5 h-6 md:h-8 bg-pink-300 ml-1 animate-pulse">|</span>
            )}
            "
          </span>
        </p>
        <div className="flex justify-center mt-6 space-x-2">
          {quotes.map((_, index) => (
            <div
              key={index}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                index === currentQuoteIndex
                  ? 'bg-pink-300 w-10 shadow-lg shadow-pink-400'
                  : 'bg-pink-600 opacity-40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Quotes
