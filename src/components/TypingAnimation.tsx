'use client'

import { motion } from 'framer-motion'

export default function TypingAnimation() {
  // Create two layers of petals
  const innerPetals = Array.from({ length: 6 })
  const outerPetals = Array.from({ length: 8 })
  const sparkles = Array.from({ length: 6 })
  const textParticles = Array.from({ length: 8 })

  const petalVariants = {
    initial: { 
      scale: 0,
      opacity: 0,
      rotate: -20
    },
    animate: { 
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [0, -4, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  }

  const sparkleVariants = {
    animate: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: [0, Math.cos(i * Math.PI / 3) * 20],
      y: [0, Math.sin(i * Math.PI / 3) * 20],
      transition: {
        duration: 2,
        delay: i * 0.3,
        repeat: Infinity,
        repeatDelay: 1
      }
    })
  }

  const textParticleVariants = {
    animate: (i: number) => ({
      y: [0, -10, 0],
      x: [0, Math.sin(i) * 10, 0],
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  }

  const textContainerVariants = {
    animate: {
      opacity: 1
    }
  }

  const letterVariants = {
    initial: { 
      opacity: 0
    },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  }

  const dotVariants = {
    animate: {
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "mirror" as const,
        times: [0, 0.5, 1]
      }
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Flower Animation Container */}
      <motion.div 
        className="relative w-20 h-20"
        variants={floatingVariants}
        animate="animate"
      >
        {/* Sparkles */}
        {sparkles.map((_, index) => (
          <motion.div
            key={`sparkle-${index}`}
            className="absolute left-1/2 top-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2"
            custom={index}
            variants={sparkleVariants}
            animate="animate"
          >
            <div className="w-full h-full rounded-full bg-[#00ff88] blur-[0.5px]" />
          </motion.div>
        ))}

        {/* Outer Petals */}
        {outerPetals.map((_, index) => (
          <motion.div
            key={`outer-${index}`}
            className="absolute left-1/2 top-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `rotate(${(360 / outerPetals.length) * index}deg)`
            }}
          >
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
              variants={petalVariants}
              initial="initial"
              animate="animate"
              transition={{
                delay: index * 0.1
              }}
              whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            >
              <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
                <motion.path
                  d="M12 0 C 20 12, 20 24, 12 36 C 4 24, 4 12, 12 0"
                  className="fill-[#00D26A] opacity-60"
                  animate={{
                    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                />
              </svg>
            </motion.div>
          </motion.div>
        ))}

        {/* Inner Petals */}
        {innerPetals.map((_, index) => (
          <motion.div
            key={`inner-${index}`}
            className="absolute left-1/2 top-1/2 w-3/4 h-3/4 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `rotate(${(360 / innerPetals.length) * index + 30}deg)`
            }}
          >
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
              variants={petalVariants}
              initial="initial"
              animate="animate"
              transition={{
                delay: 0.4 + index * 0.1
              }}
              whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            >
              <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
                <motion.path
                  d="M9 0 C 15 9, 15 19, 9 28 C 3 19, 3 9, 9 0"
                  className="fill-[#00ff88] opacity-80"
                  animate={{
                    filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                />
              </svg>
            </motion.div>
          </motion.div>
        ))}

        {/* Flower Center */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            rotate: 360
          }}
          transition={{
            delay: 0.8,
            duration: 0.5,
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        >
          {/* Center Pattern */}
          <div className="w-6 h-6 rounded-full bg-gradient-radial from-[#00ff88] via-[#00D26A] to-[#00ff88]/50 shadow-lg shadow-[#00ff88]/20">
            <motion.div 
              className="absolute inset-1 rounded-full bg-[#00ff88]/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, -360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Text Animation */}
      <div className="relative">
        {/* Floating particles around text */}
        {textParticles.map((_, index) => (
          <motion.div
            key={`particle-${index}`}
            className="absolute w-1 h-1 rounded-full bg-[#00ff88]/30"
            style={{
              left: `${(index * 15)}%`,
              top: '50%'
            }}
            custom={index}
            variants={textParticleVariants}
            animate="animate"
          />
        ))}

        {/* Animated text */}
        <motion.div
          className="relative"
          variants={textContainerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center">
            <span className="text-sm font-medium text-[#00ff88]" style={{ textShadow: '0 0 8px rgba(0, 255, 136, 0.3)' }}>
              Jasmine is thinking
            </span>
            <div className="flex space-x-0.5 ml-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="text-sm font-medium text-[#00ff88] inline-block"
                  variants={dotVariants}
                  animate="animate"
                  style={{
                    textShadow: '0 0 8px rgba(0, 255, 136, 0.3)',
                    animationDelay: `${i * 0.3}s`
                  }}
                >
                  .
                </motion.span>
              ))}
            </div>
          </div>

          {/* Glowing underline */}
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleX: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  )
} 