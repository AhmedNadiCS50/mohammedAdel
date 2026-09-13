"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    /* Gold particles field (lighter on mobile) */
    const count = isMobile ? 55 : 160;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.09,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(particleGeo, particleMat);
    scene.add(points);

    /* Floating geometric shapes (fewer on mobile) */
    const shapes: { mesh: THREE.Mesh; speed: number; baseY: number; baseX: number }[] = [];
    const defs = [
      { geo: new THREE.TorusGeometry(1.5, 0.045, 12, 60), y: 3.4 },
      { geo: new THREE.IcosahedronGeometry(0.95, 0), y: -3.6 },
      { geo: new THREE.TorusKnotGeometry(0.72, 0.22, 70, 12), y: 0.5 },
      { geo: new THREE.OctahedronGeometry(0.62, 0), y: -1.7 },
    ].slice(0, isMobile ? 2 : 4);
    for (const def of defs) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.25,
        transparent: true,
        opacity: 0.42,
      });
      const mesh = new THREE.Mesh(def.geo, mat);
      const baseX = (Math.random() - 0.5) * 10;
      mesh.position.set(baseX, def.y, -2.5);
      shapes.push({ mesh, speed: 0.2 + Math.random() * 0.3, baseY: def.y, baseX });
      scene.add(mesh);
    }

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xf3d879, 1.7);
    key.position.set(5, 5, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0x2d6a4f, 1.3, 30);
    rim.position.set(-6, -4, 4);
    scene.add(rim);

    /* Pointer + scroll */
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scroll = 0;
    const onMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      scroll = window.scrollY;
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();
    const animate = () => {
      if (!running) return;
      const t = clock.getElapsedTime();
      if (!reduced) {
        targetX += (mouseX - targetX) * 0.045;
        targetY += (mouseY - targetY) * 0.045;

        points.rotation.y = t * 0.045;
        points.rotation.x = Math.sin(t * 0.1) * 0.12;
        points.position.y = Math.sin(t * 0.25) * 0.4;

        for (const s of shapes) {
          s.mesh.rotation.x += s.speed * 0.005;
          s.mesh.rotation.y += s.speed * 0.008;
          s.mesh.position.y = s.baseY + Math.sin(t * 0.6 + s.baseY) * 0.4;
          const nx = s.baseX + Math.sin(t * 0.35 + s.baseY) * 1.2;
          s.mesh.position.x = nx;
        }

        camera.position.x += (targetX * 1.6 - camera.position.x) * 0.03;
        camera.position.y += (-targetY * 1.6 - camera.position.y) * 0.03;
        camera.rotation.z = -(scroll * 0.00035);
        camera.position.z = 14 + Math.sin(t * 0.15) * 0.5;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    /* Pause rendering while the tab is hidden (battery friendly) */
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        raf = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const s of shapes) {
        s.mesh.geometry.dispose();
        (s.mesh.material as THREE.Material).dispose();
      }
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    />
  );
}