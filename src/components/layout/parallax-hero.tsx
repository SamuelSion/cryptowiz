import { useEffect, useRef } from "react";
import styles from "./parallax-hero.module.css";

// Scroll-driven parallax: layers move at different speeds via rAF.
export default function ParallaxHero() {
  const imageLayerRef = useRef<HTMLDivElement>(null);
  const patternLayerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRequestRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    function updateLayers() {
      const scrollY = window.scrollY;

      if (imageLayerRef.current) {
        imageLayerRef.current.style.transform = `translate3d(0, ${scrollY * 0.4}px, 0)`;
      }
      if (patternLayerRef.current) {
        patternLayerRef.current.style.transform = `translate3d(0, ${scrollY * 0.65}px, 0)`;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${scrollY * -0.15}px, 0)`;
        contentRef.current.style.opacity = `${Math.max(0, 1 - scrollY / 420)}`;
      }

      frameRequestRef.current = null;
    }

    function handleScroll() {
      if (frameRequestRef.current === null) {
        frameRequestRef.current = requestAnimationFrame(updateLayers);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateLayers();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, []);

  return (
    <section className={styles.hero} aria-label="CryptoWiz">
      <div className={styles.imageLayer} ref={imageLayerRef} aria-hidden="true" />
      <div className={styles.patternLayer} ref={patternLayerRef} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.content} ref={contentRef}>
        <p className={styles.eyebrow}>מסוף שוק הקריפטו</p>
        <h1 className={styles.title}>
          CRYPTO<span className={styles.titleGlow}>WIZ</span>
        </h1>
        <p className={styles.tagline}>
          מעקב אחר 100 המטבעות הדיגיטליים המובילים בזמן אמת, דו״חות חיים ומידע קבלת החלטה
          מבוסס AI — הכל במקום אחד.
        </p>
      </div>
    </section>
  );
}
