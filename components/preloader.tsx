"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface PreloaderProps {
  isLoading: boolean
  onAnimationComplete?: () => void
}

export default function Preloader({ isLoading, onAnimationComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (!isVisible && onAnimationComplete) {
          onAnimationComplete()
        }
      }}
    >
      <div className="relative flex flex-col items-center w-64 h-64 max-w-[90vw] max-h-[90vw]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: [0.9, 1, 0.9], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-full h-full relative flex items-center justify-center"
        >
          <Image
            src="https://rimirigamarathon.com/wp-content/uploads/2024/10/logo-black.svg"
            alt="Rimi Riga Marathon Logo"
            width={280}
            height={87}
            priority
            className="w-auto h-auto max-w-full max-h-full"
          />

          <div className="absolute bottom-[-40px] flex space-x-2 justify-center">
            <div className="w-3 h-3 bg-slate-800 rounded-full preloader-dot"></div>
            <div className="w-3 h-3 bg-slate-800 rounded-full preloader-dot"></div>
            <div className="w-3 h-3 bg-slate-800 rounded-full preloader-dot"></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
