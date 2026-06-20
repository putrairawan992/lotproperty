import { useEffect, useRef } from "react";
import * as THREE from "three";

function hexToThree(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  return Number.isNaN(n) ? 0xe8a500 : n;
}

export default function PodiumAvatarGlow({
  color,
  width,
  height,
  intensity = 1,
}: {
  color: string;
  width: number;
  height: number;
  intensity?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || width < 16 || height < 8) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      100,
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const threeColor = hexToThree(color);
    const RAY_COUNT = 14;

    const linePositions = new Float32Array(RAY_COUNT * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.32 * intensity,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    const glowGeo = new THREE.CircleGeometry(Math.min(width * 0.12, 14), 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.38 * intensity,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, height / 2 - 6, 0);
    scene.add(glow);

    const haloGeo = new THREE.RingGeometry(4, Math.min(width * 0.2, 22), 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.18 * intensity,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, -height / 2 + 4, 0);
    scene.add(halo);

    let t = 0;
    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      t += 0.016;

      const pulse = 0.72 + Math.sin(t * 2.2) * 0.28;
      lineMat.opacity = 0.28 * pulse * intensity;
      glowMat.opacity = 0.34 * pulse * intensity;
      haloMat.opacity = 0.14 * pulse * intensity;
      glow.scale.setScalar(0.85 + pulse * 0.35);
      halo.scale.setScalar(0.9 + pulse * 0.2);

      const topY = height / 2 - 2;
      const bottomY = -height / 2 + 2;
      const posAttr = lineGeo.getAttribute("position") as THREE.BufferAttribute;

      for (let i = 0; i < RAY_COUNT; i++) {
        const tNorm = i / (RAY_COUNT - 1);
        const spread = (tNorm - 0.5) * width * 0.62;
        const topSpread = spread * 0.12;
        posAttr.setXYZ(i * 2, topSpread, topY, 0);
        posAttr.setXYZ(i * 2 + 1, spread, bottomY, 0);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      lineGeo.dispose();
      lineMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [color, width, height, intensity]);

  return (
    <div
      ref={mountRef}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{
        width,
        height,
        top: -height * 0.52,
        zIndex: 2,
      }}
      aria-hidden
    />
  );
}
