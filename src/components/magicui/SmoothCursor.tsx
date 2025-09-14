"use client";

import React, { FC, JSX, useEffect, useRef, useState } from "react";
import { motion, useSpring, AnimatePresence } from "motion/react";

interface Position { x: number; y: number; }

export interface SmoothCursorProps {
  cursor?: JSX.Element;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
    restDelta: number;
  };
}

const DefaultCursorSVG: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={50} height={54} viewBox="0 0 50 54" fill="none" style={{ scale: 0.5 }}>
    <g filter="url(#filter0_d_91_7928)">
      <path d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z" fill="black"/>
      <path d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z" stroke="white" strokeWidth={2.25825}/>
    </g>
    <defs>
      <filter id="filter0_d_91_7928" x={0.602397} y={0.952444} width={49.0584} height={52.428} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity={0} result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy={2.25825}/>
        <feGaussianBlur stdDeviation={2.25825}/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_91_7928"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_91_7928" result="shape"/>
      </filter>
    </defs>
  </svg>
);

export function SmoothCursor({ cursor = <DefaultCursorSVG />, springConfig = { damping: 45, stiffness: 400, mass: 1, restDelta: 0.001 } }: SmoothCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  const velocity = useRef<Position>({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, { ...springConfig, damping: 60, stiffness: 300 });
  const scale = useSpring(1, { ...springConfig, stiffness: 500, damping: 35 });

  // Arrow trail positions use spring for smooth trailing
  const arrowX = useSpring(0, { damping: 30, stiffness: 200 });
  const arrowY = useSpring(0, { damping: 30, stiffness: 200 });
  const [scrollDir, setScrollDir] = useState<"up" | "down" | null>(null);
  const [arrowRotation, setArrowRotation] = useState(0);

  useEffect(() => {
    setMounted(true);
    setIsDesktop(window.matchMedia("(hover: hover) and (pointer: fine)").matches);

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll("*").forEach(el => (el as HTMLElement).style.cursor = "none");
    }
  }, []);

  useEffect(() => {
    if (!mounted || !isDesktop) return;
    let lastScroll = window.scrollY;
    let timeout: NodeJS.Timeout;
    const onScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll) setScrollDir("down");
      else if (currentScroll < lastScroll) setScrollDir("up");
      lastScroll = currentScroll;

      clearTimeout(timeout);
      timeout = setTimeout(() => setScrollDir(null), 500);
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [mounted, isDesktop]);

  useEffect(() => {
    if (!mounted || !isDesktop) return;

    const updateVelocity = (pos: Position) => {
      const now = Date.now();
      const dt = now - lastUpdateTime.current;
      if (dt > 0) velocity.current = { x: (pos.x - lastMousePos.current.x) / dt, y: (pos.y - lastMousePos.current.y) / dt };
      lastUpdateTime.current = now;
      lastMousePos.current = pos;
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = { x: e.clientX, y: e.clientY };
      updateVelocity(pos);
      cursorX.set(pos.x);
      cursorY.set(pos.y);

      arrowX.set(pos.x);
      arrowY.set(pos.y - 30);

      const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
      if (speed > 0.1) {
        const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;
        let diff = angle - previousAngle.current;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        accumulatedRotation.current += diff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = angle;
        scale.set(0.95);
        setArrowRotation(accumulatedRotation.current);
        setTimeout(() => scale.set(1), 150);
      }
    };

    let rafId: number;
    const throttledMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { onMouseMove(e); rafId = 0; });
    };

    window.addEventListener("mousemove", throttledMove);

    const handleHover = () => scale.set(1.3);
    const handleLeave = () => scale.set(1);
    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", handleHover);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      window.removeEventListener("mousemove", throttledMove);
      if (rafId) cancelAnimationFrame(rafId);
      document.querySelectorAll("a, button").forEach(el => {
        el.removeEventListener("mouseenter", handleHover);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, [mounted, isDesktop]);

  if (!mounted || !isDesktop) return null;

  return (
    <>
      <motion.div
        style={{
          position: "fixed",
          left: cursorX,
          top: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          rotate: rotation,
          scale: scale,
          zIndex: 1000,
          pointerEvents: "none",
          willChange: "transform",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {cursor}
      </motion.div>

      <AnimatePresence>
        {scrollDir && (
          <motion.div
            style={{
              position: "fixed",
              left: arrowX,
              top: arrowY,
              translateX: "-50%",
              translateY: "-50%",
              zIndex: 1001,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: arrowRotation }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
          >
            <span style={{ fontSize: 20, color: "white", fontWeight: "bold" }}>
              {scrollDir === "up" ? "↑" : "↓"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
