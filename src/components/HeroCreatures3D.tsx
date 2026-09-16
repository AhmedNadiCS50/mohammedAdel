"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroCreatures3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 32);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);

    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = "0.85";
    container.appendChild(canvas);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0x4ade80, 2.2, 80);
    keyLight.position.set(15, 10, 15);
    scene.add(keyLight);

    const goldLight = new THREE.PointLight(0xf3d879, 1.8, 60);
    goldLight.position.set(-15, -8, 10);
    scene.add(goldLight);

    // 4. Glowing 3D Bio-Jellyfish Creatures (قناديل بحر مضيئة تسبح في الفضاء)
    interface Jellyfish {
      group: THREE.Group;
      bell: THREE.Mesh;
      tentacles: THREE.Line[];
      baseY: number;
      baseX: number;
      speed: number;
      phase: number;
    }

    const jellyfishes: Jellyfish[] = [];

    const createJellyfish = (x: number, y: number, z: number, scale: number, colorHex: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.scale.set(scale, scale, scale);

      // Bell (translucent dome with wireframe accents)
      const bellGeo = new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58);
      const bellMat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        transmission: 0.8,
        transparent: true,
        opacity: 0.55,
        wireframe: true,
      });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.rotation.x = Math.PI;
      group.add(bell);

      // Inner glowing core
      const coreGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = -0.5;
      group.add(core);

      // Tentacles with sinusoidal animation
      const tentacles: THREE.Line[] = [];
      const numTentacles = isMobile ? 4 : 7;
      for (let t = 0; t < numTentacles; t++) {
        const points: THREE.Vector3[] = [];
        const segs = 12;
        const angle = (t / numTentacles) * Math.PI * 2;
        const radius = 1.6;
        for (let s = 0; s < segs; s++) {
          points.push(new THREE.Vector3(Math.cos(angle) * radius, -s * 0.8, Math.sin(angle) * radius));
        }
        const tentGeo = new THREE.BufferGeometry().setFromPoints(points);
        const tentMat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
        });
        const tentacle = new THREE.Line(tentGeo, tentMat);
        tentacles.push(tentacle);
        group.add(tentacle);
      }

      scene.add(group);
      return {
        group,
        bell,
        tentacles,
        baseY: y,
        baseX: x,
        speed: 0.025 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
      };
    };

    // Spawn 3 jellyfish creatures positioned around the hero text
    jellyfishes.push(createJellyfish(-18, -4, -6, 0.95, 0x4ade80));
    jellyfishes.push(createJellyfish(19, 6, -10, 0.8, 0x2dd4bf));
    if (!isMobile) {
      jellyfishes.push(createJellyfish(4, -14, -15, 0.65, 0xf3d879));
    }

    // 5. 3D Gliding Manta Ray Creature (كائن مانتا طائر يسبح بأجنحة مرنة)
    const mantaGroup = new THREE.Group();
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 3);
    wingShape.lineTo(6, -1);
    wingShape.lineTo(0, -3.5);
    wingShape.lineTo(-6, -1);
    wingShape.closePath();

    const wingGeo = new THREE.ShapeGeometry(wingShape, 12);
    const wingMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.5,
      roughness: 0.3,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const mantaMesh = new THREE.Mesh(wingGeo, wingMat);
    mantaMesh.rotation.x = -Math.PI / 2.3;
    mantaGroup.add(mantaMesh);

    // Manta tail
    const tailPoints = [
      new THREE.Vector3(0, 0, -3),
      new THREE.Vector3(0, 0, -6),
      new THREE.Vector3(0, 0.2, -9),
      new THREE.Vector3(0, -0.2, -12),
    ];
    const tailGeo = new THREE.BufferGeometry().setFromPoints(tailPoints);
    const tailMat = new THREE.LineBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.7,
    });
    const mantaTail = new THREE.Line(tailGeo, tailMat);
    mantaGroup.add(mantaTail);

    mantaGroup.position.set(-10, 10, -12);
    mantaGroup.scale.set(0.7, 0.7, 0.7);
    scene.add(mantaGroup);

    // 6. Bioluminescent Particle Spores
    const particleCount = isMobile ? 40 : 100;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 50;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x4ade80,
      size: 0.22,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bioParticles = new THREE.Points(pGeo, pMat);
    scene.add(bioParticles);

    // Mouse Tracking for Parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 7. Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.025;

      // Parallax camera easing
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 2.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      // Animate each Jellyfish (Swimming pulsation + tentacle wave)
      jellyfishes.forEach((j) => {
        const t = clock * 1.5 + j.phase;
        // Periodic propulsion pulse
        const contraction = Math.sin(t);
        const pulse = 1 + contraction * 0.22;
        j.bell.scale.set(1 / pulse, pulse, 1 / pulse);

        // Float upwards and reset
        j.group.position.y = j.baseY + Math.sin(clock * 0.7 + j.phase) * 2.8;
        j.group.position.x = j.baseX + Math.cos(clock * 0.5 + j.phase) * 1.5;
        j.group.rotation.z = Math.sin(clock * 0.6 + j.phase) * 0.12;

        // Wave tentacles
        j.tentacles.forEach((tentacle, tIdx) => {
          const pos = tentacle.geometry.attributes.position as THREE.BufferAttribute;
          const count = pos.count;
          for (let s = 1; s < count; s++) {
            const wave = Math.sin(clock * 2.5 + s * 0.45 + tIdx) * (0.15 * s);
            pos.setX(s, pos.getX(s) + (wave - pos.getX(s)) * 0.1);
          }
          pos.needsUpdate = true;
        });
      });

      // Animate Manta Ray (Swimming along an infinity curve & wing flapping)
      const mantaTime = clock * 0.4;
      mantaGroup.position.x = Math.sin(mantaTime) * 16;
      mantaGroup.position.y = Math.cos(mantaTime * 2) * 5 + 4;
      mantaGroup.position.z = Math.cos(mantaTime) * 8 - 10;
      mantaGroup.rotation.y = -Math.cos(mantaTime) * 0.8;
      mantaGroup.rotation.z = Math.sin(mantaTime * 2) * 0.35;

      // Wing flap animation
      const wingFlap = Math.sin(clock * 2.8) * 0.25;
      mantaMesh.scale.y = 1 + wingFlap;

      // Rotate Spores
      bioParticles.rotation.y = clock * 0.04;
      bioParticles.rotation.x = clock * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[6] pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
