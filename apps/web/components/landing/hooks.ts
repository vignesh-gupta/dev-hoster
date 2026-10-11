"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

const query = "(prefers-reduced-motion: reduce)"

export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/** True once the element has entered the viewport (stays true if `once`). */
export function useInView<T extends Element>(once = true, margin = "0px") {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e!.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) setInView(false)
      },
      { rootMargin: margin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, margin])
  return [ref, inView] as const
}

/**
 * Pointer tilt: writes --tx / --ty (-1..1, relative to the element) so CSS can
 * rotate it. No React re-render per move.
 */
export function usePointerTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    if (!fine) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty("--tx", String(((e.clientX - r.left) / r.width) * 2 - 1))
      el.style.setProperty("--ty", String(((e.clientY - r.top) / r.height) * 2 - 1))
    }
    const leave = () => {
      el.style.setProperty("--tx", "0")
      el.style.setProperty("--ty", "0")
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    return () => {
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
    }
  }, [reduced])
  return ref
}
