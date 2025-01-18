"use client"

import React, { useEffect, useState } from "react"
import {
  GlassyBlurSkeletonProps,
  WindowSize,
  Particle,
  LoadingText,
} from "@/types/props"

const PARTICLE_COUNT = 50

const AnimatedBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        })
      }
      setParticles(newParticles)
    }

    generateParticles()

    const animateParticles = () => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => ({
          ...particle,
          x:
            (particle.x + particle.speedX + window.innerWidth) %
            window.innerWidth,
          y:
            (particle.y + particle.speedY + window.innerHeight) %
            window.innerHeight,
        })),
      )
    }

    const animationInterval = setInterval(animateParticles, 50)

    return () => clearInterval(animationInterval)
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-blue-400"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(96, 165, 250, 0.3)`,
            transition: "all 0.5s linear",
          }}
        />
      ))}
    </div>
  )
}

const AnimatedLoading: React.FC<LoadingText> = ({ text }) => {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <span>
      <span>{text}</span>
      <span>{dots}</span>
    </span>
  )
}

const GlassyBlurSkeleton: React.FC<GlassyBlurSkeletonProps> = ({
  position,
  initialWindowSize,
  opacity = 0.2,
  blur = 16,
  borderRadius = "1rem",
}) => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={`fixed border border-white/25 shadow-2xl backdrop-blur-lg backdrop-filter transition-all duration-300 ease-in-out`}
      style={{
        ...(position.y > 0
          ? {
              top: position.y,
              left: position.x,
              width: initialWindowSize.width,
              height: initialWindowSize.height,
            }
          : {
              inset: 8,
              width: windowSize.width - 16,
              height: windowSize.height - 16,
            }),
        borderRadius,
        backdropFilter: `blur(${blur}px) saturate(150%)`,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        // boxShadow: `
        //   0 10px 30px rgba(0, 0, 0, 0.2),
        //   inset 0 0 30px rgba(255, 255, 255, 0.2),
        //   0 5px 10px rgba(0, 0, 0, 0.1)
        // `,
      }}
    />
  )
}

export { AnimatedBackground, AnimatedLoading, GlassyBlurSkeleton }
