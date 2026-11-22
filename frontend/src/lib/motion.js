import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

let lenis;
let tickerCb;
let registered = false;

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  if (registered) return { gsap, ScrollTrigger, lenis };
  gsap.registerPlugin(ScrollTrigger);
  registered = true;

  if (prefersReducedMotion()) {
    ScrollTrigger.defaults({ markers: false });
    return { gsap, ScrollTrigger, lenis: null };
  }

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tickerCb = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tickerCb);
  gsap.ticker.lagSmoothing(0);
  return { gsap, ScrollTrigger, lenis };
}

export function destroyMotion() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  if (tickerCb) gsap.ticker.remove(tickerCb);
  if (lenis) lenis.destroy();
  lenis = undefined;
  tickerCb = undefined;
}
