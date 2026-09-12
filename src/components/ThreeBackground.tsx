"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Scene, Camera & Renderer ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Dynamic Lights ──
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.2);
    scene.add(ambientLight);

    const mintLight = new THREE.PointLight(0x00f5a0, 2.5, 120);
    mintLight.position.set(20, 20, 25);
    scene.add(mintLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2.0, 100);
    emeraldLight.position.set(-25, -15, 20);
    scene.add(emeraldLight);

    const jadeLight = new THREE.PointLight(0x059669, 1.8, 90);
    jadeLight.position.set(0, -25, 15);
    scene.add(jadeLight);

    // ── 1. Ambient Bioluminescent Spores (Particles) ──
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number; phase: number }[] = [];

    const palette = [
      new THREE.Color(0x00f5a0),
      new THREE.Color(0x10b981),
      new THREE.Color(0x34d399),
      new THREE.Color(0x059669),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: Math.random() * 0.05 + 0.02,
        z: (Math.random() - 0.5) * 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite using canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(0, 245, 160, 0.8)');
      grad.addColorStop(0.8, 'rgba(16, 185, 129, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      map: particleTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── 2. Crystal Bio-Jellyfish (Parametric Bell + Sinusoidal Tentacles) ──
    interface Jellyfish {
      group: THREE.Group;
      bell: THREE.Mesh;
      tentacles: THREE.Line[];
      startY: number;
      speed: number;
      phase: number;
      x: number;
      z: number;
    }

    const jellyfishes: Jellyfish[] = [];

    const createJellyfish = (x: number, y: number, z: number, scale: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.scale.set(scale, scale, scale);

      // Bell (translucent dome)
      const bellGeo = new THREE.SphereGeometry(3, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const bellMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f5a0,
        emissive: 0x059669,
        emissiveIntensity: 0.8,
        roughness: 0.15,
        transmission: 0.7,
        thickness: 1.2,
        transparent: true,
        opacity: 0.65,
        wireframe: true,
      });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.rotation.x = Math.PI;
      group.add(bell);

      // Tentacles
      const tentacles: THREE.Line[] = [];
      const numTentacles = 6;
      for (let t = 0; t < numTentacles; t++) {
        const points: THREE.Vector3[] = [];
        const segs = 14;
        const angle = (t / numTentacles) * Math.PI * 2;
        const radius = 2.2;
        for (let s = 0; s < segs; s++) {
          points.push(new THREE.Vector3(Math.cos(angle) * radius, -s * 1.0, Math.sin(angle) * radius));
        }
        const tentGeo = new THREE.BufferGeometry().setFromPoints(points);
        const tentMat = new THREE.LineBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.55,
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
        startY: y,
        speed: 0.03 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        x,
        z,
      };
    };

    jellyfishes.push(createJellyfish(-35, -20, 10, 0.9));
    jellyfishes.push(createJellyfish(32, -10, 5, 0.75));
    jellyfishes.push(createJellyfish(-15, -30, -10, 0.6));

    // ── 3. Gliding Manta Ray / Creature ──
    const mantaGroup = new THREE.Group();
    const mantaBodyGeo = new THREE.ConeGeometry(3, 8, 4);
    const mantaMat = new THREE.MeshPhysicalMaterial({
      color: 0x059669,
      emissive: 0x00f5a0,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6,
      roughness: 0.2,
      wireframe: true,
    });
    const mantaBody = new THREE.Mesh(mantaBodyGeo, mantaMat);
    mantaBody.rotation.z = Math.PI / 2;
    mantaGroup.add(mantaBody);
    mantaGroup.position.set(20, 15, -15);
    scene.add(mantaGroup);

    // ── 4. Flank Bio-Kelp Tendrils (Side Margins) ──
    const kelpLines: { line: THREE.Line; baseY: number; phase: number }[] = [];
    const createKelpColumn = (startX: number, count: number) => {
      for (let k = 0; k < count; k++) {
        const segs = 18;
        const pts: THREE.Vector3[] = [];
        const xOffset = startX + (Math.random() - 0.5) * 8;
        const zOffset = (Math.random() - 0.5) * 20;
        for (let s = 0; s < segs; s++) {
          pts.push(new THREE.Vector3(xOffset, -40 + s * 4.5, zOffset));
        }
        const kelpGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const kelpMat = new THREE.LineBasicMaterial({
          color: k % 2 === 0 ? 0x00f5a0 : 0x059669,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(kelpGeo, kelpMat);
        scene.add(line);
        kelpLines.push({ line, baseY: -40, phase: Math.random() * Math.PI * 2 });
      }
    };

    createKelpColumn(-52, 6);
    createKelpColumn(52, 6);

    // ── Mouse Camera Parallax (Lerp) ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── Resize Handler ──
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation Loop ──
    let animId: number;
    let time = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.02;

      // Camera Lerp
      targetX += (mouseX * 8 - targetX) * 0.05;
      targetY += (mouseY * 6 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Animate Bioluminescent Spores
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const vel = velocities[i];
        let py = posAttr.getY(i) + vel.y;
        let px = posAttr.getX(i) + Math.sin(time + vel.phase) * 0.03;
        let pz = posAttr.getZ(i) + Math.cos(time + vel.phase) * 0.02;

        if (py > 55) py = -55;
        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;

      // Animate Jellyfishes
      jellyfishes.forEach((jelly) => {
        const pulse = Math.sin(time * 2.5 + jelly.phase);
        jelly.bell.scale.set(1 + pulse * 0.15, 1 - pulse * 0.1, 1 + pulse * 0.15);
        jelly.group.position.y += jelly.speed * (1 + (pulse > 0 ? pulse : 0) * 1.2);
        jelly.group.rotation.y = Math.sin(time * 0.5 + jelly.phase) * 0.2;

        if (jelly.group.position.y > 45) {
          jelly.group.position.y = -45;
        }

        // Undulating Tentacles
        jelly.tentacles.forEach((tentacle, ti) => {
          const tentPos = tentacle.geometry.attributes.position as THREE.BufferAttribute;
          const count = tentPos.count;
          for (let s = 1; s < count; s++) {
            const wave = Math.sin(time * 3 + s * 0.5 + ti) * (s * 0.12);
            tentPos.setX(s, tentPos.getX(0) + wave);
            tentPos.setZ(s, tentPos.getZ(0) + Math.cos(time * 3 + s * 0.5 + ti) * (s * 0.12));
          }
          tentPos.needsUpdate = true;
        });
      });

      // Animate Manta Ray
      mantaGroup.position.x = Math.sin(time * 0.4) * 35;
      mantaGroup.position.y = 12 + Math.cos(time * 0.6) * 8;
      mantaGroup.rotation.y = -Math.cos(time * 0.4) * 0.8;
      mantaGroup.rotation.z = Math.sin(time * 1.5) * 0.25; // Wing flap tilt

      // Animate Kelp Sway
      kelpLines.forEach((kelp) => {
        const kPos = kelp.line.geometry.attributes.position as THREE.BufferAttribute;
        for (let s = 1; s < kPos.count; s++) {
          const sway = Math.sin(time * 1.2 + s * 0.3 + kelp.phase) * (s * 0.35);
          kPos.setX(s, kPos.getX(0) + sway);
        }
        kPos.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <canvas
      id="threeBgCanvas"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
}
