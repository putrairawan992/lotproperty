import { useEffect, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 28;
const DUST_COUNT = 45;

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
}

export default function HofFallingStars({
  isDark = true,
  mode = "stars",
}: {
  isDark?: boolean;
  mode?: "stars" | "embers";
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 200;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Embers mode: Orange/Red burning sparks. Stars mode: Gold/Yellow stars.
    const starColor = mode === "embers" ? 0xff4500 : (isDark ? 0xffe08a : 0xffd54f);
    const dustColor = mode === "embers" ? 0xff8800 : (isDark ? 0xfff4c2 : 0xffe9a8);

    const linePositions = new Float32Array(STAR_COUNT * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: mode === "embers" ? 0.85 : (isDark ? 0.75 : 0.55),
      blending: THREE.AdditiveBlending,
    });

    const shootingStars = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(shootingStars);

    const stars: Star[] = [];

    const spawnStar = (fromEdge = false) => {
      const x = (Math.random() - 0.5) * width * 1.1;
      let y = (Math.random() - 0.5) * height;
      
      if (fromEdge) {
        if (mode === "embers") {
          // Embers rise from bottom
          y = -height / 2 - Math.random() * 40;
        } else {
          // Stars fall from top
          y = height / 2 + Math.random() * 40;
        }
      }

      const speed = Math.random() * 2.8 + 1.8;
      
      // Embers angle is upwards (PI/2), Stars angle is downwards (-PI/2)
      const baseAngle = mode === "embers" ? Math.PI / 2 : -Math.PI / 2;
      const angle = baseAngle + (Math.random() - 0.5) * 0.55;
      
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: Math.random() * 28 + 18,
      };
    };

    for (let i = 0; i < STAR_COUNT; i++) stars.push(spawnStar());

    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustVel: { vx: number; vy: number }[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * width;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * height;
      dustPositions[i * 3 + 2] = 0;
      
      const vyFactor = mode === "embers" ? 1 : -1; // up for embers, down for stars
      dustVel.push({
        vx: (Math.random() - 0.5) * 0.35,
        vy: vyFactor * (Math.random() * 0.9 + 0.25),
      });
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      color: dustColor,
      size: mode === "embers" ? 3.0 : (isDark ? 2.2 : 1.8),
      transparent: true,
      opacity: mode === "embers" ? 0.8 : (isDark ? 0.55 : 0.4),
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const posAttr = lineGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;

        const tailX = s.x - s.vx * (s.len / 6);
        const tailY = s.y - s.vy * (s.len / 6);

        posAttr.setXYZ(i * 2, tailX, tailY, 0);
        posAttr.setXYZ(i * 2 + 1, s.x, s.y, 0);

        // Check bounds based on direction
        const outOfBounds = mode === "embers"
          ? (s.y > height / 2 + 60 || s.x > width / 2 + 80 || s.x < -width / 2 - 80)
          : (s.y < -height / 2 - 60 || s.x > width / 2 + 80 || s.x < -width / 2 - 80);

        if (outOfBounds) {
          stars[i] = spawnStar(true);
        }
      }
      posAttr.needsUpdate = true;

      const dustAttr = dustGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < DUST_COUNT; i++) {
        let x = dustAttr.getX(i) + dustVel[i].vx;
        let y = dustAttr.getY(i) + dustVel[i].vy;
        
        // Reset bounds based on direction
        const resetBound = mode === "embers"
          ? (y > height / 2 + 10)
          : (y < -height / 2 - 10);

        if (resetBound) {
          y = mode === "embers" ? -height / 2 - Math.random() * 20 : height / 2 + Math.random() * 20;
          x = (Math.random() - 0.5) * width;
        }
        dustAttr.setXYZ(i, x, y, 0);
      }
      dustAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = container.clientWidth || 400;
      height = container.clientHeight || 200;
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      lineGeo.dispose();
      lineMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark, mode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden
    />
  );
}
